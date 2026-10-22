$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$checkpointDir = Join-Path $projectRoot 'backups'
New-Item -ItemType Directory -Force -Path $checkpointDir | Out-Null
$checkpointPath = Join-Path $checkpointDir ('unfiled-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.zip')
$sourceFiles = @('public', 'locales', 'scripts', 'english.test.mjs', 'README_EN.md', 'START_HERE.txt', 'ITCH_PAGE_EN.md', 'start-en.cmd', 'release.ps1', 'server.mjs', 'cases.mjs', 'narratives.mjs', 'game.mjs', 'objects.mjs', 'ai.mjs', 'ai.test.mjs', 'package.json', 'README.md', '.env.example', '.gitignore', 'test.mjs', 'backup.ps1', 'DESIGN.md', 'setup-key.ps1', 'setup-key.cmd', 'start.cmd') | ForEach-Object { Join-Path $projectRoot $_ }
Compress-Archive -LiteralPath $sourceFiles -DestinationPath $checkpointPath
Write-Output $checkpointPath
