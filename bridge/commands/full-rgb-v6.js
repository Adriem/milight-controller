const { MilightController, commandsV6 } = require('node-milight-promise');

const cmd = commandsV6.fullColor;

/** @typedef { 0 } ALL_ZONES */
/** @typedef { ALL_ZONES|1|2|3|4 } FullRgbV6Zone */
/** @typedef { ExecuteCommand } FullRgbV6Command */

/**
 * @callback ExecuteCommand
 * @param { FullRgbV6Zone } zone - Zone for the command to be executed to
 * @param { MilightController } ctrl - MilightController instance
 */

module.exports = {

  /**
   * Create a command to turn on a zone
   * @returns { FullRgbV6Command } Command function
   */
  on () {
    return async (zone, ctrl) => ctrl.sendCommands(
      cmd.on(zone),
    );
  },

  /**
   * Create a command to turn off a zone
   * @returns { FullRgbV6Command } Command function
   */
  off () {
    return async (zone, ctrl) => ctrl.sendCommands(
      cmd.off(zone),
    );
  },

  /**
   * Create a command to setup the night mode on a zone
   * @returns { FullRgbV6Command } Command function
   */
  setNightMode () {
    return async (zone, ctrl) => ctrl.sendCommands(
      cmd.on(zone),
      cmd.nightMode(zone),
    );
  },

  /**
   * Create a command to modify the brightness of a zone
   * @param { number } brightness - New value for the brightness
   * @returns { FullRgbV6Command } Command function
   */
  setBrightness (brightness) {
    return async (zone, ctrl) => ctrl.sendCommands(
      cmd.on(zone),
      cmd.brightness(zone, brightness),
    );
  },

  /**
   * Create a command to set up the night mode on a zone
   * @param { number } [temperature] - If provided, modify the temperature of the white light
   * @param { number } [brightness]  - If provided, modify the brightness of the white light
   * @returns { FullRgbV6Command } Command function
   */
  setWhite (temperature, brightness) {
    return async (zone, ctrl) => ctrl.sendCommands(
      cmd.on(zone),
      cmd.whiteMode(zone),
      brightness != null ? cmd.brightness(zone, brightness) : [],
      temperature != null ? cmd.whiteTemperature(zone, temperature) : [],
    );
  },

  /**
   * Create a command to set a color to a zone
   * @param { number } hue          - Hue of the color to set up
   * @param { number } [saturation] - If provided, modify the saturation of the color
   * @param { number } [brightness] - If provided, modify the brightness of the color
   * @returns { FullRgbV6Command } Command function
   */
  setColor (hue, saturation, brightness) {
    return async (zone, ctrl) => ctrl.sendCommands(
      cmd.on(zone),
      cmd.hue(zone, hue),
      brightness != null ? cmd.brightness(zone, brightness) : [],
      saturation != null ? cmd.saturation(zone, saturation) : [],
    )
  },

  /**
   * Create a command to set both the white temperature and the color of a zone
   * @param { number } hue           - Hue of the color to set up
   * @param { number } [saturation]  - If provided, modify the saturation of the color
   * @param { number } [temperature] - If provided, modify the temperature of the white light
   * @param { number } [brightness]  - If provided, modify the brightness of both the color and the white light
   * @returns { FullRgbV6Command } Command function
   */
  setAll (hue, saturation, temperature, brightness) {
    return async (zone, ctrl) => {
      // TODO: Await for both
      this.setWhite(temperature, brightness)(zone, ctrl);
      this.setColor(hue, saturation, brightness)(zone, ctrl);
    }
  },

  /**
   * Temporarily turn off a zone to create a blinking effect
   * @param { number } millis    - Time for the zone to remain turned off in milliseconds
   * @param { number } [times=1] - Specify how many times it must blink
   * @returns { FullRgbV6Command } Command function
   */
  blink (millis, times = 1) {
    return async (zone, ctrl) => {
      for (let i = 0; i < times; i++) {
        // TODO: Await for all
        ctrl.sendCommands(cmd.off(zone))
        this.pause(millis)(zone, ctrl)
        ctrl.sendCommands(cmd.on(zone))
      }
    }
  },

  /**
   * Temporarily turn on a zone to create a flashing effect
   * @param { number } millis    - Time for the zone to remain turned on in milliseconds
   * @param { number } [times=1] - Specify how many times it must flash
   * @returns { FullRgbV6Command } Command function
   */
  flash (millis, times = 1) {
    return async (zone, ctrl) => {
      for (let i = 0; i < times; i++) {
        // TODO: Await for all
        ctrl.sendCommands(cmd.off(zone))
        this.pause(millis)(zone, ctrl)
        ctrl.sendCommands(cmd.on(zone))
      }
    }
  },

  /**
   * Pause the execution of commands for a given amount of time
   * @param { number } millis - Time to pause the execution in milliseconds
   * @returns { FullRgbV6Command } Command function
   */
  pause (millis) {
    return async (zone, ctrl) => ctrl.pause(millis);
  },

  /**
   * Do nothing
   * @returns { FullRgbV6Command } Command function
   */
  noop () {
    return async (zone, ctrl) => null
  },
};
