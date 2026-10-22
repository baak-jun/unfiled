$ErrorActionPreference = 'Stop'
$envPath = Join-Path $PSScriptRoot '.env'
Write-Host 'UNFILED - Choose an AI provider'
Write-Host '1 Raon | 2 OpenAI | 3 Gemini | 4 Claude | 5 DeepSeek | 6 Custom OpenAI-compatible'
$selection = Read-Host 'Provider number [1]'
if ([string]::IsNullOrWhiteSpace($selection)) { $selection = '1' }
$providerIds = @{ '1'='raon'; '2'='openai'; '3'='gemini'; '4'='anthropic'; '5'='deepseek'; '6'='custom' }
if (-not $providerIds.ContainsKey($selection)) { throw 'Invalid provider number. No settings changed.' }
$provider = $providerIds[$selection]
Write-Host 'Use a text/chat model ID from your provider console. API billing is provider-specific.'
$model = Read-Host 'Model ID (Raon default: raon-1-mini-preview)'
if ([string]::IsNullOrWhiteSpace($model) -and $provider -eq 'raon') { $model = 'raon-1-mini-preview' }
if ($model -notmatch '^[A-Za-z0-9._:/-]+$') { throw 'Enter a valid model ID. No settings changed.' }
$baseUrl = ''
if ($provider -eq 'custom') {
    $baseUrl = Read-Host 'API base URL including /v1 if needed (NOT /chat/completions)'
    $parsedUrl = $null
    if (-not [Uri]::TryCreate($baseUrl, [UriKind]::Absolute, [ref]$parsedUrl)) { throw 'Invalid API URL.' }
    if ($parsedUrl.UserInfo -or $parsedUrl.Query -or $parsedUrl.Fragment) { throw 'URL must not contain credentials, query or fragment.' }
    if ($parsedUrl.Scheme -ne 'https' -and -not ($parsedUrl.Scheme -eq 'http' -and $parsedUrl.Host -in @('localhost','127.0.0.1','[::1]'))) { throw 'Use HTTPS or localhost HTTP.' }
    Write-Host ('Requests and the entered key will be sent to ' + $parsedUrl.Host)
}
$secureKey = Read-Host 'API key for this provider (hidden input)' -AsSecureString
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
    $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer).Trim()
    if ($apiKey -notmatch '^[A-Za-z0-9._~+/=-]+$') { throw 'Empty key or unexpected characters. No settings changed.' }
    $otherLines = @()
    if (Test-Path -LiteralPath $envPath) {
        $otherLines = @([IO.File]::ReadAllLines($envPath) | Where-Object { $_ -notmatch '^\s*AI_(PROVIDER|MODEL|API_KEY|BASE_URL)\s*=' })
    }
    $envLines = @(
        ('AI_PROVIDER=' + $provider)
        ('AI_MODEL=' + $model)
        ('AI_API_KEY=' + $apiKey)
        ('AI_BASE_URL=' + $baseUrl)
    ) + $otherLines
    [IO.File]::WriteAllLines($envPath, $envLines, [Text.UTF8Encoding]::new($false))
    Write-Host 'Saved locally. Existing provider-specific keys were preserved.'
    Write-Host 'Close the running server and run start.cmd. Never share your .env file.'
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
    $apiKey = $null
    $envLines = $null
    $secureKey.Dispose()
}
