module.exports = (program, lightsService, httpServer) => {
  program
    .version('0.1.0');

  program
    .command('http-server')
    .description('Bring up an HTTP server for controlling the lights')
    .option('-p, --port', 'Port for the server to listen to', 3000)
    .action((port) => httpServer.listen(port));

  program
    .command('turn-on <zone>')
    .description('Turn on the target zone')
    .action(withErrorHandling((zoneName) => lightsService.turnOn(zoneName)));

  program
    .command('turn-off <zone>')
    .description('Turn on the target zone')
    .action(withErrorHandling((zoneName) => lightsService.turnOff(zoneName)));

  program
    .command('set-color <zone>')
    .description('Turn on the target zone')
    .option('-h, --hue', 'Hue of the color')
    .option('-s, --saturation', 'Saturation of the color')
    .option('-b, --brightness', 'Brightness of the color')
    .action(withErrorHandling((zoneName, hue, saturation, brightness) =>
      lightsService.setColor(zoneName, {
        hue: parseInt(hue),
        saturation: parseInt(saturation),
        brightness: parseInt(brightness),
      })));

  function withErrorHandling (action) {
    return async (...args) => {
      try {
        await action(...args)
        process.exit(0);
      } catch (error) {
        console.error(error.message || error);
        process.exit(1);
      }
    }
  }

  return program.parse.bind(program);
}
