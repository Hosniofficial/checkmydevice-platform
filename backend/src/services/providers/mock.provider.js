/**
 * Mock provider — for local development and testing.
 * Returns realistic-looking data based on IMEI prefix.
 * No API key required.
 */

const MOCK_DB = {
  '35': { brand: 'Apple',   model: 'iPhone 14',      deviceType: 'phone',  storage: '128GB', network: '5G' },
  '86': { brand: 'Samsung', model: 'Galaxy S23',     deviceType: 'phone',  storage: '256GB', network: '5G' },
  '35224': { brand: 'Apple', model: 'iPhone 14 Pro', deviceType: 'phone',  storage: '256GB', network: '5G' },
  '35840': { brand: 'Apple', model: 'iPhone 13',     deviceType: 'phone',  storage: '128GB', network: '5G' },
  '86700': { brand: 'Huawei', model: 'P50 Pro',      deviceType: 'phone',  storage: '256GB', network: '4G' },
  '86800': { brand: 'Xiaomi', model: 'Mi 13',        deviceType: 'phone',  storage: '128GB', network: '5G' },
  '01': { brand: 'Lenovo',  model: 'ThinkPad X1',   deviceType: 'laptop', storage: '512GB', network: 'WiFi' },
};

export default class MockProvider {
  async lookup(imei) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 120));

    // Match by longest prefix
    const prefixes = Object.keys(MOCK_DB).sort((a, b) => b.length - a.length);
    for (const prefix of prefixes) {
      if (imei.startsWith(prefix)) {
        const d = MOCK_DB[prefix];
        return {
          ...d,
          color:      'Space Black',
          released:   '2022-09-16',
          imei,
        };
      }
    }

    // Default fallback
    return {
      brand:      'Unknown',
      model:      'Generic Device',
      deviceType: 'phone',
      storage:    null,
      color:      null,
      network:    null,
      released:   null,
      imei,
    };
  }
}
