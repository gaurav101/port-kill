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
        createFindCommands: jest.fn(() => ['lsof-cmd', 'fuser-cmd']),
        createKillCommand: jest.fn(),
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
        createFindCommands: jest.fn(() => ['lsof-cmd', 'fuser-cmd']),
        createKillCommand: jest.fn(),
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
        createFindCommands: jest.fn(() => ['lsof-cmd', 'fuser-cmd']),
        createKillCommand: jest.fn(),
      };
      mockedRunCommand
        .mockReturnValueOnce({ success: false, stdout: '' } as any)
        .mockReturnValueOnce({ success: true, stdout: '' } as any);

      const strategy = new UnixPortStrategy(commandFactory as any);
      const pids = strategy.findPids(3000, log);

      expect(pids).toEqual([]);
    });

    it('handles fuser output with no numeric pids', () => {
      const commandFactory = {
        createFindCommands: jest.fn(() => ['lsof-cmd', 'fuser-cmd']),
        createKillCommand: jest.fn(),
      };
      mockedRunCommand
        .mockReturnValueOnce({ success: false, stdout: '' } as any)
        .mockReturnValueOnce({ success: true, stdout: 'abc xyz' } as any);

      const strategy = new UnixPortStrategy(commandFactory as any);
      expect(strategy.findPids(3000, log)).toEqual([]);
    });

    it('terminates using default force signal and returns success', () => {
      const commandFactory = {
        createFindCommands: jest.fn(),
        createKillCommand: jest.fn(() => 'kill-cmd'),
      };
      mockedRunCommand.mockReturnValueOnce({ success: true } as any);

      const strategy = new UnixPortStrategy(commandFactory as any);
      const result = strategy.terminatePids([1, 2], {}, log);

      expect(commandFactory.createKillCommand).toHaveBeenCalledWith([1, 2], 'SIGKILL');
      expect(result).toEqual({ success: true, signal: 'SIGKILL' });
    });

    it('returns failure when kill command fails', () => {
      const commandFactory = {
        createFindCommands: jest.fn(),
        createKillCommand: jest.fn(() => 'kill-cmd'),
      };
      mockedRunCommand.mockReturnValueOnce({
        success: false,
        error: 'bad kill',
      } as any);

      const strategy = new UnixPortStrategy(commandFactory as any);
      const result = strategy.terminatePids([1], { force: false, signal: 'SIGINT' }, log);

      expect(commandFactory.createKillCommand).toHaveBeenCalledWith([1], 'SIGINT');
      expect(result).toEqual({ success: false, error: 'bad kill', signal: 'SIGINT' });
    });
  });

  describe('WindowsPortStrategy', () => {
    it('returns empty pids when netstat fails', () => {
      const commandFactory = {
        createFindCommands: jest.fn(() => ['netstat-cmd']),
        createKillCommand: jest.fn(),
      };
      mockedRunCommand.mockReturnValueOnce({ success: false, stdout: '' } as any);

      const strategy = new WindowsPortStrategy(commandFactory as any);
      expect(strategy.findPids(3000, log)).toEqual([]);
    });

    it('returns empty pids when netstat succeeds with empty stdout', () => {
      const commandFactory = {
        createFindCommands: jest.fn(() => ['netstat-cmd']),
        createKillCommand: jest.fn(),
      };
      mockedRunCommand.mockReturnValueOnce({ success: true, stdout: '' } as any);

      const strategy = new WindowsPortStrategy(commandFactory as any);
      expect(strategy.findPids(3000, log)).toEqual([]);
    });

    it('parses netstat output and filters by target port', () => {
      const commandFactory = {
        createFindCommands: jest.fn(() => ['netstat-cmd']),
        createKillCommand: jest.fn(),
      };
      mockedRunCommand.mockReturnValueOnce({
        success: true,
        stdout: [
          '  TCP    0.0.0.0:3000     0.0.0.0:0      LISTENING       1234',
          '  TCP    [::]:3000        [::]:0         LISTENING       1234',
          '  TCP    0.0.0.0:4000     0.0.0.0:0      LISTENING       8888',
          'garbage line',
        ].join('\n'),
      } as any);

      const strategy = new WindowsPortStrategy(commandFactory as any);
      expect(strategy.findPids(3000, log)).toEqual([1234]);
    });

    it('returns success true when all taskkill commands succeed', () => {
      const commandFactory = {
        createFindCommands: jest.fn(),
        createKillCommand: jest.fn(() => ['kill-1', 'kill-2']),
      };
      mockedRunCommand
        .mockReturnValueOnce({ success: true } as any)
        .mockReturnValueOnce({ success: true } as any);

      const strategy = new WindowsPortStrategy(commandFactory as any);
      const result = strategy.terminatePids([1, 2], { force: true }, log);

      expect(commandFactory.createKillCommand).toHaveBeenCalledWith([1, 2], true);
      expect(result).toEqual({ success: true, error: undefined });
    });

    it('returns combined errors when any taskkill command fails', () => {
      const commandFactory = {
        createFindCommands: jest.fn(),
        createKillCommand: jest.fn(() => ['kill-1', 'kill-2']),
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
        createKillCommand: jest.fn(() => ['kill-1']),
      };
      mockedRunCommand.mockReturnValueOnce({ success: false } as any);

      const strategy = new WindowsPortStrategy(commandFactory as any);
      const result = strategy.terminatePids([1], { force: true }, log);

      expect(result).toEqual({ success: false, error: '' });
    });
  });
});
