# Lead Review - `port-kill` Website + Docs App

## Scope

- Frontend application in `src/`
- Library API alignment checks against `port-kill-pkg/src/`
- Quality gates: `npm run lint`, `npm run test:all`, `npm run build`

Status at review time:

- Lint: passing
- Tests: passing
- Build: passing

## Findings

### 1) High - Quick Start API snippet is incorrect and conflicts with real library signature

- **Impact**: Users copying the snippet will call the API with an invalid shape and get runtime/type errors.
- **Where**:
  - Quick Start snippet uses:
    - `await portKill({ port: [3000, 8080], force: true, verbose: true });`
    - [`src/components/QuickStartReference.tsx:32`](src/components/QuickStartReference.tsx:32)
  - Actual API expects:
    - `portKill(ports, options?)`
    - [`port-kill-pkg/src/index.ts:52`](port-kill-pkg/src/index.ts:52)
- **Recommendation**:
  - Replace snippet with:
    - `await portKill([3000, 8080], { force: true, verbose: true });`
  - Add a focused UI test/assertion for this snippet text so this cannot regress.

### 2) Medium - Command Builder signal generation logic does not consistently reflect selected signal

- **Impact**: Generated CLI and “under the hood” shell command mapping can misrepresent what the user selected, especially around `SIGTERM` when `force=true`.
- **Where**:
  - Conditional signal flag emission:
    - [`src/components/CommandBuilder.tsx:57`](src/components/CommandBuilder.tsx:57)
  - Under-the-hood signal derivation forces `SIGKILL` when `force=true`:
    - [`src/components/CommandBuilder.tsx:92`](src/components/CommandBuilder.tsx:92)
- **Why this matters**:
  - Runtime strategy supports explicit `options.signal` even when force defaults are enabled in many paths; current UI logic can imply a different behavior than actual invocation intent.
- **Recommendation**:
  - Normalize a single signal-resolution function used by:
    1. CLI command string generation,
    2. programmatic snippet generation,
    3. under-the-hood mapping panel.
  - Add test cases for:
    - `force=true + signal=SIGTERM`
    - `force=false + signal=SIGINT`
    - default/no signal selection

### 3) Medium - Interactive toggle controls are not exposed with accessible pressed/switch semantics

- **Impact**: Keyboard/screen-reader users do not get reliable state announcements for critical options.
- **Where**:
  - Strategy toggles are plain `<button>` without `aria-pressed`/`role="switch"`:
    - [`src/components/CommandBuilder.tsx:199`](src/components/CommandBuilder.tsx:199)
    - [`src/components/CommandBuilder.tsx:223`](src/components/CommandBuilder.tsx:223)
    - [`src/components/CommandBuilder.tsx:246`](src/components/CommandBuilder.tsx:246)
    - [`src/components/CommandBuilder.tsx:269`](src/components/CommandBuilder.tsx:269)
- **Recommendation**:
  - Add `aria-pressed` (or `role="switch"` + `aria-checked`) and an accessible name for each toggle.
  - Include accessibility assertions in component tests for state transitions.

### 4) Low - Clipboard operations have no failure handling

- **Impact**: In restricted browsers/contexts, copy actions can fail silently with no user feedback.
- **Where**:
  - `navigator.clipboard.writeText(...)` used without `try/catch`:
    - [`src/components/QuickStartReference.tsx:45`](src/components/QuickStartReference.tsx:45)
    - [`src/components/UseCases.tsx:20`](src/components/UseCases.tsx:20)
    - [`src/components/Header.tsx:48`](src/components/Header.tsx:48)
    - [`src/components/CodeExplorer.tsx:28`](src/components/CodeExplorer.tsx:28)
    - [`src/components/CommandBuilder.tsx:44`](src/components/CommandBuilder.tsx:44)
- **Recommendation**:
  - Wrap copy calls in `try/catch`.
  - Add fallback message state (`Copy failed`) and optional fallback path (`document.execCommand('copy')`) only if needed.

## Open Questions / Assumptions

