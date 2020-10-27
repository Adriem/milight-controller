const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const morgan = require('morgan');

const commands = {
  TURN_ON: {
    name: 'turn-on',
    mapping: 'turnOn',
    description: 'Turn on the target zone',
    parameters: [],
  },

  TURN_OFF: {
    name: 'turn-off',
    mapping: 'turnOff',
    description: 'Turn off the target zone',
    parameters: [],
  },

  SET_NIGHT_MODE: {
    name: 'set-night-mode',
    mapping: 'setNightMode',
    description: 'Set the night mode on the target zone',
    parameters: [],
  },

  SET_BRIGHTNESS: {
    name: 'set-brightness',
    mapping: 'setBrightness',
    description: 'Set a specified brightness on the target zone',
    parameters: [
      { name: 'brightness', description: 'Brightness for the color (0-100)', validate: validateInteger(0, 100) },
    ],
  },

  SET_WHITE: {
    name: 'set-white',
    mapping: 'setWhite',
    description: 'Set a specified white light on the target zone',
    parameters: [
      { name: 'temperature', description: 'Temperature for the color (0-255)', validate: validateInteger(0, 255) },
      { name: 'brightness', description: 'Brightness for the color (0-100)', validate: validateInteger(0, 100) },
    ],
  },

  SET_COLOR: {
    name: 'set-color',
    mapping: 'setColor',
    description: 'Set a specified color on the target zone',
    parameters: [
      { name: 'hue', description: 'Hue for the color (0-255)', validate: validateInteger(0, 255) },
      { name: 'saturation', description: 'Saturation for the color (0-255)', validate: validateInteger(0, 255) },
      { name: 'brightness', description: 'Brightness for the color (0-100)', validate: validateInteger(0, 100) },
    ],
  },

  SET_ALL: {
    name: 'set-all',
    mapping: 'setAll',
    description: 'Set a specified white light on the target zone',
    parameters: [
      { name: 'hue', description: 'Hue for the color (0-255)', validate: validateInteger(0, 255) },
      { name: 'saturation', description: 'Saturation for the color (0-255)', validate: validateInteger(0, 255) },
      { name: 'temperature', description: 'Temperature for the color (0-255)', validate: validateInteger(0, 255) },
      { name: 'brightness', description: 'Brightness for the color (0-100)', validate: validateInteger(0, 100) },
    ],
  },

}

function validateInteger (min, max) {
  return (name, value) => {
    const intValue = parseInt(value);

    if (isNaN(intValue)) throw new Error(`INVALID PARAM '${ name }': value is not an integer`);
    if (min != null && intValue < min) throw new Error(`INVALID PARAM '${ name }': value can't be lower than ${ min }`);
    if (max != null && intValue > max) throw new Error(`INVALID PARAM '${ name }': value can't be greater than ${ max }`);

    return intValue;
  }
}

function handleDescribeCommands () {
  return async (req, res) => res.status(200).json(
    _.map(commands, ({ name, description, parameters }) => ({
      name,
      description,
      parameters: _.map(parameters, ({ name, description }) => ({ name, description })),
    }))
  );
}

function handleSendCommand (lightsService) {

  const sendInvalidCommandError = (res) => res.send(400).send({
    code: 'INVALID_COMMAND',
    message: `Invalid command. Supported commands are: ${ _.values(commands).map(c => c.name).join(', ') }`
  })

  const sendMissingZoneError = (res) => res.send(404).send({
    code: 'INVALID_ZONE',
    message: 'Invalid zone. Please try one of: "all", "zone-1", "zone-2", etc',
  })

  const sendInvalidParamError = (res, message) => res.send(400).send({
    code: 'INVALID_COMMAND',
    message: message
  })

  const sendGenericError = (res, error) => res.send(400).send({
    code: 'UNKNOWN_COMMAND',
    message: 'There was an unknown error when processing your request',
    error
  });


  return async (req, res) => {
    const zoneName = req.params.zoneName;
    const { command, ...payload } = req.body;
    const action = _.find(commands, c => c.name === command)

    if (action == null) return sendInvalidCommandError(res);

    try {
      const method = action.mapping;
      const params = _.mapValues(payload, (pValue, pName) => {
        const descriptor = _.find(action.parameters, ap => ap.name === pName)
        if (descriptor == null) return undefined;
        return descriptor.validate ? descriptor.validate(pName, pValue) : pValue;
      });

      lightsService[ method ](zoneName, params);

      return res.status(200).send('OK');
    } catch (err) {
      if (err.message === 'Invalid zone') return sendMissingZoneError(res);
      if (/^INVALID PARAM:/.test(err.message)) return sendInvalidParamError(res, err.message);

      return sendGenericError(res, err);
    }
  }
}

module.exports = (lightsService) => {
  morgan.token('body', req => JSON.stringify(req.body))

  const app = express()
    .use(bodyParser.json())
    .use(morgan(':method :url :status :response-time ms - :body'))
    .get('/', (req, res) => res.status(200).send())
    .get('/zones/:zoneName/command', handleDescribeCommands())
    .post('/zones/:zoneName/command', handleSendCommand(lightsService))

  return app
};
