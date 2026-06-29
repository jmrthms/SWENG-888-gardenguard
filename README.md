# GardenGuard

> **Grow naturally. Defend organically.**

GardenGuard helps home gardeners grow healthy, chemical-free gardens by recommending
**region-appropriate companion plants** that naturally repel local pests and critters. Pick your
**growing region**, build a list of the plants you grow (each tagged with the pests to watch for),
get organic companion recommendations drawn from a real **6-region plant dataset**, and see your
garden beds and nearby nurseries on a map.

A cross-platform **React Native (Expo)** app — one TypeScript codebase for iOS and Android.

**SWENG 888 · Mobile Computing and Applications · Penn State World Campus**
Group 4 — Anita Pitre · Christopher Allen · Jomar Thomas Almonte · Summer 2026

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React Native + Expo (SDK 56) |
| Language | TypeScript |
| Navigation | React Navigation 7 (bottom tabs + native stack) |
| UI | React Native Paper (Material Design 3) + `@expo/vector-icons` |
| Local data | `expo-sqlite` (plant list) + `AsyncStorage` (preferences) |
| Knowledge base | Curated **6-region** dataset (123 plants · 35 pests · 15 companions), generated into a typed module |
| Maps & location | **OpenStreetMap** via `react-native-webview` (Leaflet) — no API key — + `expo-location` |
| Notifications | `expo-notifications` (local, region-based seasonal tips) |
| Auth | Local on-device stub today → **AWS Cognito** (Amplify) at Module 5 |
| Cloud (planned) | AWS AppSync (GraphQL) + DynamoDB sync |

