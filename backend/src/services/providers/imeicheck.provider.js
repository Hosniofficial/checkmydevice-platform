/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         imeicheck.com Alpha API Provider                    ║
 * ║                                                              ║
 * ║  Endpoint:                                                   ║
 * ║  GET /api/free_with_key/modelBrandName                      ║
 * ║    ?key=API_KEY&imei=IMEI&format=json                       ║
 * ║                                                              ║
 * ║  Response shape:                                             ║
 * ║  {                                                           ║
 * ║    "status": "succes",                                       ║
 * ║    "result": "IMEI: ...<br>Brand: ...<br>...",              ║
 * ║    "imei":   "352322311421731",                             ║
 * ║    "count_free_checks_today": 280615,                       ║
 * ║    "object": {                                               ║
 * ║      "brand": "Motorola",                                    ║
 * ║      "name":  "Moto G22",                                   ║
 * ║      "model": "XT2231-5"                                    ║
 * ║    }                                                         ║
 * ║  }                                                           ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

import fetch from 'node-fetch';

export default class ImeiCheckProvider {
  constructor() {
    this.apiKey  = process.env.IMEICHECK_API_KEY;
    this.baseUrl = (process.env.IMEICHECK_API_URL || 'https://alpha.imeicheck.com').replace(/\/$/, '');
    this.timeout = 8000; // 8s timeout
  }

  /**
   * Lookup device info by IMEI.
   * Returns normalised object or null if not found.
   */
  async lookup(imei) {
    if (!this.apiKey) throw new Error('IMEICHECK_API_KEY is not set in environment');

    const url = `${this.baseUrl}/api/free_with_key/modelBrandName?key=${this.apiKey}&imei=${imei}&format=json`;

    const controller = new AbortController();
    const timer      = setTimeout(() => controller.abort(), this.timeout);

    let res;
    try {
      res = await fetch(url, {
        signal:  controller.signal,
        headers: { 'Accept': 'application/json', 'User-Agent': 'CheckMyDevice/1.0' },
      });
    } catch (err) {
      if (err.name === 'AbortError') throw new Error('imeicheck API timeout after 8s');
      throw new Error(`imeicheck network error: ${err.message}`);
    } finally {
      clearTimeout(timer);
    }

    // ── Parse response ────────────────────────────────────────────
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`imeicheck returned non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`);
    }

    // ── Handle HTTP errors ────────────────────────────────────────
    if (!res.ok) {
      throw new Error(`imeicheck HTTP ${res.status}: ${json?.message || text.slice(0, 200)}`);
    }

    // ── API-level error (note: their typo "succes" is intentional) ─
    const status = (json.status || '').toLowerCase();
    if (status !== 'succes' && status !== 'success') {
      // IMEI not found — not an error, just unknown device
      if (status === 'error' || !json.object) return null;
    }

    const obj = json.object;
    if (!obj) return null;

    // ── Log quota info ────────────────────────────────────────────
    if (json.count_free_checks_today !== undefined) {
      console.info(`[imeicheck] Free checks remaining today: ${json.count_free_checks_today}`);
    }

    // ── Return normalised data ────────────────────────────────────
    return {
      brand:      obj.brand      || null,
      model:      obj.model      || null,   // technical model (XT2231-5)
      name:       obj.name       || null,   // marketing name (Moto G22)
      deviceType: this._inferType(obj.brand, obj.name),
      storage:    null,     // not provided by this endpoint
      color:      null,     // not provided by this endpoint
      network:    null,     // not provided by this endpoint
      released:   null,     // not provided by this endpoint
      // preserve raw for debugging
      _raw_result: json.result || null,
      _checks_today: json.count_free_checks_today,
      _read_perf:    json.readPerformance,
    };
  }

  /**
   * Infer device type from brand/name keywords.
   * imeicheck doesn't return type, so we guess from name.
   */
  _inferType(brand, name) {
    const n = (name || '').toLowerCase();
    const b = (brand || '').toLowerCase();

    if (n.includes('tab') || n.includes('pad') || n.includes('slate')) return 'tablet';
    if (n.includes('book') || n.includes('laptop') || n.includes('notebook')) return 'laptop';
    if (b === 'apple' && (n.includes('ipad') || n.includes('mac'))) {
      return n.includes('ipad') ? 'tablet' : 'laptop';
    }
    return 'phone'; // default
  }
}
