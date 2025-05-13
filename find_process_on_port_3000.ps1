# Pour Windows PowerShell - Exécutez cette commande
$processIds = @(Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess)

if ($processIds.Count -gt 0) {
    foreach ($pid in $processIds) {
        $processInfo = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($processInfo) {
            Write-Host "Processus utilisant le port 3000: $($processInfo.ProcessName) (PID: $pid)"
            Write-Host "Chemin: $($processInfo.Path)"
            
            # Afficher plus d'informations sur le processus
            $processInfo | Format-List Id, ProcessName, Path, StartTime
        }
    }
} else {
    Write-Host "Aucun processus trouvé sur le port 3000."
}