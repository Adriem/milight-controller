const { MilightController } = require('node-milight-promise');

/** @typedef { import('./full-rgb-v6').FullRgbV6Zone } FullRgbV6Zone */
/** @typedef { import('./full-rgb-v6').FullRgbV6Command } FullRgbV6Command */

/** @typedef { FullRgbV6Zone } ValidZone */
/** @typedef { FullRgbV6Command } Command */

class LightController {

  /**
   * Create a new LightController instance that will act on a specified zone
   * @param { ValidZone } zone - Zone for the controller to act over
   * @param { MilightController } controller - MilightController instance
   */
  constructor (zone, controller) {
    this.zone = zone;
    this.controller = controller;
  }

  /**
   * Execute a series of commands sequentially and disconnect
   * @param  { ...Command } commands - Commands to be executed
   * @return { Promise<any> } Promise that will resolve to the
   */
  async exec(...commands) {
    await this.controller.ready();
    const allCommandsExecuted = commands.map((command) => command(this.zone, this.controller))
    return Promise.all(allCommandsExecuted)
  }
}

module.exports = {
  LightController,
  FullRgbV6Command: require('./full-rgb-v6')
}
