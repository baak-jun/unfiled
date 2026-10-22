$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$checkpointDir = Join-Path $projectRoot 'backups'
New-Item -ItemType Directory -Force -Path $checkpointDir | Out-Null
$checkpointPath = Join-Path $checkpointDir ('unfiled-' + (Get-Date -Format 'yyyyMMdd-HHmmss') + '.zip')
$sourceFiles = @('public', 'server.mjs', 'cases.mjs', 'game.mjs', 'objects.mjs', 'ai.mjs', 'ai.test.mjs', 'package.json', 'README.md', '.env.example', '.gitignore', 'test.mjs', 'backup.ps1', 'DESIGN.md', 'setup-key.ps1', 'setup-key.cmd', 'start.cmd') | ForEach-Object { Join-Path $projectRoot $_ }
Compress-Archive -LiteralPath $sourceFiles -DestinationPath $checkpointPath
Write-Output $checkpointPath
