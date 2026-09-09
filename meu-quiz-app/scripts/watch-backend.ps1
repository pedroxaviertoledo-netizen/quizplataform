$ErrorActionPreference = 'Continue'
$projectPath = Split-Path -Parent $PSScriptRoot
$port = 3000

Write-Host "Monitor do Quiz Platform ativo."
Write-Host "Acesse http://localhost:$port"
Write-Host "Pressione Ctrl+C para encerrar."

while ($true) {
    $listener = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue

    if ($listener) {
        Write-Host "Backend ja esta ativo na porta $port. Monitorando..."
        Start-Sleep -Seconds 5
        continue
    }

    Write-Host "Iniciando backend..."
    $process = Start-Process -FilePath 'node' -ArgumentList 'server.js' -WorkingDirectory $projectPath -PassThru -Wait
    Write-Host "Backend encerrou com código $($process.ExitCode). Reiniciando em 2 segundos..."
    Start-Sleep -Seconds 2
}
