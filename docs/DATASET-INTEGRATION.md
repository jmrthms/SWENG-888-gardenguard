# GardenGuard — Dataset Integration & Demo Notes

Companion notes for the demo/presentation. Covers what was planned vs. what was built, how the
real **6-region dataset** was integrated, the code structure, the challenges, and next steps —
aligned to the presentation rubric.

---

## 1. What changed (before → after)

| Area | Before | After |
|---|---|---|
| Knowledge base | 20 hand-seeded companion plants | **Real 6-region dataset: 123 plants · 35 pests · 15 companions** |
| Geography | USDA hardiness zone only | **Growing region is primary**; zone is optional secondary context |
| Catalog model | A plant "repels" pests | A plant has **pests to watch**; the app recommends **companions that repel them** |
| Add a plant | 100% free-text | **Browse the region catalog** (`CatalogPicker`) to autofill, or type your own |
| Recommendations (F5) | Pick a pest → zone-ranked seed list | **By pest *or* by plant**, ranked **region-first**, switchable region |
| List filter (US-7) | All / My zone / Near me | **All / My region / Near me** |
| Preferences (F8) | zone, units, theme, notifications | **+ region** (picked at sign-up & Settings) |

Nothing regressed: auth, SQLite CRUD, the map, accessibility, search, and seasonal notifications all
still work — they were rewired to the region model, not removed.

---

## 2. How the data was integrated (the pipeline)

```
Group 4 - GardenGuard Data Plus/        scripts/buildCatalog.mjs            src/data/
  <Region>/<Region>_<Category>.JSON  ─►  clean · normalize · slugify · dedupe ─►  regionalCatalog.generated.ts
  (18 files, 510 plant entries)          (one-time/regenerable importer)          (typed module: CATALOG,
                                                                                   DATASET_PESTS, PEST_REMEDIES)
```

- **JSON, not the CSV** is canonical: the CSV duplicated every herb row and leaked southern flowers
  into northern regions. The JSON is nested in the app's own shape and is region-correct.
- The importer fixes real data-quality issues (talking point — see §4): a malformed JSON annotation,
  a duplicate Yarrow, and plant-name variants (Bee Balm/Monarda, Gaillardia, Geranium).
- `node scripts/buildCatalog.mjs` regenerates the module and prints a stat line:
  `123 plants · 35 pests · 15 remedies`.

---

## 3. Code structure (data flows one way)

```
regionalCatalog.generated.ts   CATALOG · DATASET_PESTS · PEST_REMEDIES   (generated facts)
        │
        ├─ plantsCatalog.ts     CATALOG_BY_ID, plantsInRegion(), regionPlantIds()
        ├─ pests.ts             PESTS (derived) + pestLabel/pestIcon
        ├─ companions.ts        COMPANIONS (curated detail + repels derived from PEST_REMEDIES)
        ├─ regions.ts           the 6 regions (labels, blurbs, map centers)
        └─ recommendations.ts   recommendForPest() · companionsForPlant() · toPrefill()
                │
   storage/ (SQLite + AsyncStorage) ─► context/ (Garden, Preferences, Auth) ─► screens/
```

**Code snippets worth showing in the demo:**

- `scripts/buildCatalog.mjs` — `readJsonLoose()` (the malformed-file fix) and the dedupe/slug logic.
- `recommendations.ts` — `rankForRegion()`: region-growable companions sort first, then by pest
  coverage. This is the line that makes the engine *region-aware*.
- `recommendations.ts` — `recommendForPest()` reads `PEST_REMEDIES[pestId]` (straight from the
  dataset) and resolves each to a curated `Companion`.
- `RecommendationsScreen.tsx` — the `By pest` / `Protect a plant` `SegmentedButtons` and the live
  region chip (`recommendForPest` vs `companionsForCatalogPlant`).
- `AddEditPlantScreen.tsx` — `applyCatalog()` autofilling the form from a `CatalogPlant`.

**Live proof it's region-aware:** Marigold grows only in southern regions, so for *aphids* it ranks
5th in the **Southeast** (local) but **last** in the **Northeast** (tagged "Not local").

---

## 4. Challenges & how we solved them

1. **Malformed source data.** `North_Central_Flowers.JSON` had a stray `--> Duplicate?` annotation
   that breaks every JSON parser. → The importer strips inline `-->` notes before parsing
   (`readJsonLoose`), so the source can be fixed once, in code, deterministically.
2. **Two diverging sources (CSV vs JSON).** The CSV duplicated all 156 herb rows and mis-regionalized
   flowers. → We chose the JSON as canonical and documented why; the CSV is kept only as a QA cross-check.
3. **Name variants broke joins.** "Bee Balm" / "Monarda" / "Bee Balm (Monarda)" are one plant. → A
   small canonicalization map + a parenthetical-stripping slug collapse them to one id.
4. **Region vs. USDA zone.** The 6 macro-regions and USDA zones are orthogonal (one region spans many
   zones), so auto-mapping is lossy. → We made **region** a first-class preference and demoted zone to
   optional context, rather than faking a mapping.
5. **Honest modeling.** A tomato doesn't *repel* hornworms — it's *threatened* by them. → We renamed
   the plant's pest list to "pests to watch" and kept "repels" only for companions, which is accurate.

---

## 5. Potential improvements (feasibility noted)

- **Seed the dataset into SQLite** for on-device queries as the catalog grows (low effort — the
  accessors in `plantsCatalog.ts` already isolate screens from the storage shape).
- **AWS Cognito + AppSync/DynamoDB** to replace the local auth stub and sync gardens (Module 5 — the
  `AuthService`/`plantRepository` seams are already in place).
- **Real nursery data** from a places API, region-filtered (today they're demo offsets around the
  region center).
- **Region auto-detect** from GPS at sign-up (we already request location for the map/near-me filter).
- **Per-region pest calendars** so seasonal tips reflect local frost dates, not a national average.

---

## 6. Planned vs. accomplished (F1–F8 · US-1…US-7)

| Item | Status | Notes |
|---|---|---|
| US-1 Create account · US-2 Login/logout | ✅ | Local `AuthService` stub (Cognito-ready). |
| US-3 View list · US-4 Add · US-5 Edit/Delete | ✅ | `FlatList` over per-user SQLite; Add now browses the region catalog. |
| US-6 Map · US-7 Filter by location | ✅ | Bed + nursery markers; All / **My region** / Near me. |
| F5 Companion & pest recommendations | ✅ | **Region-aware**, by pest **or** by plant, from the real dataset. |
| F8 Region & preferences | ✅ | Region (primary) + zone/units/theme/notifications. |
| Secondary: pest-of-season tips | ✅ | Region-worded, dataset-backed companion in every tip. |
| Stretch: notifications · accessibility · search | ✅ | All retained and rewired to the region model. |
| Outstanding | ⏳ | Cognito/AppSync sync; live nursery feed; signed APK for the deliverable. |
