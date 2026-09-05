# Tracker Enhancements — Design Spec (2026-09-05)

## 1. Background

The Tracker page (`frontend/app/(authenticated)/tracker/page.tsx`) already has sales recording,
stock add/adjust, charts, reorder alerts, and customer analytics. Two gaps:

1. The **Add Stock modal only lists already-tracked products**. Onboarding a catalog
   product into the tracker requires leaving the page (Products → Track via
   `POST /tracker/sync/single`).
2. **Currency is per-product but not editable in Tracker**, and dashboard totals are raw
   sums with no conversion. `Product.currency` (default `USD`) and
   `TrackerProduct.currency` (nullable) exist; reads already fall back
   (`tp.currency || tp.product.currency || 'USD'` in `tracker.service.ts`).

Supported currencies (same 7 as Products page): USD, EUR, GBP, INR, JPY, AUD, CAD.

## 2. Agreed decisions (from brainstorming)

- **Approach A (hybrid)**: backend persists FX rates + per-product currency; frontend
  converts for display only.
- **Add Stock flow**: two-step — Track first (`syncSingle`), then Add Stock (`addStock`)
  as a separate confirm.
- **FX rates**: user-editable table (no external API, no hardcoded-only rates).
- **Extras (all four)**: untracked list in modal, dashboard in display FX, record-sale
  in row currency, inline threshold/supplier edit.

## 3. Architecture

- Backend: one new `FxRate` model + `GET/PUT /tracker/fx-rates`; one new
  `User.displayCurrency` field (default `USD`) persisted via the existing
  `PUT /users/me` (extend `UpdateUserDto`); one-line change in `syncSingle`
  to copy currency. No changes to sales/stock movement math (stored values immutable).
- Frontend: extend the existing inline Add Stock modal with tabs; add a header
  display-currency selector; add an FX rates modal; add a `convertCurrency` util in
  `lib/api.ts`. All conversion is display-only.

## 4. Components

### 4.1 Add Stock modal (extend existing, `tracker/page.tsx:697-746`)

- Two tabs: **Tracked** (current behavior: tracked-product dropdown → quantity,
  purchase price, notes → confirm → `POST /tracker/stock`) and **Catalog** (products
  from the catalog API not present in `trackerApi.list()`, with search box).
- Catalog rows show a **Track** button → `POST /tracker/sync/single`. On success the
  item moves to the Tracked tab pre-selected; step 2 (quantity form → `POST
  /tracker/stock`) is a separate confirm.
- Validation: quantity ≥ 1; already-tracked products never show Track; double-track
  returns existing (backend `syncSingle` is idempotent).

### 4.2 Per-product currency (no new endpoints)

- Row-level currency dropdown (7 options) in list and grid views, saved via existing
  `PUT /tracker/:id { currency }` (`UpdateTrackerProductDto.currency` already exists).
- `syncSingle` copies `Product.currency` → `TrackerProduct.currency` on create.
- Row revenue/profit and Record Sale unit price render in the row currency.

### 4.3 Global display currency + FX rates (new backend)

- Header display-currency selector (7 options), persisted via `PUT /users/me
  { displayCurrency }` with localStorage fallback.
- `FxRate` model: `id, userId, currency (unique per user), rateToUSD Decimal,
  updatedAt`. `GET /tracker/fx-rates` seeds approximate defaults on first call;
  `PUT /tracker/fx-rates { rates: [{ currency, rateToUSD }] }` upserts (userId-scoped,
  JWT-guarded, rate > 0 validated).
- `convertCurrency(amount, from, to, rates)` in `lib/api.ts`: amount → USD → target.
  Missing rate or same-currency = passthrough with original symbol.
- FX rates modal (header gear): editable table of the 6 non-USD rates + last-updated
  stamp. Display-only: stored sales/stock values never mutated; CSV export keeps
  stored currencies and adds a display-currency column note.

### 4.4 Extras

- **Dashboard in display FX**: stat cards + recharts datasets converted client-side;
  a "shown in {CODE}" label; raw values untouched.
- **Record sale in row currency**: unit-price field labeled with row currency symbol;
  if the user enters a price in another currency, convert to row currency before POST.
- **Inline threshold/supplier edit**: low-stock threshold, reorder qty, supplier name
  editable from the list via existing `PUT /tracker/:id` (all fields already in DTO).
- **Untracked list**: lives in the Add Stock Catalog tab (4.1).

## 5. Data flow

1. Track: Catalog tab → Track → `syncSingle` (copies currency) → reload list →
   auto-select in Tracked tab.
2. Stock: quantity form → `addStock` → toast + `loadData()`.
3. Currency save: row dropdown → `PUT /tracker/:id` → reload.
4. Display: selector + rates load once → `convertCurrency` at render for dashboard,
   rows, charts, customers panel.

## 6. Error handling

- Track of already-tracked product: backend returns existing; frontend treats as
  success and selects it.
- FX rates missing/stale: passthrough with stored currency; banner "rates not set,
  showing stored currencies".
- Invalid rate (≤ 0, NaN): reject with field error, keep old value.
- Cloudinary/NVIDIA paths untouched.

## 7. Testing

- Track from Catalog tab creates TrackerProduct with copied currency, no duplicate on
  re-track.
- Two-step order enforced: stock form disabled until tracking succeeds.
- Currency save persists and row amounts re-render with new symbol.
- Display selector converts dashboard totals; spot-check USD→INR math against table.
- Rates modal rejects zero/negative; CSV still exports stored currencies.

## 8. Out of scope

- Live FX API integration; multi-currency single sale; historical-rate conversion of
  old sales; currency on Products page (already exists); changing stored sale
  currencies retroactively.
