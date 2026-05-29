/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const CLI_VERSION = 'port-kill v1.0.1';

export const CLI_HELP = `
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
    `;

export const CLI_ERRORS = {
  MISSING_SIGNAL: 'Error: Please specify a signal name (e.g., SIGTERM, SIGINT) after --signal/-s.',
  NO_PORTS: 'Error: No target ports specified. Run "port-kill --help".',
  invalidPortOrOption: (arg: string) =>
    `Error: Invalid port or option "${arg}". Run 'port-kill --help' for details.`,
} as const;
