# Production map fix — two commits

The blue map came from missing SVG class names: React Leaflet applies pathOptions after a path mounts, but Leaflet only reads className when creating the SVG. Development StrictMode masked this by mounting again. Classes now go directly into creation props. Leaflet CSS also loads globally before the theme, preventing lazy-loaded defaults from overriding map controls. The homepage now renders the campus backdrop even with zero listings. Attribution keeps the OpenStreetMap credit without the colorful Leaflet badge.

Verified with a production build served by vite preview: light/dark map colors, labeled demo markers, compact attribution, and the homepage map with zero listings. Lint and build pass. Existing hero scroll animations are unchanged.

Paste this entire block into PowerShell from the repo root. You are currently on main. It creates two commits and pushes main, which triggers Pages deployment. It stops on any failure. No coauthor trailers are included. None of these commands has been executed by Codex.

```powershell
& {
  if ((git branch --show-current) -ne 'main') { throw 'Start on main.' }
  if (git diff --cached --name-only) { throw 'Resolve existing staged changes first.' }

  git add -- src/components/CampusMap.jsx src/components/BuildingShape.jsx src/components/BrowseMap.jsx src/components/PinMap.jsx src/components/MapTiles.jsx src/index.css src/styles/map.css
  if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
  git commit -m "fix botched map on deployment"
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }

  git add -- src/pages/Landing.jsx docs/COMMIT-PLAN.md
  if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
  git commit -m "show the homepage campus map without active listings"
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }

  git pull --ff-only origin main
  if ($LASTEXITCODE -ne 0) { throw 'Remote main diverged; reconcile before pushing.' }
  git push origin main
  if ($LASTEXITCODE -ne 0) { throw 'Push failed.' }
}
```

After the Deploy to GitHub Pages run succeeds, reload the live page. Backend setup remains deferred; this fixes map rendering, not email sign-in or posting.
