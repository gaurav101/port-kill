import { runCommand } from '../src/commands/runner';
import { UnixPortStrategy, WindowsPortStrategy } from '../src/platform/strategies';

jest.mock('../src/commands/runner', () => ({
  runCommand: jest.fn(),
}));

describe('platform strategies', () => {
  const mockedRunCommand = runCommand as jest.MockedFunction<typeof runCommand>;
  const log = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('UnixPortStrategy', () => {
    it('finds pids using lsof output first', () => {
      const commandFactory = {
        createFindCommands: jest.fn(() => [
          { binary: 'lsof', args: ['-t', '-n', '-i', ':3000'] },
          { binary: 'fuser', args: ['3000/tcp'] },
        ]),
        createKillCommands: jest.fn(),
      };
      mockedRunCommand.mockReturnValueOnce({
        success: true,
        stdout: '100\n200\nx',
      } as any);

      const strategy = new UnixPortStrategy(commandFactory as any);
      const pids = strategy.findPids(3000, log);

      expect(pids).toEqual([100, 200]);
      expect(commandFactory.createFindCommands).toHaveBeenCalledWith(3000);
      expect(mockedRunCommand).toHaveBeenCalledTimes(1);
    });

    it('falls back to fuser when lsof has no usable output', () => {
      const commandFactory = {
        createFindCommands: jest.fn(() => [
          { binary: 'lsof', args: ['-t', '-n', '-i', ':3000'] },
          { binary: 'fuser', args: ['3000/tcp'] },
        ]),
        createKillCommands: jest.fn(),
      };
      mockedRunCommand
        .mockReturnValueOnce({ success: false, stdout: '' } as any)
        .mockReturnValueOnce({ success: true, stdout: '  300 400 abc' } as any);

      const strategy = new UnixPortStrategy(commandFactory as any);
      const pids = strategy.findPids(3000, log);

      expect(pids).toEqual([300, 400]);
      expect(mockedRunCommand).toHaveBeenCalledTimes(2);
    });

    it('returns empty list when no unix lookup finds pids', () => {
      const commandFactory = {
        createFindCommands: jest.fn(() => [
          { binary: 'lsof', args: ['-t', '-n', '-i', ':3000'] },
          { binary: 'fuser', args: ['3000/tcp'] },
        ]),
        createKillCommands: jest.fn(),
      };
      mockedRunCommand
        .mockReturnValueOnce({ success: false, stdout: '' } as any)
        .mockReturnValueOnce({ success: true, stdout: '' } as any);

      const strategy = new UnixPortStrategy(commandFactory as any);
      const pids = strategy.findPids(3000, log);

      expect(pids).toEqual([]);
    });

    it('returns empty list when fuser output has no numeric pids', () => {
      const commandFactory = {
        createFindCommands: jest.fn(() => [
          { binary: 'lsof', args: ['-t', '-n', '-i', ':3000'] },
          { binary: 'fuser', args: ['3000/tcp'] },
        ]),
        createKillCommands: jest.fn(),
      };
      mockedRunCommand
        .mockReturnValueOnce({ success: false, stdout: '' } as any)
        .mockReturnValueOnce({ success: true, stdout: 'abc xyz' } as any);

      const strategy = new UnixPortStrategy(commandFactory as any);
      const pids = strategy.findPids(3000, log);

      expect(pids).toEqual([]);
    });

    it('terminates using default force signal and returns success', () => {
      const commandFactory = {
        createFindCommands: jest.fn(),
        createKillCommands: jest.fn(() => [{ binary: 'kill', args: ['-SIGKILL', '1', '2'] }]),
      };
      mockedRunCommand.mockReturnValueOnce({ success: true } as any);

      const strategy = new UnixPortStrategy(commandFactory as any);
      const result = strategy.terminatePids([1, 2], {}, log);

      expect(commandFactory.createKillCommands).toHaveBeenCalledWith([1, 2], 'SIGKILL');
      expect(result).toEqual({ success: true, signal: 'SIGKILL' });
    });

    it('returns failure when kill command fails', () => {
      const commandFactory = {
        createFindCommands: jest.fn(),
        createKillCommands: jest.fn(() => [{ binary: 'kill', args: ['-SIGINT', '1'] }]),
      };
      mockedRunCommand.mockReturnValueOnce({
        success: false,
        error: 'bad kill',
      } as any);

      const strategy = new UnixPortStrategy(commandFactory as any);
      const result = strategy.terminatePids([1], { force: false, signal: 'SIGINT' }, log);

      expect(commandFactory.createKillCommands).toHaveBeenCalledWith([1], 'SIGINT');
      expect(result).toEqual({ success: false, error: 'bad kill', signal: 'SIGINT' });
    });

    it('skips self and parent pids to prevent accidental termination', () => {
      const commandFactory = {
        createFindCommands: jest.fn(),
        createKillCommands: jest.fn(),
      };
      const strategy = new UnixPortStrategy(commandFactory as any);
      const result = strategy.terminatePids([process.pid, process.ppid], {}, log);

      expect(commandFactory.createKillCommands).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, signal: 'SIGKILL' });
    });
  });

  describe('WindowsPortStrategy', () => {
    it('returns empty pids when netstat fails', () => {
      const commandFactory = {
        createFindCommands: jest.fn(() => [{ binary: 'netstat', args: ['-ano'] }]),
        createKillCommands: jest.fn(),
      };
      mockedRunCommand.mockReturnValueOnce({ success: false, stdout: '' } as any);

      const strategy = new WindowsPortStrategy(commandFactory as any);
      expect(strategy.findPids(3000, log)).toEqual([]);
    });

    it('parses netstat output and filters by target port', () => {
      const commandFactory = {
        createFindCommands: jest.fn(() => [{ binary: 'netstat', args: ['-ano'] }]),
        createKillCommands: jest.fn(),
      };
      mockedRunCommand.mockReturnValueOnce({
        success: true,
        stdout: [
          'TCP 0.0.0.0:3000 0.0.0.0:0 LISTENING 1234',
          'TCP [::]:3000 [::]:0 LISTENING 1234',
          'TCP 0.0.0.0:4000 0.0.0.0:0 LISTENING 8888',
          'TCP 0.0.0.0 0.0.0.0:0 LISTENING 4567',
          'TCP 0.0.0.0:* 0.0.0.0:0 LISTENING 9999',
          'TCP 0.0.0.0:3000 0.0.0.0:0 LISTENING not-a-pid',
          'UDP 0.0.0.0 0.0.0.0 7777',
          '',
          'garbage line',
        ].join('\n'),
      } as any);

      const strategy = new WindowsPortStrategy(commandFactory as any);
      expect(strategy.findPids(3000, log)).toEqual([1234]);
    });

    it('returns success true when all taskkill commands succeed', () => {
      const commandFactory = {
        createFindCommands: jest.fn(),
        createKillCommands: jest.fn(() => [
          { binary: 'taskkill', args: ['/F', '/T', '/PID', '1'] },
          { binary: 'taskkill', args: ['/F', '/T', '/PID', '2'] },
        ]),
      };
      mockedRunCommand
        .mockReturnValueOnce({ success: true } as any)
        .mockReturnValueOnce({ success: true } as any);

      const strategy = new WindowsPortStrategy(commandFactory as any);
      const result = strategy.terminatePids([1, 2], { force: true }, log);

      expect(commandFactory.createKillCommands).toHaveBeenCalledWith([1, 2], true);
      expect(result).toEqual({ success: true, error: undefined });
    });

    it('returns combined errors when any taskkill command fails', () => {
      const commandFactory = {
        createFindCommands: jest.fn(),
        createKillCommands: jest.fn(() => [
          { binary: 'taskkill', args: ['/T', '/PID', '1'] },
          { binary: 'taskkill', args: ['/T', '/PID', '2'] },
        ]),
      };
      mockedRunCommand
        .mockReturnValueOnce({ success: true } as any)
        .mockReturnValueOnce({ success: false, error: 'denied' } as any);

      const strategy = new WindowsPortStrategy(commandFactory as any);
      const result = strategy.terminatePids([1, 2], { force: false }, log);

      expect(result).toEqual({ success: false, error: 'denied' });
    });

    it('handles failed taskkill responses without error strings', () => {
      const commandFactory = {
        createFindCommands: jest.fn(),
        createKillCommands: jest.fn(() => [
          { binary: 'taskkill', args: ['/F', '/T', '/PID', '1'] },
        ]),
      };
      mockedRunCommand.mockReturnValueOnce({ success: false } as any);

      const strategy = new WindowsPortStrategy(commandFactory as any);
      const result = strategy.terminatePids([1], { force: true }, log);

      expect(result).toEqual({ success: false, error: '' });
    });

    it('skips protected pids for windows termination path', () => {
      const commandFactory = {
        createFindCommands: jest.fn(),
        createKillCommands: jest.fn(),
      };
      const strategy = new WindowsPortStrategy(commandFactory as any);
      const result = strategy.terminatePids([process.pid, process.ppid], { force: true }, log);

      expect(commandFactory.createKillCommands).not.toHaveBeenCalled();
      expect(result).toEqual({ success: true, error: undefined });
    });
  });
});
