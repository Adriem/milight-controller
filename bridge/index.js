const program = require('commander');
const { MilightController } = require('node-milight-promise');
const { LightController, FullRgbV6Command } = require('./commands')

const BRIDGE_IP   = '192.168.1.79';
const BRIDGE_PORT = 5987;

const commands = FullRgbV6Command;

/** Create a controller from the provided zoneName from the CLI */
function createController (zoneName) {
  if (!/^(all|zone-?[1-4])$/.test(zoneName)) {
    console.log('Zone must be either "all" or "zone[1-4]"');
    throw 'Invalid zone';
  }

  const zoneId = zoneName === 'all' ? 0 : parseInt(zoneName.replace(/^zone-?/, ''));
  const milightController = new MilightController({ ip: BRIDGE_IP, port: BRIDGE_PORT, type: 'v6' });

  return  new LightController(zoneId, milightController);
}

program
  .version('0.1.0')

program
  .command('turn-on <zone>')
  .description('Turn on the target zone')
  .action((zoneName, cmd) => createController(zoneName).exec(commands.on()));

program
  .command('turn-off <zone>')
  .description('Turn on the target zone')
  .action((zoneName, cmd) => createController(zoneName).exec(commands.off()));

program
  .command('dim <zone> <value>')
  .description('Turn on the target zone')
  .action((zoneName, value, cmd) => createController(zoneName).exec(commands.setBrightness(value)));

program.parse(process.argv);
