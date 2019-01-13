const program = require('commander');
const { MilightController } = require('node-milight-promise');
const { LightController, FullRgbV6Command } = require('./commands');
const createServer = require('./http-server');

const BRIDGE_IP   = '192.168.1.79';
const BRIDGE_PORT = 5987;
const APP_PORT = 3000;

const commands = FullRgbV6Command;

const milightController = new MilightController({ ip: BRIDGE_IP, port: BRIDGE_PORT, type: 'v6' });

const controllers = {
  'all': new LightController(0, milightController),
  'zone-1': new LightController(1, milightController),
  'zone-2': new LightController(2, milightController),
  'zone-3': new LightController(3, milightController),
  'zone-4': new LightController(4, milightController),
}

program
  .version('0.1.0')

program
  .command('server')
  .description('Set up an HTTP server for controlling the lights')
  .option('-p, --port', 'Port for the server to listen into', APP_PORT)
  .action((port) => createServer({ port }, controllers))

async function executeCmd (zoneName, ...cmds) {
  const controller = controllers[ zoneName ];

  if (controller == null) {
    console.error('Zone must be one of:', Object.keys(controllers).join(', '));
    process.exit(1);
  }

  await controller.exec(...cmds);
  process.exit(0);
}

program
  .command('turn-on <zone>')
  .description('Turn on the target zone')
  .action((zoneName) => executeCmd(zoneName, commands.on()))

program
  .command('turn-off <zone>')
  .description('Turn on the target zone')
  .action((zoneName) => executeCmd(zoneName, commands.off()))

program.parse(process.argv);

async function exitHandler(exitCode) {
  await milightController.close()
  console.log('Connection closed properly')
  process.exit(exitCode);
}

process.stdin.resume(); // Prevent the script to finish instantly

process.on('exit', exitHandler);
process.on('uncaughtException', exitHandler);
process.on('SIGINT', exitHandler);  // ctrl+c event
process.on('SIGUSR1', exitHandler); // "kill pid" (for example: nodemon restart)
process.on('SIGUSR2', exitHandler); // "kill pid" (for example: nodemon restart)
