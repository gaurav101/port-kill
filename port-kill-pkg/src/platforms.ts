/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { execSync } from 'child_process';
import { PortKillOptions, PortKillResult } from './types';

/**
 * Creates a standard logger formatting helpers.
 */
function createLogger(options: PortKillOptions) {
  const isVerbose = !!options.verbose;
  const customLogger = options.logger;

  return (message: string, level: 'info' | 'warn' | 'error' | 'debug' = 'info') => {
    if (!isVerbose && level === 'debug') return;
    
    const formatted = `[port-kill] [${level.toUpperCase()}] ${message}`;
    if (customLogger) {
      customLogger(message, level);
    } else {
      switch (level) {
        case 'error':
          console.error(formatted);
          break;
        case 'warn':
          console.warn(formatted);
          break;
        case 'info':
        case 'debug':
        default:
          console.log(formatted);
          break;
      }
    }
  };
}

/**
 * Executes a shell command synchronously and returns the output as a clean string.
 * Suppresses standard stderr noise unless verbose is enabled.
 */
function runCommand(command: string, log: ReturnType<typeof createLogger>): { stdout: string; success: boolean; error?: string } {
  try {
    log(`Executing system command: "${command}"`, 'debug');
    const stdout = execSync(command, { stdio: ['pipe', 'pipe', 'ignore'], encoding: 'utf8' });
    return { stdout: stdout || '', success: true };
  } catch (err: any) {
    const errMsg = err?.message || String(err);
    log(`Command failed or returned non-zero code. Error: ${errMsg}`, 'debug');
    return { stdout: '', success: false, error: errMsg };
  }
}

/**
 * Finds PIDs listening on a port on Unix-like systems (macOS, Linux).
 */
function findPidsUnix(port: number, log: ReturnType<typeof createLogger>): number[] {
  // Use "lsof -t -n -i :<port>" to instantly query numeric PIDs without DNS lookups
  const lsofCmd = `lsof -t -n -i :${port}`;
  const { stdout, success } = runCommand(lsofCmd, log);
  
  if (success && stdout.trim()) {
    const pids = stdout
      .split('\n')
      .map(line => parseInt(line.trim(), 10))
      .filter(pid => !isNaN(pid));
    
    log(`lsof found PIDs on port ${port}: [${pids.join(', ')}]`, 'debug');
    return pids;
  }

  // Fallback to "fuser" on Linux if lsof wasn't successful or available
  log(`lsof yielded no active PIDs for port ${port}. Trying alternative "fuser" fallback...`, 'debug');
  const fuserCmd = `fuser ${port}/tcp`;
  const fuserResult = runCommand(fuserCmd, log);
  
  if (fuserResult.stdout.trim()) {
    const pids = fuserResult.stdout
      .split(/\s+/)
      .map(part => parseInt(part.trim(), 10))
      .filter(pid => !isNaN(pid));
    
    if (pids.length > 0) {
      log(`fuser fallback successfully identified PIDs on port ${port}: [${pids.join(', ')}]`, 'debug');
      return pids;
    }
  }

  log(`No processes identified on port ${port} via lsof or fuser.`, 'debug');
  return [];
}

/**
 * Finds PIDs listening on a port on Windows systems.
 */
function findPidsWindows(port: number, log: ReturnType<typeof createLogger>): number[] {
  const netstatCmd = 'netstat -ano';
  const { stdout, success } = runCommand(netstatCmd, log);
  
  if (!success || !stdout) {
    log('Failed to query active TCP sockets using netstat on Windows.', 'warn');
    return [];
  }

  const pids: number[] = [];
  const lines = stdout.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Split columns by whitespace: Proto, Local Address, Foreign Address, State, PID
    const parts = trimmed.split(/\s+/);
    if (parts.length < 5) continue;
    
    const localAddress = parts[1];
    const pidStr = parts[parts.length - 1];
    const pid = parseInt(pidStr, 10);
    
    if (isNaN(pid)) continue;
    
    // Check if the local address column targets the exact port
    // Format can be e.g. "0.0.0.0:3000", "[::]:3000", "127.0.0.1:3000"
    const portMatch = new RegExp(`[:\\]]${port}$`);
    if (portMatch.test(localAddress)) {
      if (!pids.includes(pid)) {
        pids.push(pid);
      }
    }
  }
  
  log(`netstat identified PIDs on Windows port ${port}: [${pids.join(', ')}]`, 'debug');
  return pids;
}

