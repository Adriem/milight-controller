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
    .option('-h, --hue <value>', 'Hue of the color')
    .option('-s, --saturation <value>', 'Saturation of the color')
    .option('-b, --brightness <value>', 'Brightness of the color')
    .action(withErrorHandling((zoneName, hue, saturation, brightness) =>
      lightsService.setColor(zoneName, {
        hue: hue != null ? parseInt(hue) : null,
        saturation: saturation != null ? parseInt(saturation) : null,
        brightness: brightness != null ? parseInt(brightness) : null,
      })));

  program
    .command('set-all <zone>')
    .description('Turn on the target zone')
    .option('-h, --hue <value>', 'Hue of the color')
    .option('-s, --saturation <value>', 'Saturation of the color')
    .option('-t, --temperature <value>', 'Hue of the color')
    .option('-b, --brightness <value>', 'Brightness of the color')
    .action(withErrorHandling((zoneName, { hue, saturation, temperature, brightness }) =>
      lightsService.setAll(zoneName, {
        hue: hue != null ? parseInt(hue) : null,
        saturation: saturation != null ? parseInt(saturation) : null,
        temperature: temperature != null ? parseInt(temperature) : null,
        brightness: brightness != null ? parseInt(brightness) : null,
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
