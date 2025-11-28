## 5. Rapport de Permissions NTFS (`Get-NTFSPermissionReport.ps1`)

Savoir "qui a accès à quoi" est une question fondamentale en sécurité. Ce script permet d'auditer les permissions (ACLs) d'un dossier partagé et de ses sous-dossiers pour produire un rapport clair.

### Code Source Commenté

```powershell
<#
.SYNOPSIS
    Génère un rapport CSV des permissions NTFS pour un dossier spécifié.
.DESCRIPTION
    Ce script parcourt un dossier et ses sous-dossiers pour extraire les listes de contrôle d'accès (ACL).
    Il exporte les résultats dans un fichier CSV facile à filtrer, montrant quel utilisateur ou groupe
    a quel type de droit sur chaque dossier.
.PARAMETER FolderPath
    Le chemin du dossier à auditer (ex: "\\SRV-FICHIERS\Partages\Compta").
.PARAMETER ReportPath
    Le chemin où sauvegarder le rapport CSV.
.EXAMPLE
    .\Get-NTFSPermissionReport.ps1 -FolderPath "\\SRV-FICHIERS\Partages\Direction" -ReportPath "C:\Temp\Rapport_Permissions_Direction.csv"
#>
param (
    [Parameter(Mandatory=$true)]
    [string]$FolderPath,

    [Parameter(Mandatory=$true)]
    [string]$ReportPath
)

# --- DEBUT DU SCRIPT ---

# --- Vérification des Prérequis ---
if (-not (Test-Path -Path $FolderPath -PathType Container)) {
    Write-Error "Le dossier '$FolderPath' est introuvable."
    return
}

Write-Host "Début de l'audit des permissions pour le dossier : $FolderPath"

# --- Collecte des ACL ---
try {
    # On récupère tous les dossiers, y compris le dossier racine lui-même
    $allFolders = Get-ChildItem -Path $FolderPath -Recurse -Directory -Force -ErrorAction Stop
    $foldersToProcess = @($FolderPath) + $allFolders.FullName

    $permissionReport = foreach ($folder in $foldersToProcess) {
        Write-Verbose "Analyse de : $folder"
        
        # Get-Acl est la cmdlet clé pour lire les permissions
        $acl = Get-Acl -Path $folder
        
        foreach ($access in $acl.Access) {
            # On crée un objet personnalisé pour chaque entrée de permission
            [PSCustomObject]@{
                Folder            = $folder
                IdentityReference = $access.IdentityReference
                FileSystemRights  = $access.FileSystemRights
                AccessControlType = $access.AccessControlType # Allow or Deny
                IsInherited       = $access.IsInherited
            }
        }
    }

    # --- Export du Rapport ---
    if ($permissionReport) {
        Write-Host "Export du rapport de permissions vers $ReportPath..." -ForegroundColor Green
        $permissionReport | Export-Csv -Path $ReportPath -NoTypeInformation -Encoding UTF8
        Write-Host "Audit terminé avec succès."
    } else {
        Write-Warning "Aucune permission à rapporter pour le dossier spécifié."
    }

} catch {
    Write-Error "Une erreur est survenue lors de la collecte des ACL."
    Write-Error $_.Exception.Message
}
```

### Contextualisation

Ce script est un outil d'**audit** essentiel pour le RSSI (Responsable de la Sécurité des Systèmes d'Information) et les administrateurs. Il permet de répondre rapidement aux demandes de la direction ou des auditeurs sur les droits d'accès à un dossier sensible (ex: `\\SRV-FICHIERS\Partages\RH`). Il peut être utilisé ponctuellement ou de manière planifiée pour détecter des changements de permissions anormaux.

### Bonnes Pratiques

-   **Rapport Détaillé** : Le rapport CSV inclut non seulement l'utilisateur/groupe et ses droits, mais aussi si le droit est hérité ou explicite, et s'il s'agit d'une autorisation (`Allow`) ou d'un refus (`Deny`).
-   **Gestion des Erreurs** : Le script vérifie d'abord que le dossier cible existe. Un bloc `try/catch` est utilisé pour gérer les erreurs potentielles, par exemple un "Accès refusé" si le script est lancé par un utilisateur sans les droits suffisants pour lire les permissions.
-   **Performance sur de grands volumes** : Pour des partages avec des centaines de milliers de dossiers, cette approche peut être lente. Des modules spécialisés comme `NTFSSecurity` pourraient être une optimisation, mais pour la taille de XANADU, ce script est parfaitement adapté et n'a pas de dépendance externe.
-   **Lisibilité de la sortie** : Le format CSV est idéal pour être exploité dans Excel, permettant des tris et des filtres (par exemple, filtrer sur les permissions non héritées pour voir les exceptions).
