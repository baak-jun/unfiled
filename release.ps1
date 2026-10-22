$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
Push-Location $projectRoot
try {
    node scripts/build-locales.mjs
    if ($LASTEXITCODE -ne 0) { throw 'English build failed.' }
    $releaseVersion = (Get-Content package.json -Raw | ConvertFrom-Json).version
    $releaseDir = Join-Path $projectRoot 'dist'
    New-Item -ItemType Directory -Force -Path $releaseDir | Out-Null
    $stageDir = Join-Path $releaseDir ('stage-' + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $stageDir | Out-Null
    # Explicit allowlist: never copy .env, Git data, backups or editor files.
    $releaseFiles = @('server.mjs','cases.mjs','narratives.mjs','game.mjs','objects.mjs','ai.mjs','ai.test.mjs','test.mjs','english.test.mjs','package.json','README.md','README_EN.md','START_HERE.txt','ITCH_PAGE_EN.md','.env.example','.gitignore','DESIGN.md','setup-key.ps1','setup-key.cmd','start.cmd','start-en.cmd','backup.ps1','release.ps1','scripts/build-locales.mjs','public/index.html','public/app.js','public/style.css','public/room.svg','public/en/index.html','public/en/app.js','locales/en/cases.mjs','locales/en/narratives.mjs','locales/en/game.mjs','locales/en/objects.mjs','locales/en/errors.json','locales/en/ui.tsv','locales/en/engine.tsv')
    foreach ($relative in $releaseFiles) {
        $destination = Join-Path $stageDir $relative
        New-Item -ItemType Directory -Force -Path (Split-Path $destination) | Out-Null
        Copy-Item -LiteralPath (Join-Path $projectRoot $relative) -Destination $destination
    }
    Copy-Item -LiteralPath (Join-Path $projectRoot 'scripts/release-manifest.mjs') -Destination (Join-Path $stageDir 'scripts/release-manifest.mjs')
    node scripts/release-manifest.mjs $stageDir
    if ($LASTEXITCODE -ne 0) { throw 'Manifest generation failed.' }
    $archive = Join-Path $releaseDir ('unfiled-' + $releaseVersion + '-local.zip')
    Compress-Archive -Path (Join-Path $stageDir '*') -DestinationPath $archive -Force
    Write-Output ('Release archive: ' + $archive)
    Write-Output ('Staging folder: ' + $stageDir)
    node scripts/release-manifest.mjs $archive
} finally { Pop-Location }