1. Is `force` intended to always dominate signal choice in the UI model, or should explicit user-selected signal always be represented?
2. Do you want the Quick Start programmatic snippet to show `portKill` only, or both `portKill` and `portKillSync` variants?

## Strengths

- Clear componentized structure with constants separated from rendering logic.
- Good theming pass with targeted dark/high-contrast selectors.
- Strong package-side test coverage and enforced lint cleanliness.

## Suggested Next Steps (Priority Order)

1. Fix the Quick Start programmatic snippet API shape.
2. Refactor Command Builder signal resolution into one shared helper and align all generated outputs.
3. Add accessibility semantics for all toggle controls and expand tests beyond terminal simulation to cover builder and quick-start interactions.

---

## Implementation Feedback (Applied)

The review items above have now been implemented.

### Completed Changes

1. **Quick Start API snippet fixed (High)**

- Updated snippet to valid signature:
  - `await portKill([3000, 8080], { force: true, verbose: true });`
- File:
  - [src/components/QuickStartReference.tsx](/Users/gaurav/Downloads/port-kill-library-and-cli/src/components/QuickStartReference.tsx)
- Added regression test:
  - [src/components/QuickStartReference.test.tsx](/Users/gaurav/Downloads/port-kill-library-and-cli/src/components/QuickStartReference.test.tsx)

2. **Signal/force alignment refactor in Command Builder (Medium)**

- Introduced shared signal helpers:
  - `resolveEffectiveSignal(...)`
  - `shouldIncludeSignalFlag(...)`
- Unified usage across:
  - CLI string generation
  - Programmatic snippet options generation
  - Under-the-hood native command mapping
- Files:
  - [src/components/utils/commandBuilder.utils.ts](/Users/gaurav/Downloads/port-kill-library-and-cli/src/components/utils/commandBuilder.utils.ts)
  - [src/components/CommandBuilder.tsx](/Users/gaurav/Downloads/port-kill-library-and-cli/src/components/CommandBuilder.tsx)
- Added helper tests:
  - [src/components/utils/commandBuilder.utils.test.ts](/Users/gaurav/Downloads/port-kill-library-and-cli/src/components/utils/commandBuilder.utils.test.ts)

3. **Accessibility semantics for strategy toggles (Medium)**

- Added `role="switch"` + `aria-checked` + descriptive `aria-label` on the four kill strategy toggles in Command Builder.
- File:
  - [src/components/CommandBuilder.tsx](/Users/gaurav/Downloads/port-kill-library-and-cli/src/components/CommandBuilder.tsx)

4. **Clipboard failure handling across app (Low)**

- Added centralized safe copy utility with fallback path:
  - [src/utils/clipboard.ts](/Users/gaurav/Downloads/port-kill-library-and-cli/src/utils/clipboard.ts)
- Updated all copy flows to:
  - handle async failures,
  - show visual failure feedback (`Copy failed`/alert icon),
  - preserve current success UX.
- Updated files:
  - [src/components/Header.tsx](/Users/gaurav/Downloads/port-kill-library-and-cli/src/components/Header.tsx)
  - [src/components/QuickStartReference.tsx](/Users/gaurav/Downloads/port-kill-library-and-cli/src/components/QuickStartReference.tsx)
  - [src/components/UseCases.tsx](/Users/gaurav/Downloads/port-kill-library-and-cli/src/components/UseCases.tsx)
  - [src/components/CodeExplorer.tsx](/Users/gaurav/Downloads/port-kill-library-and-cli/src/components/CodeExplorer.tsx)
  - [src/components/CommandBuilder.tsx](/Users/gaurav/Downloads/port-kill-library-and-cli/src/components/CommandBuilder.tsx)
  - [src/components/ReadmeViewer.tsx](/Users/gaurav/Downloads/port-kill-library-and-cli/src/components/ReadmeViewer.tsx)

### Validation Run

- `npm run lint` -> pass
- `npm run test:all` -> pass
- `npm run build` -> pass

### Remaining Recommendation

- Add dedicated interaction tests for Command Builder toggles in a Monaco-mocked test harness to fully lock accessibility + output coupling against regressions.
