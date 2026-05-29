#!/usr/bin/env node
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { portKillSync } from './index';
import { PortKillOptions } from './types';

// Simple lightweight arguments parser to keep npm installation instant and zero-dependency!
function runCli() {
  const args = process.argv.slice(2);

  // If help requested or no arguments provided, show standard usage instructions
  if (args.includes('--help') || args.includes('-h') || args.length === 0) {
    console.log(`
  Usage: port-kill <ports...> [options]

  Optionally target multiple ports simultaneously:
    port-kill 3000 8080 8081

  Options:
    -h, --help          Show this helper guide
    -v, --version       Show version information
    -d, --verbose       Enable verbose debugging/monitoring logs
    -s, --signal <sig>  Specify custom termination signal (Unix-only, e.g. SIGTERM)
    --no-force          Graceful terminate instead of aggressive (SIGKILL / taskkill /F)
    --dry-run           Search, detect, and audit process IDs without killing them

  Examples:
    $ port-kill 3000
    $ port-kill 8080 8081 --verbose
    $ port-kill 4500 --signal SIGTERM --dry-run
    `);
    process.exit(0);
  }

  // Version check
  if (args.includes('--version') || args.includes('-v')) {
    console.log('port-kill v1.0.0');
    process.exit(0);
  }

  // Extract ports and operational options
  const ports: number[] = [];
  const options: PortKillOptions = {
    port: [],
    force: true, // Defaulting to robust force termination
    verbose: false,
    dryRun: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--verbose' || arg === '-d') {
      options.verbose = true;
    } else if (arg === '--dry-run') {
      options.dryRun = true;
    } else if (arg === '--no-force') {
      options.force = false;
    } else if (arg === '--signal' || arg === '-s') {
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('-')) {
        options.signal = nextArg;
        i++; // Skip the next value
      } else {
        console.error('Error: Please specify a signal name (e.g., SIGTERM, SIGINT) after --signal/-s.');
        process.exit(1);
      }
    } else {
      // It should be a numeric port list
      const port = parseInt(arg, 10);
      if (isNaN(port)) {
        console.error(`Error: Invalid port or option "${arg}". Run 'port-kill --help' for details.`);
        process.exit(1);
      }
      ports.push(port);
    }
  }

  if (ports.length === 0) {
    console.error('Error: No target ports specified. Run "port-kill --help".');
    process.exit(1);
  }

  options.port = ports;

  if (options.verbose) {
    console.log(`[port-kill] Targeting ports: [${ports.join(', ')}]`);
    console.log(`[port-kill] Options configured:`, JSON.stringify({ ...options, port: undefined }, null, 2));
  }

  // Perform termination check
  const results = portKillSync(ports, options);
  
  let exitCode = 0;
  for (const res of results) {
    if (res.success) {
      if (res.pids.length > 0) {
        console.log(`✓ [Port ${res.port}] Process tree killed: [${res.pids.join(', ')}].`);
      } else {
        console.log(`✓ [Port ${res.port}] Already free (no active processes found).`);
      }
    } else {
      console.error(`✗ [Port ${res.port}] Terminate action failed.`);
      if (res.error) {
        console.error(`  ↳ Error detail: ${res.error}`);
      }
      exitCode = 1;
    }
  }

  process.exit(exitCode);
}

// Start CLI run
if (require.main === module || !module.parent) {
  runCli();
}
