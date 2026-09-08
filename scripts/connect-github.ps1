param(
  [string]$Repository = 'ys143112/ys143112.github.io'
)
$ErrorActionPreference = 'Stop'
$projectRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '..')).Path
Set-Location -LiteralPath $projectRoot
if ($Repository -notmatch '^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$') { throw 'Repository must be owner/name.' }
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) { throw 'Install GitHub CLI from https://cli.github.com/ and run this script again.' }
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw 'Git is required.' }
gh auth status
if ($LASTEXITCODE -ne 0) {
  gh auth login --hostname github.com --git-protocol https --web
  if ($LASTEXITCODE -ne 0) { throw 'GitHub sign-in was not completed.' }
}
$signedInUser = (gh api user --jq .login).Trim()
if ($LASTEXITCODE -ne 0 -or $signedInUser -ne $Repository.Split('/')[0]) { throw 'Sign in to the owner account named in Repository.' }
gh repo view $Repository --json name 2>$null
if ($LASTEXITCODE -eq 0) { throw 'This repository already exists. Nothing was changed. Review it before using another new name.' }
$env:ASTRO_TELEMETRY_DISABLED = '1'
npm.cmd ci
if ($LASTEXITCODE -ne 0) { throw 'Dependency installation failed.' }
npm.cmd test
if ($LASTEXITCODE -ne 0) { throw 'Tests failed.' }
npm.cmd run check
if ($LASTEXITCODE -ne 0) { throw 'Type checking failed.' }
npm.cmd run build
if ($LASTEXITCODE -ne 0) { throw 'Build failed.' }
if (-not (Test-Path -LiteralPath (Join-Path $projectRoot '.git'))) {
  git init -b main
  if ($LASTEXITCODE -ne 0) { throw 'Git initialization failed.' }
}
$repositoryRoot = (git rev-parse --show-toplevel).Trim()
if ((Resolve-Path -LiteralPath $repositoryRoot).Path -ne $projectRoot) { throw 'Git repository root is not the blog project.' }
$existingOrigin = git remote get-url origin 2>$null
if ($LASTEXITCODE -eq 0) { throw 'An origin remote already exists. Review it before connecting.' }
git add --all
git -c user.name=$signedInUser -c "user.email=$signedInUser@users.noreply.github.com" commit -m 'Create automated blog'
if ($LASTEXITCODE -ne 0) {
  git diff --cached --quiet
  if ($LASTEXITCODE -ne 0) { throw 'Commit failed.' }
}
gh repo create $Repository --public --source . --remote origin --push --description '3D design, development and AI field notes'
if ($LASTEXITCODE -ne 0) { throw 'Repository creation or upload failed. Check GitHub before retrying.' }
gh api --method POST "repos/$Repository/pages" -f build_type=workflow
if ($LASTEXITCODE -ne 0) { throw 'Select GitHub Actions in repository Settings > Pages, then run Publish blog.' }
gh workflow run deploy.yml --repo $Repository --ref main
if ($LASTEXITCODE -ne 0) { throw 'Open Actions > Publish blog > Run workflow.' }
Write-Output "Repository ready: https://github.com/$Repository"
Write-Output 'Open https://app.pagescms.org and connect this repository to start writing.'
