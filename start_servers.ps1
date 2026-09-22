$host.UI.RawUI.WindowTitle = 'AI Expense Tracker'

Write-Host ''
Write-Host '  =============================================' -ForegroundColor Cyan
Write-Host '   AI Expense Tracker - Starting Servers...' -ForegroundColor Cyan
Write-Host '  =============================================' -ForegroundColor Cyan
Write-Host ''

Write-Host '  [1/2] Starting Flask Backend (Port 5000)...' -ForegroundColor Yellow
$backend = Start-Process python -ArgumentList 'run.py' -WorkingDirectory "$PSScriptRoot\Backend" -PassThru -WindowStyle Hidden

Write-Host '  [2/2] Starting Vite Frontend (Port 3000)...' -ForegroundColor Yellow
$frontend = Start-Process cmd -ArgumentList '/c npm run dev' -WorkingDirectory "$PSScriptRoot\Frontend" -PassThru -WindowStyle Hidden

Write-Host ''
Write-Host '  Waiting for servers to start (10 sec)...' -ForegroundColor DarkYellow

# Progress bar dikhao
for ($i = 1; $i -le 10; $i++) {
    Write-Host -NoNewline "  ["
    Write-Host -NoNewline ("#" * $i) -ForegroundColor Green
    Write-Host -NoNewline ("." * (10 - $i))
    Write-Host "] $($i * 10)%`r" -NoNewline
    Start-Sleep -Seconds 1
}

Write-Host ''
Write-Host ''
Write-Host '  Opening website in browser...' -ForegroundColor Green
Start-Process 'http://localhost:3000'

Write-Host ''
Write-Host '  =============================================' -ForegroundColor Green
Write-Host '   Servers are RUNNING!' -ForegroundColor Green
Write-Host ''
Write-Host '   Frontend : http://localhost:3000' -ForegroundColor White
Write-Host '   Backend  : http://localhost:5000' -ForegroundColor White
Write-Host ''
Write-Host '   Press CTRL+C or close this window' -ForegroundColor Red
Write-Host '   to STOP ALL servers automatically.' -ForegroundColor Red
Write-Host '  =============================================' -ForegroundColor Green
Write-Host ''

# Cleanup function
function Stop-AllServers {
    Write-Host ''
    Write-Host '  Stopping all servers...' -ForegroundColor Yellow

    # Backend stop
    if ($backend -and !$backend.HasExited) {
        Stop-Process -Id $backend.Id -Force -ErrorAction SilentlyContinue
    }
    # Kill all python processes related to flask
    Get-Process -Name python -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process -Name py -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

    # Frontend stop
    if ($frontend -and !$frontend.HasExited) {
        Stop-Process -Id $frontend.Id -Force -ErrorAction SilentlyContinue
        # Kill child processes of the cmd (node.exe)
        $children = Get-WmiObject Win32_Process | Where-Object { $_.ParentProcessId -eq $frontend.Id }
        foreach ($child in $children) {
            Stop-Process -Id $child.ProcessId -Force -ErrorAction SilentlyContinue
        }
    }
    Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

    Write-Host '  All servers stopped. Goodbye!' -ForegroundColor Red
    Start-Sleep -Seconds 2
}

# Ctrl+C / window close pe cleanup
Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Stop-AllServers } | Out-Null

try {
    while ($true) {
        Start-Sleep -Seconds 3

        # Check karo agar koi server crash ho gaya
        if ($backend.HasExited) {
            Write-Host '  [WARNING] Backend server crashed! Restart Start.bat.' -ForegroundColor Red
        }
        if ($frontend.HasExited) {
            Write-Host '  [WARNING] Frontend server crashed! Restart Start.bat.' -ForegroundColor Red
        }
    }
}
finally {
    Stop-AllServers
}
