## 4. Sauvegarde des Stratégies de Groupe (GPO) (`Backup-AllGPOs.ps1`)

Les GPO sont une partie critique de la configuration du domaine. Leur perte accidentelle peut avoir des conséquences désastreuses sur la sécurité et la configuration du parc. Ce script automatise leur sauvegarde.

### Code Source Commenté

```powershell
<#
.SYNOPSIS
    Sauvegarde toutes les GPO d'un domaine Active Directory dans un dossier spécifié.
.DESCRIPTION
    Ce script utilise la cmdlet `Backup-Gpo` pour exporter toutes les stratégies de groupe.
    Il crée un sous-dossier avec la date du jour pour historiser les sauvegardes.
    Cette opération est indispensable dans le cadre d'un Plan de Reprise d'Activité (PRA) pour Active Directory.
.PARAMETER BackupPath
    Le chemin UNC ou local du dossier racine où les sauvegardes seront stockées.
.PARAMETER DomainName
    Le nom FQDN du domaine (ex: xanadu.local).
.EXAMPLE
    .\Backup-AllGPOs.ps1 -BackupPath "\\SRV-FICHIERS\Backups\GPO" -DomainName "xanadu.local"
#>
param (
    [Parameter(Mandatory=$true)]
    [string]$BackupPath,

    [Parameter(Mandatory=$true)]
    [string]$DomainName
)

# --- DEBUT DU SCRIPT ---

# --- Prérequis ---
# Le module GroupPolicy doit être disponible. Il est inclus avec les outils RSAT.
if (-not (Get-Module -ListAvailable -Name GroupPolicy)) {
    Write-Warning "Le module GroupPolicy pour PowerShell n'est pas installé."
    return
}
Import-Module GroupPolicy -ErrorAction Stop

# --- Préparation du Dossier de Destination ---
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$destinationPath = Join-Path -Path $BackupPath -ChildPath $timestamp

# Vérifie si le dossier racine existe. Tente de le créer sinon.
if (-not (Test-Path -Path $BackupPath -PathType Container)) {
    Write-Host "Le dossier de sauvegarde $BackupPath n'existe pas. Tentative de création..."
    try {
        New-Item -Path $BackupPath -ItemType Directory -Force | Out-Null
    } catch {
        Write-Error "Impossible de créer le dossier de sauvegarde. Vérifiez les permissions."
        return
    }
}

# --- Exécution de la Sauvegarde ---
Write-Host "Lancement de la sauvegarde de toutes les GPO du domaine $DomainName..."
try {
    # La cmdlet Backup-Gpo -All fait tout le travail.
    $backupResult = Backup-Gpo -All -Path $destinationPath -Domain $DomainName -Server "SRV-DC-ATL-01.$DomainName" -ErrorAction Stop
    
    Write-Host "Sauvegarde terminée avec succès." -ForegroundColor Green
    Write-Host "Nombre de GPO sauvegardées : $($backupResult.Count)"
    Write-Host "Emplacement : $destinationPath"

} catch {
    Write-Error "Une erreur est survenue lors de la sauvegarde des GPO."
    Write-Error $_.Exception.Message
}

# --- (Optionnel) Nettoyage des vieilles sauvegardes ---
$retentionDays = 30
Write-Host "Nettoyage des sauvegardes de plus de $retentionDays jours..."
Get-ChildItem -Path $BackupPath -Directory | Where-Object { $_.CreationTime -lt (Get-Date).AddDays(-$retentionDays) } | ForEach-Object {
    Write-Host "Suppression de l'ancienne sauvegarde : $($_.FullName)"
    Remove-Item -Recurse -Force -Path $_.FullName
}

Write-Host "--- SAUVEGARDE GPO TERMINÉE ---"

```

### Contextualisation

Ce script doit être exécuté via une **tâche planifiée** sur un serveur d'administration, idéalement toutes les nuits. Il fait partie intégrante de la **politique de sauvegarde** de XANADU. En cas de suppression ou de corruption d'une GPO, ce backup permet une restauration rapide et fiable via la console "Group Policy Management".

### Bonnes Pratiques

-   **Historisation** : Chaque sauvegarde est placée dans un dossier horodaté, ce qui permet de conserver un historique et de revenir à une version antérieure si nécessaire.
-   **Robustesse** : Le script vérifie l'existence du dossier de destination et tente de le créer. Il utilise un bloc `try/catch` pour intercepter proprement les erreurs lors de la sauvegarde.
-   **Gestion de la Rétention** : Le script inclut une section optionnelle pour nettoyer automatiquement les sauvegardes de plus de 30 jours, évitant ainsi de saturer l'espace de stockage.
-   **Simplicité** : Le script tire parti de la cmdlet native `Backup-Gpo -All`, qui est la méthode recommandée par Microsoft pour cette tâche.

