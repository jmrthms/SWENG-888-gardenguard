// Regression tests for app.config.js — the dynamic Expo config that injects the
// Google Maps API key from the environment. Plain JS (not TS) so it can require
// the root app.config.js without type-declaration friction.
const buildConfig = require('../../app.config.js');

const ANDROID = 'GOOGLE_MAPS_ANDROID_API_KEY';
const IOS = 'GOOGLE_MAPS_IOS_API_KEY';

describe('app.config.js — Google Maps key injection', () => {
  let savedAndroid;
  let savedIos;

  beforeEach(() => {
    savedAndroid = process.env[ANDROID];
    savedIos = process.env[IOS];
    delete process.env[ANDROID];
    delete process.env[IOS];
  });

  afterEach(() => {
    if (savedAndroid === undefined) delete process.env[ANDROID];
    else process.env[ANDROID] = savedAndroid;
    if (savedIos === undefined) delete process.env[IOS];
    else process.env[IOS] = savedIos;
  });

  it('omits the Maps key when no env var is set (clean default)', () => {
    const cfg = buildConfig();
    expect(cfg.android.config && cfg.android.config.googleMaps).toBeUndefined();
    expect(cfg.ios.config && cfg.ios.config.googleMapsApiKey).toBeUndefined();
  });

  it('injects the Android key and falls the iOS key back to it', () => {
    process.env[ANDROID] = 'AIza-ANDROID-TEST';
    const cfg = buildConfig();
    expect(cfg.android.config.googleMaps.apiKey).toBe('AIza-ANDROID-TEST');
    expect(cfg.ios.config.googleMapsApiKey).toBe('AIza-ANDROID-TEST');
  });

  it('uses a distinct iOS key when provided', () => {
    process.env[ANDROID] = 'AIza-ANDROID';
    process.env[IOS] = 'AIza-IOS';
    const cfg = buildConfig();
    expect(cfg.android.config.googleMaps.apiKey).toBe('AIza-ANDROID');
    expect(cfg.ios.config.googleMapsApiKey).toBe('AIza-IOS');
  });

  it('preserves the base app.json config (identity, plugins)', () => {
    const cfg = buildConfig();
    expect(cfg.name).toBe('GardenGuard');
    expect(cfg.slug).toBe('gardenguard');
    expect(cfg.android.package).toBe('edu.psu.sweng888.group4.gardenguard');
    expect(cfg.ios.bundleIdentifier).toBe('edu.psu.sweng888.group4.gardenguard');
    expect(Array.isArray(cfg.plugins)).toBe(true);
  });
});
