# Building outlines and floating panel — four commits

Demo listings now reuse 25 real OSM footprints from the existing SQL snapshot. University Square has no confirmed outline and remains a circle. Refresh the browser snapshot after updating the SQL by running `node scripts/export-demo-footprints.mjs`. No coordinates were drawn by hand and no code was copied from uwcourses.

Muted red replaces the warm brown/coral accents in light and dark mode. The desktop results panel floats above the map with rounded corners, a translucent surface, and a narrow transparent-track scrollbar. Camera fitting accounts for the panel. Native scrollbar thumb rounding varies by browser; mobile keeps its bottom sheet. Hero scroll animations are unchanged.

Verified with the production preview: 25 polygon paths and one fallback marker, muted red styling, full-width map behind the panel, and no horizontal overflow at 390px. All exported polygons are closed. Lint, production build, and whitespace checks pass. The existing campus bundle-size warning remains.

Paste this entire block into PowerShell from the repo root. It makes four commits and pushes main to trigger Pages deployment. Nothing has been staged, committed, or pushed by Codex. No coauthor trailers are included.

```powershell
& {
  if ((git branch --show-current) -ne 'main') { throw 'Start on main.' }
  if (git diff --cached --name-only) { throw 'Resolve existing staged changes first.' }

  git add -- scripts/export-demo-footprints.mjs src/data/demo-footprints.json
  if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
  git commit -m "export real OSM outlines for local demo buildings instead of circles"
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }

  git add -- src/lib/demoListings.js
  if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
  git commit -m "highlight demo building footprints instead of circle markers"
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }

  git add -- src/styles/tokens.css
  if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
  git commit -m 'add muted red "badger themed" accents and building highlights'
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }

  git add -- src/styles/browse.css src/components/MapCamera.jsx docs/COMMIT-PLAN.md
  if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
  git commit -m "float the results panel and soften its scrollbar for better UX"
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }

  git pull --ff-only origin main
  if ($LASTEXITCODE -ne 0) { throw 'Remote main diverged; reconcile before pushing.' }
  git push origin main
  if ($LASTEXITCODE -ne 0) { throw 'Push failed.' }
}
```

After deployment succeeds in GitHub Actions, reload the site. Previously enabled demo listings automatically use the new outlines.
