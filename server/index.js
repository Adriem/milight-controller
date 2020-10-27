const program = require('commander');
const { MilightController } = require('node-milight-promise');
const { LightServiceFullRgbV6 } = require('./lights-service');
const setupCliController = require('./cli-controller');
const setupHttpController = require('./http-controller');

const BRIDGE_IP   = '192.168.1.150';
const BRIDGE_PORT = 5987;

const milightController = new MilightController({ ip: BRIDGE_IP, port: BRIDGE_PORT, type: 'v6' });
const lightsService = new LightServiceFullRgbV6(milightController);
const httpController = setupHttpController(lightsService);
const cliController = setupCliController(program, lightsService, httpController)

process.stdin.resume(); // Prevent the script to finish instantly

process.on('exit', exitHandler);
process.on('uncaughtException', exitHandler);
process.on('SIGINT', exitHandler);  // ctrl+c event
process.on('SIGUSR1', exitHandler); // "kill pid" (for example: nodemon restart)
process.on('SIGUSR2', exitHandler); // "kill pid" (for example: nodemon restart)

async function exitHandler(exitCode) {
  await milightController.close()
  console.log('Connection closed properly')
  process.exit(exitCode);
}

cliController(process.argv);