This is a **local-first** build: everything works offline on the device. Cloud auth and sync are
layered in later (see [Roadmap](#roadmap)), matching the course module timeline.

---

## Prerequisites

- **Node.js** 18+ (built with Node 24)
- **Expo Go** app on a physical device, **or** an Android emulator / iOS simulator
- (Optional) Android Studio / Xcode for native dev builds

## Run it

```bash
npm install
npx expo start
```

Then:
- Press **a** for Android emulator, **i** for iOS simulator, or scan the QR code with **Expo Go**.
- Or: `npm run android` / `npm run ios`.

> **First launch:** create an account (Register), then log in. Your **growing region** is captured at
> sign-up and drives the catalog and recommendations. Add a plant (browse your region's catalog or type
> your own), or open **Recommend** to get organic companions for a pest — or to protect a chosen plant.

### Maps (US-6) — OpenStreetMap, no API key
The Map screen renders **OpenStreetMap** tiles with **Leaflet inside a `react-native-webview`**
(`src/screens/mapHtml.ts`). This needs **no API key and works in Expo Go** out of the box — garden-bed
and nursery markers, tap-a-bed → Plant Detail, "near me" filter, and "my location" all work. Web is out
of scope — the Map screen shows a list fallback there.

> OSM's public tile server is free under a [fair-use policy](https://operations.osmfoundation.org/policies/tiles/)
> (fine for this project); a production app would point at a tile CDN (OpenFreeMap, MapTiler, etc.).

**Optional — native Google Maps instead.** A Google key path is also scaffolded if you'd rather use
native Google Maps: set `GOOGLE_MAPS_ANDROID_API_KEY` in `.env` (see `.env.example`); `app.config.js`
injects it into `expo.android.config.googleMaps.apiKey` at build time. You'd then swap `MapScreen` back
to `react-native-maps` and run a dev build (`npx expo run:android`) — it does **not** render in Expo Go.

### Tests
The pure data/logic layer (the recommendation engine, regional catalog, pests, seasons, geo helpers) is
unit-tested with **Jest** (via `@swc/jest`, decoupled from the Metro/Expo build):

```bash
npm test          # run the suite
npm run typecheck  # tsc --noEmit
```

Tests live in `src/**/__tests__/` (**45 tests / 7 suites**) and cover dataset integrity (counts, every
pest→companion reference resolves), region-aware ranking (local companions first; remedy-only plants
region-agnostic), companion suggestions, seasonal tips, the Haversine geo math, the Leaflet map-HTML
builder (markers, OSM tiles, `<script>`-injection safety), and the `app.config.js` Maps-key injection.

---

## Project structure

```
App.tsx                     Providers (SafeArea · Preferences · Auth) + theme + navigation
index.ts                    Expo entry point
src/
├── theme/                  Brand palette + MD3 Paper themes + matching nav themes
├── models/types.ts         Domain models (Plant, CatalogPlant, Pest, Nursery, Preferences, User)
├── data/                   Region-keyed knowledge base (built from the dataset)
│   ├── regionalCatalog.generated.ts  ← AUTO-GENERATED: 123 plants · 35 pests · 15 companions
│   ├── plantsCatalog.ts    Catalog accessors + region/category search helpers
│   ├── regions.ts          The 6 growing regions (labels, blurbs, map centers, default zone)
│   ├── companions.ts       Curated growing detail for the dataset's companion plants
│   ├── pests.ts            Pests/critters/diseases derived from the dataset
│   ├── zones.ts            USDA hardiness zones 1a–13b (optional secondary context)
│   ├── nurseries.ts        Sample nurseries (scattered around the region center for the demo)
│   └── recommendations.ts  Region-aware recommendation engine (the F5 differentiator)
├── storage/                db.ts (SQLite) · plantRepository · preferences · auth (interface)
├── context/                PreferencesContext · AuthContext · GardenContext
├── navigation/             RootNavigator · AuthNavigator · MainNavigator + typed param lists
├── components/             Logo · PlantListItem · PestChips · RegionPicker · CatalogPicker · ZonePicker · …
└── screens/                Splash · Login · Register · MyGarden · PlantDetail ·
                            AddEditPlant · Recommendations · Map · Settings

scripts/buildCatalog.mjs    Regenerates regionalCatalog.generated.ts from the source dataset
```

---

## How the screens satisfy the required user stories

| US | Requirement | Where it lives |
|---|---|---|
| **US-1** | Create an account | `RegisterScreen` → `AuthService.signUp` → redirect to Login |
| **US-2** | Login / logout | `LoginScreen` → session; Settings → **Log Out** → Login |
| **US-3** | View a list of items | `MyGardenScreen` — `FlatList` of plants |
| **US-4** | Add an item | `AddEditPlantScreen` → browse the **region catalog** (`CatalogPicker`) to autofill, or type your own → SQLite, appears in the list |
| **US-5** | Edit / delete an item | `PlantDetailScreen` edit + delete (with confirm dialog) |
| **US-6** | View items on a map with markers | `MapScreen` — bed + nursery markers around your region; "View on Map" from a plant |
| **US-7** | Filter list by location | My Garden + Map "All / My region / Near me" filter (`expo-location`) |

Mission features **F1–F8** from the Conception doc map onto these same screens (auth, list, add,
edit/delete, recommendations, map, location filter, device preferences).

> **`FlatList` ≈ `RecyclerView`:** the course names RecyclerView for US-3; in React Native, `FlatList`
> is the equivalent virtualized list. Confirm acceptance with the instructor (see project notes).

---

## Knowledge base & data

GardenGuard ships a curated **6-region dataset** (Northeast, Southeast, North Central, South Central,
Pacific Northwest, Southwest) covering **123 growable plants** across flowers, herbs, and vegetables,
**35 pests/diseases**, and **15 organic companion plants**. Each plant carries the regions it grows in
and the pests it commonly faces; each pest maps to the companion plants that repel it.

- **Source of truth:** the team's regional JSON files (`Group 4 - GardenGuard Data Plus`).
- **Build step:** `node scripts/buildCatalog.mjs` cleans the source (strips a malformed annotation,
  de-dupes, normalizes plant/pest name variants), slugifies ids, and emits the typed
  `src/data/regionalCatalog.generated.ts`. **Re-run it whenever the source data changes.**
- **Region is primary:** your chosen region drives the catalog, the recommendations, and the list
  filter. USDA hardiness zone is kept as optional secondary context (plant detail, seasonal tips).
- **Companion detail** (growing needs + the "why it works" note) lives in `companions.ts`; the
  pest → companion mapping itself comes straight from the dataset, so the two never drift.

> Regenerate the dataset module: `node scripts/buildCatalog.mjs`

## Stretch goals implemented

The Conception doc names Push Notifications and Accessibility as the recommended first stretch goals;
both are in, alongside the "Pest of the season" secondary feature:

- **Seasonal "Pest of the Season" intelligence** — an **In season now** card on My Garden shows a
  region-specific tip (e.g. *"Japanese Beetles are active around June in the Southeast — consider
  planting garlic"*) and deep-links into the matching companion recommendations.
- **Local seasonal notifications** — opt-in in Settings: schedules a monthly region-based reminder and
  offers a one-tap **preview tip**. Local-only (no server); see the note under Known limitations.
- **Accessibility** — screen-reader labels/roles on icon-only controls (edit/delete, FAB, map
  filters, password toggle), accessible plant-row summaries, plus light/dark/system theming and OS
  font scaling. Especially aimed at the older-gardener segment (the "Anita" persona).
- **Search** — the My Garden list is searchable by plant name, location, or pest.

## Roadmap

Sequenced to the course modules (Demo I is Module 4 = data/lists, **before** the auth and maps modules):

- **Now (local-first MVP):** auth gate, garden CRUD on SQLite, the real **6-region dataset**, a
  region-aware recommendations engine (by pest **or** by plant), region catalog browse, map, settings.
- **Module 5 — Firebase/Auth:** swap the local `AuthService` for **AWS Cognito** (Amplify); the screens
  don't change because they only depend on the `AuthService` interface. Add AppSync/DynamoDB sync
  behind the existing `plantRepository`.
- **Module 6 — Maps:** restricted Google Maps API key + dev build; nursery data from a places source.
- **Module 7 — UX/Material:** accessibility pass (labels, contrast, large text), polish, Demo II.

### Known limitations (MVP)
- Auth is a **non-secure local stub** (passwords are hashed weakly on-device) — placeholder for Cognito.
- Nurseries are **sample data** scattered around the user for the demo, not a live places feed.
- No cloud sync yet; data is per-device.
- Notifications are **local only**: remote push isn't supported in Expo Go (SDK 53+), but the local
  seasonal reminders here work in both Expo Go and a dev build.
- Recommendations are **organic-gardening guidance, not certified agronomic advice.**

---

## License

Coursework for SWENG 888 (Penn State). Not for redistribution.
