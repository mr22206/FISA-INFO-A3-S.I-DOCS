## 6. Déploiement de Logiciel à Distance (`Invoke-RemoteInstall.ps1`)

Maintenir un parc applicatif homogène est un enjeu de sécurité et de support. Ce script permet d'installer silencieusement une application au format MSI sur un ou plusieurs ordinateurs du réseau.

### Code Source Commenté

```powershell
<#
.SYNOPSIS
    Installe une application MSI sur une liste d'ordinateurs distants.
.DESCRIPTION
    Ce script facilite le télédéploiement de logiciels. Il copie le fichier d'installation
    MSI sur la machine distante, puis utilise WMI (Windows Management Instrumentation) pour
    lancer l'installation silencieuse. Il nettoie le fichier d'installation à la fin.
.PARAMETER ComputerName
    Un ou plusieurs noms d'ordinateurs sur lesquels installer le logiciel.
.PARAMETER MsiPath
    Le chemin UNC du paquet MSI à installer (ex: "\\SRV-FICHIERS\Deploy\7z.msi").
.EXAMPLE
    # Installer 7-Zip sur deux postes
    .\Invoke-RemoteInstall.ps1 -ComputerName "PC-COMPTA-01", "PC-RH-05" -MsiPath "\\SRV-FICHIERS\Deploy\7z.msi"
#>
param (
    [Parameter(Mandatory=$true)]
    [string[]]$ComputerName,

    [Parameter(Mandatory=$true)]
    [string]$MsiPath
)

# --- DEBUT DU SCRIPT ---

# --- Vérification des Prérequis ---
if (-not (Test-Path -Path $MsiPath -PathType Leaf)) {
    Write-Error "Le fichier MSI '$MsiPath' est introuvable."
    return
}
$MsiFilename = Split-Path -Path $MsiPath -Leaf

# --- Boucle sur chaque ordinateur ---
foreach ($computer in $ComputerName) {
    Write-Host "--- Début du déploiement sur $computer ---"

    # 1. Vérifier la connectivité
    if (-not (Test-Connection -ComputerName $computer -Count 1 -Quiet)) {
        Write-Warning "L'ordinateur $computer est injoignable (ping a échoué)."
        continue # Passe à l'ordinateur suivant
    }

    $remoteTempPath = "\\$computer\C$\Temp"
    $remoteMsiPath = Join-Path -Path $remoteTempPath -ChildPath $MsiFilename

    # 2. Créer le dossier C:\Temp distant s'il n'existe pas
    if (-not (Test-Path -Path $remoteTempPath)) {
        try {
            New-Item -Path $remoteTempPath -ItemType Directory -Force | Out-Null
        } catch {
             Write-Warning "Impossible de créer C:\Temp sur $computer. Vérifiez les permissions."
             continue
        }
    }

    # 3. Copier le MSI sur la machine distante
    Write-Host "Copie de $MsiFilename vers $computer..."
    try {
        Copy-Item -Path $MsiPath -Destination $remoteTempPath -Force -ErrorAction Stop
    } catch {
        Write-Warning "Échec de la copie du fichier sur $computer. Vérifiez l'accès à C$."
        continue
    }

    # 4. Lancer l'installation via WMI
    # L'option /qn signifie Quiet (silencieux) et No UI (pas d'interface).
    # REBOOT=ReallySuppress évite un redémarrage forcé.
    $installCommand = "msiexec.exe /i `"$remoteMsiPath`" /qn REBOOT=ReallySuppress"
    Write-Host "Lancement de l'installation silencieuse sur $computer..."
    
    try {
        # On utilise Invoke-WmiMethod pour rester compatible avec d'anciennes versions de PS.
        # Pour des environnements modernes, Invoke-CimMethod serait préférable.
        $result = Invoke-WmiMethod -Class Win32_Process -Name Create -ArgumentList $installCommand -ComputerName $computer -ErrorAction Stop
        
        if ($result.ReturnValue -eq 0) {
            Write-Host "Installation lancée avec succès sur $computer (Process ID: $($result.ProcessId))." -ForegroundColor Green
        } else {
            Write-Warning "L'installation a échoué sur $computer avec le code de retour : $($result.ReturnValue)."
        }
    } catch {
        Write-Warning "Échec du lancement de l'installation sur $computer. Vérifiez les droits WMI."
        continue
    } finally {
        # 5. Nettoyage du fichier d'installation
        Write-Host "Nettoyage du fichier d'installation sur $computer..."
        if (Test-Path -Path $remoteMsiPath) {
            Remove-Item -Path $remoteMsiPath -Force
        }
    }
    Write-Host "--- Fin du déploiement sur $computer ---"
}
```

### Contextualisation

Ce script est un outil tactique pour les administrateurs système. Il est parfait pour déployer une application ou un patch de sécurité sur un ensemble de machines ciblées sans avoir à se déplacer. Pour un déploiement à grande échelle et automatisé, il serait préférable d'utiliser une solution plus complète comme la GPO "Installation de logiciel" ou un outil de télédistribution, mais ce script répond à un besoin d'agilité pour l'équipe IT de XANADU.

### Bonnes Pratiques

-   **Gestion de plusieurs cibles** : Le paramètre `-ComputerName` accepte un tableau de chaînes, permettant de viser plusieurs machines en une seule commande.
-   **Robustesse** : Le script teste la connectivité de la machine (`ping`) avant de tenter quoi que ce soit. Il utilise des blocs `try/catch` pour chaque étape critique (copie, exécution).
-   **Installation Silencieuse** : L'utilisation des paramètres `/qn REBOOT=ReallySuppress` garantit que l'installation se fait en arrière-plan sans déranger l'utilisateur et sans forcer un redémarrage.
-   **Nettoyage** : Le bloc `finally` assure que le fichier d'installation MSI est supprimé de la machine distante, que l'installation ait réussi ou non.
-   **Compatibilité** : L'utilisation de `Invoke-WmiMethod` le rend compatible avec des environnements Windows plus anciens.
