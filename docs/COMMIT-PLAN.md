# Commit and merge plan

The earlier 22-commit plan is already committed on `supabase-v1`. Only this follow-up remains: four commits covering all 13 changed/new files. No commands below have been executed and no coauthor trailers are included.

## Commit the follow-up in one paste

Paste this entire block into PowerShell from the repository root. It stops on any Git failure, requires the expected branch, and refuses to include pre-existing staged changes. It does not push or merge.

```powershell
& {
  if ((git branch --show-current) -ne 'supabase-v1') { throw 'Switch to supabase-v1 first.' }
  if (git diff --cached --name-only) { throw 'The index is not empty. Review staged changes first.' }

  git add -- src/main.jsx src/lib/api.js src/pages/SignIn.jsx src/components/MissingEnv.jsx
  if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
  git commit -m "allow public browsing before backend setup"
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }

  git add -- src/lib/demoListings.js src/pages/Browse.jsx src/styles/browse.css
  if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
  git commit -m "added removable browser-local test subleases for teammates to test"
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }

  git add -- src/components/ListingCard.jsx src/components/SaveButton.jsx
  if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
  git commit -m "fix: label demo listings and prevent saving local examples"
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }

  git add -- README.md docs/ARCHITECTURE.md docs/TESTING.md docs/COMMIT-PLAN.md
  if ($LASTEXITCODE -ne 0) { throw 'Staging failed.' }
  git commit -m "docs: update demo testing and main merge instructions"
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }
}
```

## Merge into main

This is ready to merge as a frontend preview. Backend authentication, posting, and real data/security verification remain deferred. Pushing main triggers the existing GitHub Pages deployment. With no Supabase variables, visitors can browse the map and opt into demo listings; account actions show an unavailable notice.

After the commit block succeeds, paste this separate block to fetch the latest branches, push your feature branch, update local main, merge, and deploy. It stops on conflicts or any command failure. Remote branch protection may require a pull request instead of a direct push; this has not been checked.

```powershell
& {
  if ((git branch --show-current) -ne 'supabase-v1') { throw 'Start on supabase-v1.' }
  if (git status --porcelain) { throw 'Commit or resolve remaining changes first.' }
  git fetch origin
  if ($LASTEXITCODE -ne 0) { throw 'Fetch failed.' }
  git push -u origin supabase-v1
  if ($LASTEXITCODE -ne 0) { throw 'Feature branch push failed.' }
  git switch main
  if ($LASTEXITCODE -ne 0) { throw 'Could not switch to main.' }
  git pull --ff-only origin main
  if ($LASTEXITCODE -ne 0) { throw 'Main needs manual reconciliation.' }
  git merge --no-ff supabase-v1 -m "Merge sublease browsing and frontend improvements"
  if ($LASTEXITCODE -ne 0) { throw 'Resolve merge conflicts before continuing.' }
  git push origin main
  if ($LASTEXITCODE -ne 0) { throw 'Push failed; check branch protection or use a pull request.' }
}
```

If a merge conflicts, resolve the listed files and finish the merge before pushing, or use `git merge --abort` to return to pre-merge main. Do not rerun the entire block blindly. After a successful push, check the Deploy to GitHub Pages run in the repository Actions tab.
