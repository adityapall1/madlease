# Landing page and creator links — three commits

Aditya Pall’s LinkedIn, GitHub, and portfolio links are connected and open in new tabs. The other two creator cards retain placeholders. These groups cover all current changes, including the footer pages, expanded landing story, background parallax, and styling. Lint and whitespace checks pass; the full feature build passed before the URL-only update.

Paste the entire block into PowerShell from the repository root. It stops on errors. It does not push. Nothing has been staged or committed by Codex, and there are no coauthor trailers.

```powershell
& {
  if ((git branch --show-current) -ne 'main') { throw 'Start on main.' }
  if (git diff --cached --name-only) { throw 'Review existing staged changes first.' }

  git add -- src/App.jsx src/pages/Information.jsx src/components/SiteFooter.jsx
  if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
  git commit -m "add creator profiles, social links, and informational footer pages"
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }

  git add -- src/pages/Landing.jsx src/components/LandingStory.jsx src/lib/useLandingParallax.js
  if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
  git commit -m "expand the landing story with creator highlights and background parallax"
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }

  git add -- src/index.css src/styles/editorial.css docs/COMMIT-PLAN.md
  if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
  git commit -m "style responsive creator cards, content pages, and footer navigation"
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }
}
```

These are groups of one integrated update; intermediate commits depend on later files. If a commit succeeds and a later command fails, resume from the failed step rather than rerunning the whole block.
