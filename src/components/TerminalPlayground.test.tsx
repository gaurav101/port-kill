import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import TerminalPlayground from './TerminalPlayground';
import { getTerminalLogColorClass } from './utils/terminalPlayground.utils';

describe('TerminalPlayground', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const runTimers = (ms = 10000) => {
    act(() => {
      vi.advanceTimersByTime(ms);
    });
  };

  it('renders runtime simulation controls and terminal shell panel', () => {
    render(<TerminalPlayground />);

    expect(screen.getByText('Simulate Runtime Execution')).toBeInTheDocument();
    expect(screen.getByText('Select Preset Workflow')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Run Simulation' })).toBeInTheDocument();
    expect(screen.getByText('port-kill-sandbox-terminal')).toBeInTheDocument();
    expect(screen.getByText('Ready to roll command diagnostics')).toBeInTheDocument();
  });

  it('runs standard unix simulation and returns button to idle state after success', () => {
    render(<TerminalPlayground />);

    fireEvent.click(screen.getByRole('button', { name: 'Run Simulation' }));
    expect(screen.getByRole('button', { name: 'Executing Mock...' })).toBeInTheDocument();

    runTimers();

    expect(screen.getByText('✓ [Port 3000] Process tree killed: [18451].')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Run Simulation' })).toBeInTheDocument();
    expect(screen.getByText('posix-shell')).toBeInTheDocument();
  });

  it('uses unix verbose path and logs lsof and kill commands for multi-port preset', () => {
    render(<TerminalPlayground />);

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'verboseMultiple' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run Simulation' }));

    runTimers();

    expect(
      screen.getByText('[port-kill] [DEBUG] Executing command: lsof -t -n -i :8080')
    ).toBeInTheDocument();
    expect(
      screen.getByText('[port-kill] [DEBUG] Executing command: kill -SIGKILL 29541 29542')
    ).toBeInTheDocument();
  });

  it('uses windows verbose path and logs netstat/taskkill commands', () => {
    render(<TerminalPlayground />);

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'verboseMultiple' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Windows (Win32)' }));
    fireEvent.click(screen.getByRole('button', { name: 'Run Simulation' }));

    runTimers();

    expect(screen.getByText('powershell')).toBeInTheDocument();
    expect(
      screen.getByText('[port-kill] [DEBUG] Executing command: netstat -ano')
    ).toBeInTheDocument();
    expect(
      screen.getByText('[port-kill] [DEBUG] Executing command: taskkill /F /T /PID 29541')
    ).toBeInTheDocument();
    expect(
      screen.getByText('[port-kill] [DEBUG] Executing command: taskkill /F /T /PID 29542')
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'macOS / Linux' }));
    expect(screen.getByText('posix-shell')).toBeInTheDocument();
  });

  it('runs dry-run preset and surfaces dry-run message without terminate step', () => {
    render(<TerminalPlayground />);

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'dryAudit' },
    });
    expect(screen.getByText('Dry Run')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Run Simulation' }));

    runTimers();

    expect(
      screen.getByText(
        '[port-kill] [INFO] [DRY_RUN] Discovered active process tree [91244] on port 5000. No kill signal sent.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText(/\[INFO\] Preparing to send signal/)).not.toBeInTheDocument();
  });

  it('runs graceful preset with SIGTERM when force is disabled', () => {
    render(<TerminalPlayground />);

    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'graceful' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Run Simulation' }));

    runTimers();

    expect(
      screen.getByText('[port-kill] [INFO] Preparing to send signal SIGTERM to PIDs: [412]')
    ).toBeInTheDocument();
    expect(
      screen.queryByText('[port-kill] [DEBUG] Executing command: kill -SIGTERM 412')
    ).not.toBeInTheDocument();
  });

  it('ignores additional run requests while a simulation is already active', () => {
    render(<TerminalPlayground />);

    fireEvent.click(screen.getByRole('button', { name: 'Run Simulation' }));
    fireEvent.click(screen.getByRole('button', { name: 'Executing Mock...' }));

    runTimers();

    expect(screen.getAllByText('$ port-kill 3000')).toHaveLength(1);
  });

  it('maps every terminal log type to the expected color classes', () => {
    expect(getTerminalLogColorClass('cmd')).toContain('text-gray-300');
    expect(getTerminalLogColorClass('debug')).toContain('text-gray-500');
    expect(getTerminalLogColorClass('info')).toContain('text-sky-400');
    expect(getTerminalLogColorClass('warn')).toContain('text-amber-400');
    expect(getTerminalLogColorClass('error')).toContain('text-rose-400');
    expect(getTerminalLogColorClass('success')).toContain('text-blue-400');
    expect(getTerminalLogColorClass('unknown' as never)).toContain('text-gray-200');
  });
});
