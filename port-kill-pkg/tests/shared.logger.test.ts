import { createLogger } from '../src/shared/logger';

describe('createLogger', () => {
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });

  it('suppresses debug logs when verbose is disabled', () => {
    const log = createLogger({ verbose: false });
    log('debug message', 'debug');

    expect(console.log).not.toHaveBeenCalled();
  });

  it('prints info/debug logs with prefix', () => {
    const log = createLogger({ verbose: true });
    log('default level');
    log('hello', 'info');
    log('world', 'debug');

    expect(console.log).toHaveBeenCalledWith('[port-kill] [INFO] default level');
    expect(console.log).toHaveBeenCalledWith('[port-kill] [INFO] hello');
    expect(console.log).toHaveBeenCalledWith('[port-kill] [DEBUG] world');
  });

  it('routes warn and error levels to correct console methods', () => {
    const log = createLogger({ verbose: true });
    log('careful', 'warn');
    log('boom', 'error');

    expect(console.warn).toHaveBeenCalledWith('[port-kill] [WARN] careful');
    expect(console.error).toHaveBeenCalledWith('[port-kill] [ERROR] boom');
  });

  it('uses custom logger when provided', () => {
    const customLogger = jest.fn();
    const log = createLogger({ verbose: true, logger: customLogger });

    log('custom', 'info');

    expect(customLogger).toHaveBeenCalledWith('custom', 'info');
    expect(console.log).not.toHaveBeenCalled();
  });
});
