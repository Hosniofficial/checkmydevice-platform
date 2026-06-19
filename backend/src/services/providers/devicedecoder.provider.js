/**
 * Provider: devicedecoder.com
 * Docs: https://devicedecoder.com/api
 * Env: DEVICEDECODER_API_KEY
 */
import fetch from 'node-fetch';

export default class DeviceDecoderProvider {
  constructor() {
    this.apiKey = process.env.DEVICEDECODER_API_KEY;
    this.baseUrl = 'https://api.devicedecoder.com/v1';
  }

  async lookup(imei) {
    if (!this.apiKey) throw new Error('DEVICEDECODER_API_KEY not set');

    const res = await fetch(`${this.baseUrl}/device/${imei}`, {
      headers: {
        'X-Api-Key': this.apiKey,
        'Accept': 'application/json',
      },
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      const err = await res.text();
      throw new Error(`devicedecoder API error ${res.status}: ${err}`);
    }

    const json = await res.json();
    const d = json?.data || json;

    return {
      brand:      d.brand        || d.manufacturer || null,
      model:      d.model        || d.name         || null,
      deviceType: d.type         || 'phone',
      storage:    d.storage      || d.memory       || null,
      color:      d.color        || null,
      network:    d.connectivity || d.network      || null,
      released:   d.releaseDate  || d.released     || null,
      ...d,
    };
  }
}
