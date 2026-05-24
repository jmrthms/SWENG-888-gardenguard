# GardenGuard

> **Grow naturally. Defend organically.**

GardenGuard helps home gardeners grow healthy, chemical-free gardens by recommending
**region-appropriate companion plants** that naturally repel local pests and critters. Set your
USDA hardiness zone, build a list of the plants you grow (each tagged with the pests it deters and
where it's planted), get organic companion recommendations, and see your garden beds and nearby
nurseries on a map.

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
| Maps & location | `react-native-maps` + `expo-location` |
| Notifications | `expo-notifications` (local, zone-based seasonal tips) |
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

> **First launch:** create an account (Register), then log in. Your zone is captured at sign-up and
> drives the recommendations. Add a plant, or open **Recommend** to get organic companions for a pest.

### Maps note
`react-native-maps` renders in **Expo Go on Android** out of the box. For a **standalone / dev build**,
add a Google Maps Android API key to `app.json` under `expo.android.config.googleMaps.apiKey`
(restricted by package name + SHA-1 — see the team's private channel). On iOS it uses Apple Maps by
default. Web is intentionally out of scope; the Map screen shows a list fallback there.

---

## Project structure

```
App.tsx                     Providers (SafeArea · Preferences · Auth) + theme + navigation
index.ts                    Expo entry point
src/
├── theme/                  Brand palette + MD3 Paper themes + matching nav themes
├── models/types.ts         Domain models (Plant, CatalogPlant, Pest, Nursery, Preferences, User)
├── data/                   Seeded knowledge base
│   ├── plantsCatalog.ts    20 companion plants → pests they repel, zone range, needs
│   ├── pests.ts            Pest & critter catalog
│   ├── zones.ts            USDA hardiness zones 1a–13b
│   ├── nurseries.ts        Sample nurseries (scattered around the user for the demo)
│   └── recommendations.ts  Zone-aware recommendation engine (the F5 differentiator)
├── storage/                db.ts (SQLite) · plantRepository · preferences · auth (interface)
├── context/                PreferencesContext · AuthContext · GardenContext
├── navigation/             RootNavigator · AuthNavigator · MainNavigator + typed param lists
├── components/             Logo · PlantListItem · PestChips · ZonePicker · EmptyState · …
└── screens/                Splash · Login · Register · MyGarden · PlantDetail ·
                            AddEditPlant · Recommendations · Map · Settings
```

---

## How the screens satisfy the required user stories

| US | Requirement | Where it lives |
|---|---|---|
| **US-1** | Create an account | `RegisterScreen` → `AuthService.signUp` → redirect to Login |
| **US-2** | Login / logout | `LoginScreen` → session; Settings → **Log Out** → Login |
| **US-3** | View a list of items | `MyGardenScreen` — `FlatList` of plants |
| **US-4** | Add an item | `AddEditPlantScreen` → SQLite, appears in the list |
| **US-5** | Edit / delete an item | `PlantDetailScreen` edit + delete (with confirm dialog) |
| **US-6** | View items on a map with markers | `MapScreen` — bed + nursery markers; "View on Map" from a plant |
| **US-7** | Filter list by location | My Garden + Map "All / My zone / Near me" filter (`expo-location`) |

Mission features **F1–F8** from the Conception doc map onto these same screens (auth, list, add,
edit/delete, recommendations, map, location filter, device preferences).

> **`FlatList` ≈ `RecyclerView`:** the course names RecyclerView for US-3; in React Native, `FlatList`
> is the equivalent virtualized list. Confirm acceptance with the instructor (see project notes).

---

## Stretch goals implemented

The Conception doc names Push Notifications and Accessibility as the recommended first stretch goals;
both are in, alongside the "Pest of the season" secondary feature:

- **Seasonal "Pest of the Season" intelligence** — an **In season now** card on My Garden shows a
  zone-specific tip (e.g. *"Aphids are active around May in Zone 8a — consider planting marigold"*)
  and deep-links into the matching companion recommendations.
- **Local seasonal notifications** — opt-in in Settings: schedules a monthly zone-based reminder and
  offers a one-tap **preview tip**. Local-only (no server); see the note under Known limitations.
- **Accessibility** — screen-reader labels/roles on icon-only controls (edit/delete, FAB, map
  filters, password toggle), accessible plant-row summaries, plus light/dark/system theming and OS
  font scaling. Especially aimed at the older-gardener segment (the "Anita" persona).
- **Search** — the My Garden list is searchable by plant name, location, or pest.

## Roadmap

Sequenced to the course modules (Demo I is Module 4 = data/lists, **before** the auth and maps modules):

- **Now (local-first MVP):** auth gate, garden CRUD on SQLite, recommendations engine, map, settings.
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
