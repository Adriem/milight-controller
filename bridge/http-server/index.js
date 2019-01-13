const express = require('express');
const morgan = require('morgan');
const parser = require('body-parser');
const commands = require('../commands').FullRgbV6Command

module.exports = (config, controllers) => {
  return express()
    .use(morgan('dev'))
    .use(parser.json())
    .get('/zones', (req, res) => res.status(200).json(Object.keys(controllers)))
    .post('/zones/:zoneId/cmd', (req, res) => {
      const payload = req.body;
      const zoneId = req.params.zoneId;
      const controller = controllers[ zoneId ];

      if (controller == null) return res.status(404).send('Zone not found');

      switch (payload.command) {

        case 'turn-on':
          controller.exec(commands.on());
          res.status(200).send('OK');
          break;

        case 'turn-off':
          controller.exec(commands.off());
          res.status(200).send('OK');
          break;

        case 'set-color':
          controller.exec(commands.setColor(payload.hue, payload.saturation, payload.brightness));
          res.status(200).send('OK');
          break;

        case 'set-white':
          controller.exec(commands.setWhite(payload.temperature, payload.brightness));
          res.status(200).send('OK');
          break;

        case 'set-all':
          controller.exec(commands.setAll(payload.hue, payload.saturation, payload.temperature, payload.brightness));
          res.status(200).send('OK');
          break;

        default: return res.status(400).send('Invalid command');
      }
    })
    .listen(config.port)

}
