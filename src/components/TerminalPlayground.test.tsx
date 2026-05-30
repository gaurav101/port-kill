import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TerminalPlayground from './TerminalPlayground';

describe('TerminalPlayground', () => {
  it('renders runtime simulation controls and terminal shell panel', () => {
    render(<TerminalPlayground />);

    expect(screen.getByText('Simulate Runtime Execution')).toBeInTheDocument();
    expect(screen.getByText('Select Preset Workflow')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Run Simulation' })).toBeInTheDocument();
    expect(screen.getByText('port-kill-sandbox-terminal')).toBeInTheDocument();
    expect(screen.getByText('Ready to roll command diagnostics')).toBeInTheDocument();
  });
});
