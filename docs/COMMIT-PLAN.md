# Proposed commit sequence

Run from the madlease repository root on your current branch. These commands have **not** been executed. Each changed/new file is assigned once across 22 commits. No coauthor trailers are included.

These are file-level groups of an integrated implementation, not independently buildable milestones. The complete working tree passed lint and build; intermediate commits have cross-group dependencies. Run the groups in order and review each staged diff before committing. Backend setup remains deferred. Temporary test artifacts were deleted and are excluded.

## 1. build: add typography and shadcn styling dependencies

```powershell
git add -- package.json package-lock.json vite.config.js
git diff --cached --stat
git commit -m "build: add typography and shadcn styling dependencies"
```

## 2. feat: add shared shadcn button and card components

```powershell
git add -- src/components/ui/button.jsx src/components/ui/card.jsx src/lib/utils.js src/styles/ui.css
git diff --cached --stat
git commit -m "feat: add shared shadcn button and card components"
```

## 3. style: add warm theme tokens and housing textures

```powershell
git add -- src/styles/tokens.css public/textures/floorplan.svg public/textures/linen.svg public/licenses/dm-sans.txt public/licenses/lora.txt public/licenses/ui-credits.txt docs/UI-CREDITS.md
git diff --cached --stat
git commit -m "style: add warm theme tokens and housing textures"
```

## 4. feat: add listing validation and display helpers

```powershell
git add -- src/lib/validation.js src/lib/format.js
git diff --cached --stat
git commit -m "feat: add listing validation and display helpers"
```

## 5. feat: add URL filter helpers and responsive input hooks

```powershell
git add -- src/lib/filters.js src/components/DebouncedInput.jsx src/lib/useIsMobile.js
git diff --cached --stat
git commit -m "feat: add URL filter helpers and responsive input hooks"
```

## 6. feat: support listing persistence and image processing

```powershell
git add -- src/lib/api.js src/lib/images.js
git diff --cached --stat
git commit -m "support listing persistence and image processing"
```

## 7. feat: add shared toast notifications

```powershell
git add -- src/context/ToastProvider.jsx src/context/toast.js
git diff --cached --stat
git commit -m "add shared toast notifications"
```

## 8. feat: add saved listing state and save controls

```powershell
git add -- src/context/SavedProvider.jsx src/context/saved.js src/components/SaveButton.jsx
git diff --cached --stat
git commit -m "feat: add saved listing state and save controls"
```

## 9. feat: add listing cards and loading placeholders

```powershell
git add -- src/components/ListingCard.jsx src/components/CardSkeleton.jsx
git diff --cached --stat
git commit -m "add listing cards and loading placeholders"
```

## 10. feat: add responsive listing filters

```powershell
git add -- src/components/FilterBar.jsx src/components/FilterPanel.jsx
git diff --cached --stat
git commit -m "add responsive listing filters"
```

## 11. feat: generate a simplified campus map from OpenStreetMap

```powershell
git add -- scripts/fetch-basemap.mjs src/data/campus-map.json src/components/CampusMap.jsx
git diff --cached --stat
git commit -m "generate a simplified campus map from OpenStreetMap, old too bloated"
```

## 12. feat: add interactive building highlights and price labels

```powershell
git add -- src/components/BuildingShape.jsx src/components/PricePill.jsx
git diff --cached --stat
git commit -m "feat: add interactive building highlights and price labels"
```

## 13. feat: add map navigation and editable walk destinations

```powershell
git add -- src/components/BrowseMap.jsx src/components/MapCamera.jsx src/lib/useLandmark.js src/styles/map.css
git diff --cached --stat
git commit -m "feat: add map navigation and editable walk destinations"
```

## 14. feat: add location pinning and optional CARTO tiles

```powershell
git add -- src/components/PinMap.jsx src/components/MapTiles.jsx src/lib/carto.js
git diff --cached --stat
git commit -m "feat: add location pinning and optional CARTO tiles"
```

## 15. feat: add listing details and photo viewer

```powershell
git add -- src/components/ListingDetail.jsx src/components/PhotoViewer.jsx src/components/PosterCard.jsx src/styles/detail.css
git diff --cached --stat
git commit -m "feat: add listing details and photo viewer"
```

## 16. feat: connect browse filters and map selection

```powershell
git add -- src/pages/Browse.jsx src/styles/browse.css
git diff --cached --stat
git commit -m "feat: connect browse filters and map selection"
```

## 17. feat: complete sublease editing and photo uploads

```powershell
git add -- src/pages/ListingForm.jsx src/styles/pages.css
git diff --cached --stat
git commit -m "feat: complete sublease editing and photo uploads"
```

## 18. feat: add profile editing and listing management

```powershell
git add -- src/pages/Profile.jsx
git diff --cached --stat
git commit -m "feat: add profile editing and listing management"
```

## 19. feat: add reduced-motion-aware reveal and scroll effects

```powershell
git add -- src/components/Reveal.jsx src/lib/useScrollScene.js
git diff --cached --stat
git commit -m "add reduced-motion-aware reveal and scroll effects on hero"
```

## 20. feat: expand the textured landing page with FAQs

```powershell
git add -- src/pages/Landing.jsx src/components/LandingFaq.jsx src/styles/housing.css src/index.css
git diff --cached --stat
git commit -m "feat: expand the textured landing page with FAQs"
```

## 21. feat: integrate app navigation and deployment configuration

```powershell
git add -- src/App.jsx src/components/Nav.jsx .github/workflows/deploy.yml
git diff --cached --stat
git commit -m "feat: integrate app navigation and deployment configuration"
```

## 22. docs: document setup verification and commit sequence

```powershell
git add -- README.md docs/ARCHITECTURE.md docs/TESTING.md docs/COMMIT-PLAN.md
git diff --cached --stat
git commit -m "document setup verification and updated docs"
```
