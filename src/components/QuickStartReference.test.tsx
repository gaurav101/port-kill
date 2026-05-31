import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import QuickStartReference from './QuickStartReference';

describe('QuickStartReference', () => {
  it('shows programmatic API snippet with ports argument + options object signature', () => {
    render(<QuickStartReference />);

    expect(screen.getByText(/await portKill\(\[3000, 8080\], \{/)).toBeInTheDocument();
    expect(screen.queryByText(/await portKill\(\{\s*port:/)).not.toBeInTheDocument();
  });
});
