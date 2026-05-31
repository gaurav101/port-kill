# Third-Party Code Review Report

Date: 2026-05-30  
Scope: Website app (`src/**`) + library/CLI package (`port-kill-pkg/**`)

## Findings

### 1) Critical: Command Injection Risk in CLI Signal Handling

- Severity: **Critical**
- Location:
  - `port-kill-pkg/src/cli/parser.ts:44-46`
  - `port-kill-pkg/src/commands/factories.ts:22-24, 27-34`
  - `port-kill-pkg/src/commands/runner.ts:26-34`
- Why this matters:
  - User-provided `--signal` is accepted as raw string, transformed only by trim/uppercase, then interpolated into a shell command.
  - Commands are executed with `spawnSync(..., { shell: true })`.
  - This allows shell metacharacter injection in `signal` values.
- Example risk path:
  - Input signal with metacharacters -> interpolated in `kill -${signal} ...` -> executed by shell.
- Recommendation:
  1. Strictly validate signal values against an allowlist (`SIGKILL`, `SIGTERM`, `SIGINT`, `SIGHUP`, etc.).
  2. Remove `shell: true` for command execution where possible.
  3. Pass executable + args arrays to `spawnSync`/`execFileSync` to avoid shell interpolation.
- Status: **Fixed**
- Fix details:
  - Added strict signal validation in CLI parser (`^SIG?[A-Z]+$`) in `port-kill-pkg/src/cli/parser.ts`.
  - Added defensive signal sanitization in command factory (`port-kill-pkg/src/commands/factories.ts`), rejecting non-alphabetic signal payloads.
  - Reworked command execution to avoid shell interpolation:
    - `spawnSync(binary, args, { shell: false })`
    - Added command parser guard rejecting unsafe metacharacters in `port-kill-pkg/src/commands/runner.ts`.
  - Added tests covering invalid signal + unsafe command rejection:
    - `port-kill-pkg/tests/cli.parser.test.ts`
    - `port-kill-pkg/tests/commands.factories.test.ts`
    - `port-kill-pkg/tests/commands.runner.test.ts`

---

### 2) High: Port Parsing Accepts Invalid/Malformed Ports

- Severity: **High**
- Location:
  - `port-kill-pkg/src/cli/parser.ts:51-55`
- Why this matters:
  - `parseInt` accepts partial numeric strings (`"3000abc"` -> `3000`).
  - No range validation for port bounds (`1..65535`).
  - Negative or out-of-range values can pass through to runtime commands.
- Recommendation:
  1. Validate token format with a strict integer regex (`/^\d+$/`).
  2. Enforce port range (`1 <= port <= 65535`).
  3. Return parser error for invalid/out-of-range ports.
- Status: **Fixed**
- Fix details:
  - Replaced permissive `parseInt` path with strict numeric token validation (`/^\d+$/`).
  - Enforced port bounds (`1..65535`) in `port-kill-pkg/src/cli/parser.ts`.
  - Added regression tests for partial/out-of-range ports in `port-kill-pkg/tests/cli.parser.test.ts`.

---

### 3) Medium: Timer Lifecycle Leak in Terminal Simulation UI

- Severity: **Medium**
- Location:
  - `src/components/TerminalPlayground.tsx:171-178`
- Why this matters:
  - Multiple `setTimeout` handlers are created per simulation run.
  - There is no cleanup on unmount/tab switch.
  - This can trigger state updates after unmount and produce stale updates/memory leaks.
- Recommendation:
  1. Track timer IDs in a ref.
  2. Clear timers in `useEffect` cleanup.
  3. Clear existing timers before starting a new run.
- Status: **Fixed**
- Fix details:
  - Added `timerIdsRef` and centralized timer cleanup in `src/components/TerminalPlayground.tsx`.
  - Added unmount cleanup effect to cancel outstanding timers.
  - Clears prior timers before a new simulation run.

---

### 4) Medium: CLI Version String Is Hardcoded

- Severity: **Medium**
- Location:
  - `port-kill-pkg/src/cli/messages.ts:6`
- Why this matters:
  - Manual version string (`'port-kill v1.0.1'`) can drift from `package.json` on future releases.
  - Produces inaccurate CLI metadata.
- Recommendation:
  1. Source version from `package.json` at build/runtime (or inject at build time).
  2. Add a test that asserts `--version` matches package version format.
- Status: **Fixed**
- Fix details:
  - `CLI_VERSION` now resolves from `../../package.json` in `port-kill-pkg/src/cli/messages.ts`.
  - Added validation test in `port-kill-pkg/tests/cli.messages.test.ts`.

---

### 5) Low: Frontend Test Coverage Gap

- Severity: **Low**
- Location:
  - Website app (`src/**`) currently has lint/build checks, but no unit/integration tests.
- Why this matters:
  - Regressions in interactive behavior (tab flows, simulation UI, Monaco rendering states) are not automatically caught.
- Recommendation:
  1. Add React Testing Library + Vitest/Jest for core component behavior.
  2. Cover high-interaction areas first: `TerminalPlayground`, `CommandBuilder`, `CodeExplorer`, tab navigation.
- Status: **Fixed (Initial baseline established)**
- Fix details:
  - Added frontend unit-test stack:
    - `vitest.config.ts`
    - `src/test/setup.ts`
  - Added initial component test for high-interaction surface:
    - `src/components/TerminalPlayground.test.tsx`
  - Added root script `test:web` for frontend test execution.
  - Note: this closes the tooling gap and adds initial coverage; broader component test depth is still recommended.

## Strengths Observed

- `port-kill-pkg` now has robust test coverage and enforced coverage thresholds (>95%).
- Clear architecture separation in library package (CLI, commands, platform strategy, shared logger).
- Frontend code organization is modular and constants-driven.

## Re-Review (Post-Remediation)

- Security hardening has been materially improved:
  - Shell interpolation risk in command execution path has been addressed.
  - CLI input validation for `signal` and `port` is now strict.
- Reliability improved in UI runtime simulation:
  - Timer lifecycle now handles rerun/unmount cleanup correctly.
- Release/version integrity improved:
  - CLI version now follows package metadata.
- Testing posture improved:
  - `port-kill-pkg` coverage remains above threshold (`>95%`).
  - Frontend now has baseline unit test infrastructure and a first high-interaction test.

## Summary

- All previously reported findings are now addressed.
- Remaining recommendation: expand frontend test breadth over time (`CommandBuilder`, `CodeExplorer`, tab navigation flows) to strengthen regression detection.
