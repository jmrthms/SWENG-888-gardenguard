// Dynamic Expo config — extends app.json to inject the Google Maps API keys from
// the environment, so the secret is never committed. The Map screen (US-6) needs
// a key to render tiles in a dev or standalone build; Expo Go does not provide one.
//
// Set the key(s) before building, e.g. in a local .env file (gitignored) or shell:
//   GOOGLE_MAPS_ANDROID_API_KEY=AIza...   (required for Android map tiles)
//   GOOGLE_MAPS_IOS_API_KEY=AIza...        (optional; falls back to the Android key)
//
// Then build a dev client:  npx expo run:android   (or an EAS dev build)
// See README → "Maps setup". When no key is set, the config is unchanged and the
// Map screen renders blank tiles (as it does in Expo Go).
const appJson = require('./app.json');

module.exports = () => {
  const base = appJson.expo;
  const androidKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  const iosKey = process.env.GOOGLE_MAPS_IOS_API_KEY || androidKey;

  return {
    ...base,
    android: {
      ...base.android,
      ...(androidKey
        ? { config: { ...(base.android && base.android.config), googleMaps: { apiKey: androidKey } } }
        : {}),
    },
    ios: {
      ...base.ios,
      ...(iosKey
        ? { config: { ...(base.ios && base.ios.config), googleMapsApiKey: iosKey } }
        : {}),
    },
  };
};