/**
 * Terminates process IDs on Unix systems with targeted signals.
 */
function killPidsUnix(pids: number[], signalStr: string, log: ReturnType<typeof createLogger>): { success: boolean; error?: string } {
  log(`Preparing to send signal ${signalStr} to PIDs: [${pids.join(', ')}]`, 'info');
  
  const pidString = pids.join(' ');
  const killCmd = `kill -${signalStr} ${pidString}`;
  const { success, error } = runCommand(killCmd, log);
  
  if (success) {
    log(`Processes [${pids.join(', ')}] terminated successfully.`, 'info');
    return { success: true };
  } else {
    log(`Failed to terminate processes via Unix kill command.`, 'error');
    return { success: false, error };
  }
}

/**
 * Terminates process IDs on Windows systems using taskkill.
 */
function killPidsWindows(pids: number[], force: boolean, log: ReturnType<typeof createLogger>): { success: boolean; error?: string } {
  log(`Preparing to terminate Windows processes. Force: ${force}, PIDs: [${pids.join(', ')}]`, 'info');
  
  let successCount = 0;
  let errors: string[] = [];

  for (const pid of pids) {
    // Flag descriptions:
    // /F - Force terminate processes
    // /T - Tree kill (terminate target process AND all child processes)
    // /PID - Process identifier
    const forceFlag = force ? '/F' : '';
    const taskkillCmd = `taskkill ${forceFlag} /T /PID ${pid}`;
    const result = runCommand(taskkillCmd, log);
    
    if (result.success) {
      log(`Windows process ${pid} (and its child processes) terminated.`, 'info');
      successCount++;
    } else {
      log(`Failed to terminate Windows process ${pid}: ${result.error}`, 'error');
      if (result.error) errors.push(result.error);
    }
  }

  const allSucceeded = successCount === pids.length;
  return {
    success: allSucceeded,
    error: allSucceeded ? undefined : errors.join('; ')
  };
}

/**
 * Core function to terminate processes running on a specific port.
 */
export function killSinglePort(port: number, options: PortKillOptions = {}): PortKillResult {
  const timestamp = new Date().toISOString();
  const log = createLogger(options);
  
  log(`Initiating port-kill routine for port: ${port}...`, 'info');
  
  const isWindows = process.platform === 'win32';
  const pids = isWindows ? findPidsWindows(port, log) : findPidsUnix(port, log);
  
  if (pids.length === 0) {
    const msg = `Port ${port} is free. No active processes found.`;
    log(msg, 'info');
    return {
      port,
      success: true,
      pids: [],
      message: msg,
      timestamp
    };
  }

  log(`Discovered active processes on port ${port}: PIDs [${pids.join(', ')}]`, 'info');

  if (options.dryRun) {
    const msg = `[DRY_RUN] Discovered active process tree [${pids.join(', ')}] on port ${port}. No kill signal sent.`;
    log(msg, 'info');
    return {
      port,
      success: true,
      pids,
      message: msg,
      timestamp
    };
  }

  // Determine signals
  const force = options.force !== false; // Default: true
  
  if (isWindows) {
    const result = killPidsWindows(pids, force, log);
    return {
      port,
      success: result.success,
      pids,
      message: result.success 
        ? `Successfully terminated all processes on port ${port}.` 
        : `Partial failure or error encountered during process termination on Windows.`,
      error: result.error,
      timestamp
    };
  } else {
    // On macOS/Linux, choose signal: fallback to options.signal, or standard force mapping
    const fallbackSignal = force ? 'SIGKILL' : 'SIGTERM';
    const signal = options.signal || fallbackSignal;
    
    const result = killPidsUnix(pids, signal, log);
    return {
      port,
      success: result.success,
      pids,
      message: result.success 
        ? `Successfully terminated all processes on port ${port} using ${signal}.` 
        : `Failed to terminate processes on port ${port} using ${signal}.`,
      error: result.error,
      timestamp
    };
  }
}
