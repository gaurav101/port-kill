import { UnixCommandFactory, WindowsCommandFactory } from '../src/commands/factories';

describe('command factories', () => {
  it('builds unix find commands', () => {
    const factory = new UnixCommandFactory();
    const [lsof, fuser] = factory.createFindCommands(3000);

    expect(lsof).toEqual({
      binary: 'lsof',
      args: ['-t', '-n', '-i', ':3000'],
    });
    expect(fuser).toEqual({
      binary: 'fuser',
      args: ['3000/tcp'],
    });
  });

  it('normalizes unix signal when building kill command', () => {
    const factory = new UnixCommandFactory();

    expect(factory.createKillCommands([1, 2], 'sigterm')).toEqual([
      { binary: 'kill', args: ['-SIGTERM', '1', '2'] },
    ]);
    expect(factory.createKillCommands([3], 'INT')).toEqual([
      { binary: 'kill', args: ['-SIGINT', '3'] },
    ]);
  });

  it('rejects unsafe unix signal values', () => {
    const factory = new UnixCommandFactory();
    expect(() => factory.createKillCommands([1], 'SIGTERM;RM')).toThrow(
      'Unsupported or invalid POSIX signal'
    );
  });

  it('rejects unknown alphabetic unix signals', () => {
    const factory = new UnixCommandFactory();
    expect(() => factory.createKillCommands([1], 'SIGHELLOWORLD')).toThrow(
      'Unsupported or invalid POSIX signal'
    );
  });

  it('builds windows commands with and without force', () => {
    const factory = new WindowsCommandFactory();

    expect(factory.createFindCommands()).toEqual([{ binary: 'netstat', args: ['-ano'] }]);
    expect(factory.createKillCommands([11, 22], true)).toEqual([
      { binary: 'taskkill', args: ['/F', '/T', '/PID', '11'] },
      { binary: 'taskkill', args: ['/F', '/T', '/PID', '22'] },
    ]);
    expect(factory.createKillCommands([33], false)).toEqual([
      { binary: 'taskkill', args: ['/T', '/PID', '33'] },
    ]);
  });
});
