const { MilightController, commandsV6 } = require('node-milight-promise');

const commands = commandsV6.fullColor;
const noopCommand = () => [];

const ALL_ZONES_ID = 0
const AVAILABLE_ZONES = 4


class LightServiceFullRgbV6 {

  /**
   * Light service supporting the full-rbg-v6 protocol
   * @param {MilightController} controller - Controller for the lights
   */
  constructor(controller) {
    this.controller = controller;
  }

  /**
   * Get the zoneId for a provided zoneName
   * @param {string|number} zoneName - Human friendly zone name
   * @returns {number} Numeric ID for the target zone
   */
  getZoneId(zoneName) {
    const normalizedZoneName = zoneName.toString().toLowerCase().replace(/^(zone-?)?/, '')
    if (normalizedZoneName === 'all' || normalizedZoneName === 'all-zones') return ALL_ZONES_ID
    const zoneId = parseInt(normalizedZoneName);
    if (isNaN(zoneId) || zoneId < 1 || zoneId > AVAILABLE_ZONES) throw new Error('Invalid zone')
    return zoneId
  }

  async turnOn(zone) {
    const zoneId = this.getZoneId(zone);
    await this.controller.ready();

    return this.controller.sendCommands(
      commands.on(zoneId)
    )
  }

  async turnOff(zone) {
    const zoneId = this.getZoneId(zone);
    await this.controller.ready();

    return this.controller.sendCommands(
      commands.off(zoneId)
    )
  }

  async setNightMode (zone) {
    const zoneId = this.getZoneId(zone);
    await this.controller.ready();

    this.controller.sendCommands(
      commands.on(zoneId),
      commands.nightMode(zoneId),
    );
  }

  async setBrightness (zone, { brightness }) {
    const zoneId = this.getZoneId(zone);
    await this.controller.ready();

    return this.controller.sendCommands(
      commands.on(zoneId),
      commands.brightness(zoneId, brightness),
    );
  }

  async setWhite (zone, { temperature, brightness }) {
    const zoneId = this.getZoneId(zone);
    await this.controller.ready();

    return this.controller.sendCommands(
      commands.on(zoneId),
      temperature == null ? commands.whiteMode(zoneId) : noopCommand(),
      brightness != null ? commands.brightness(zoneId, brightness) : noopCommand(),
      temperature != null ? commands.whiteTemperature(zoneId, temperature) : noopCommand(),
    );
  }

  async setColor (zone, { hue, saturation, brightness }) {
    const zoneId = this.getZoneId(zone);
    await this.controller.ready();

    return this.controller.sendCommands(
      commands.on(zoneId),
      hue != null ? commands.hue(zoneId, hue) : noopCommand(),
      brightness != null ? commands.brightness(zoneId, brightness) : noopCommand(),
      saturation != null ? commands.saturation(zoneId, saturation) : noopCommand(),
    );
  }

  async setAll (zone, { hue, saturation, temperature, brightness }) {
    const zoneId = this.getZoneId(zone);
    await this.controller.ready();

    return this.controller.sendCommands(
      commands.on(zoneId),
      temperature != null ? commands.whiteTemperature(zoneId, temperature) : noopCommand(),
      brightness != null ? commands.brightness(zoneId, brightness) : noopCommand(),
      hue != null ? commands.hue(zoneId, hue) : noopCommand(),
      saturation != null ? commands.saturation(zoneId, saturation) : noopCommand(),
      temperature != null && brightness != null ? commands.brightness(zoneId, brightness) : noopCommand(),
    );
  }

  async blink (zone, { millis = 250, times = 1 }) {
    const zoneId = this.getZoneId(zone);
    const pendingIterations = []
    await this.controller.ready();

    for (let i = 0; i < times; i++) {
      pendingIterations.push(Promise.all([
        this.controller.sendCommands(commands.off(zoneId)),
        this.controller.pause(millis),
        this.controller.sendCommands(commands.on(zoneId)),
      ]))
    }
    return Promise.all(pendingIterations);
  }

  async flash (zone, { millis = 250, times = 1 }) {
    const zoneId = this.getZoneId(zone);
    const pendingIterations = []
    await this.controller.ready();

    for (let i = 0; i < times; i++) {
      pendingIterations.push(Promise.all([
        this.controller.sendCommands(commands.on(zoneId)),
        this.controller.pause(millis),
        this.controller.sendCommands(commands.off(zoneId)),
      ]))
    }
    return Promise.all(pendingIterations);
  }

  async pause (millis) {
    await this.controller.ready();
    return this.controller.pause(millis);
  }
}

module.exports = { LightServiceFullRgbV6 }
