import { CLI_VERSION } from '../src/cli/messages';

describe('cli messages', () => {
  it('uses package version in CLI_VERSION', () => {
    const packageVersion = require('../package.json').version;
    expect(CLI_VERSION).toBe(`port-kill v${packageVersion}`);
  });
});
