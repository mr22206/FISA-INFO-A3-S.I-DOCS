## 7. Nettoyage des Profils Utilisateurs (`Clean-UserProfiles.ps1`)

Sur les serveurs auxquels plusieurs utilisateurs peuvent se connecter (comme un futur serveur RDS ou un serveur de calcul), les profils utilisateurs peuvent s'accumuler et consommer inutilement de l'espace disque. Ce script nettoie les profils qui n'ont pas été utilisés depuis un certain temps.

### Code Source Commenté

```powershell
<#
.SYNOPSIS
    Supprime les profils utilisateurs locaux sur un serveur qui sont plus vieux qu'un âge spécifié.
.DESCRIPTION
    Ce script utilise WMI pour lister tous les profils utilisateurs sur une machine.
    Il vérifie la date de dernière utilisation de chaque profil et supprime ceux qui
    dépassent l'âge limite défini, à l'exception des comptes systèmes importants.
.PARAMETER ComputerName
    Le nom du serveur sur lequel effectuer le nettoyage. Par défaut, la machine locale.
.PARAMETER InactiveDays
    L'âge en jours au-delà duquel un profil est considéré comme ancien et doit être supprimé.
    La valeur par défaut est 60 jours.
.PARAMETER WhatIf
    Commutateur de simulation. Si présent, le script listera les profils qu'il aurait supprimés
    sans réellement effectuer la suppression.
.EXAMPLE
    # Simuler le nettoyage sur le serveur SRV-APPS-01
    .\Clean-UserProfiles.ps1 -ComputerName "SRV-APPS-01" -InactiveDays 30 -WhatIf
.EXAMPLE
    # Exécuter le nettoyage sur la machine locale pour les profils de plus de 90 jours
    .\Clean-UserProfiles.ps1 -InactiveDays 90
#>
param(
    [string]$ComputerName = $env:COMPUTERNAME,

    [int]$InactiveDays = 60,

    [switch]$WhatIf
)

# --- DEBUT DU SCRIPT ---

Write-Host "Lancement du nettoyage des profils sur $ComputerName pour les profils de plus de $InactiveDays jours."

# --- Liste des profils à exclure ---
# Il est crucial de ne jamais supprimer les profils systèmes ou de service.
$ExcludedProfiles = @(
    "Default",
    "Public",
    "Administrator",
    "systemprofile",
    "LocalService",
    "NetworkService"
)

# --- Connexion WMI et récupération des profils ---
try {
    # La classe Win32_UserProfile contient les informations sur les profils locaux
    $Profiles = Get-WmiObject -Class Win32_UserProfile -ComputerName $ComputerName -ErrorAction Stop
} catch {
    Write-Error "Impossible de récupérer la liste des profils sur $ComputerName. Vérifiez la connectivité et les permissions WMI."
    return
}

$limitDate = (Get-Date).AddDays(-$InactiveDays)

# --- Boucle sur chaque profil trouvé ---
foreach ($Profile in $Profiles) {
    # Le SID permet d'identifier l'utilisateur du profil
    $UserSID = New-Object System.Security.Principal.SecurityIdentifier($Profile.SID)
    $UserName = $UserSID.Translate([System.Security.Principal.NTAccount]).Value
    
    # On vérifie si le profil ne fait pas partie de la liste d'exclusion
    $isExcluded = $false
    foreach ($exclusion in $ExcludedProfiles) {
        if ($UserName -like "*\$exclusion") {
            $isExcluded = $true
            break
        }
    }

    if ($isExcluded) {
        Write-Verbose "Profil système ignoré : $UserName"
        continue
    }

    # On convertit la date WMI (format CIM_DATETIME) en objet DateTime PowerShell
    $LastUseTime = $Profile.ConvertToDateTime($Profile.LastUseTime)

    # --- Logique de suppression ---
    if ($LastUseTime -lt $limitDate) {
        Write-Host "Profil trouvé pour suppression : $UserName (Dernière utilisation: $LastUseTime)" -ForegroundColor Yellow
        
        if ($WhatIf) {
            Write-Warning "[SIMULATION] Le profil pour $UserName aurait été supprimé."
        } else {
            try {
                # C'est l'objet WMI lui-même qui a la méthode Delete()
                ($Profile).Delete()
                Write-Host "  -> Profil supprimé avec succès." -ForegroundColor Green
            } catch {
                Write-Warning "  -> Échec de la suppression du profil pour $UserName. Il est peut-être en cours d'utilisation."
            }
        }
    }
}

Write-Host "--- NETTOYAGE DES PROFILS TERMINÉ ---"
```

### Contextualisation

Ce script est un outil de **maintenance préventive**. Il est particulièrement utile dans des environnements où plusieurs personnes se connectent aux mêmes serveurs (serveurs de calcul, serveurs d'accès distant, etc.). Pour XANADU, il pourrait être utilisé sur les serveurs du laboratoire qui pourraient être partagés entre les chercheurs. Une exécution planifiée (par exemple, tous les trimestres) permet de garder les serveurs propres et d'éviter la saturation du disque système (C:).

### Bonnes Pratiques

-   **Sécurité intégrée (`-WhatIf`)** : L'ajout du commutateur `-WhatIf` est une bonne pratique essentielle pour les scripts destructifs. Il permet à l'administrateur de simuler l'opération et de voir ce qui *serait* supprimé avant de le faire réellement.
-   **Liste d'Exclusion Robuste** : Le script maintient une liste des comptes systèmes critiques à ne jamais supprimer pour éviter de rendre un serveur instable.
-   **Utilisation de WMI** : L'utilisation de `Win32_UserProfile` est la méthode standard et fiable pour interagir avec les profils utilisateurs, y compris sur des machines distantes.
-   **Conversion des Dates** : Le script gère correctement la conversion du format de date WMI, qui n'est pas directement utilisable en PowerShell.
