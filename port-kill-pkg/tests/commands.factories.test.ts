import { UnixCommandFactory, WindowsCommandFactory } from '../src/commands/factories';

describe('command factories', () => {
  it('builds unix find commands', () => {
    const factory = new UnixCommandFactory();
    const [lsof, fuser] = factory.createFindCommands(3000);

    expect(lsof).toBe('lsof -t -n -i :3000');
    expect(fuser).toBe('fuser 3000/tcp');
  });

  it('normalizes unix signal when building kill command', () => {
    const factory = new UnixCommandFactory();

    expect(factory.createKillCommand([1, 2], 'sigterm')).toBe('kill -TERM 1 2');
    expect(factory.createKillCommand([3], 'INT')).toBe('kill -INT 3');
  });

  it('builds windows commands with and without force', () => {
    const factory = new WindowsCommandFactory();

    expect(factory.createFindCommands()).toEqual(['netstat -ano']);
    expect(factory.createKillCommand([11, 22], true)).toEqual([
      'taskkill /F /T /PID 11',
      'taskkill /F /T /PID 22',
    ]);
    expect(factory.createKillCommand([33], false)).toEqual(['taskkill /T /PID 33']);
  });
});
