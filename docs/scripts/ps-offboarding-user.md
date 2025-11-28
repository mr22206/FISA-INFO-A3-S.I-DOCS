## 2. Offboarding d'un Utilisateur (`Disable-XanaduUser.ps1`)

Ce script sécurise et automatise le processus de départ d'un collaborateur. Une révocation rapide et complète des accès est une étape critique pour la sécurité du SI.

### Code Source Commenté

```powershell
<#
.SYNOPSIS
    Désactive un compte utilisateur Active Directory et archive ses données.
.DESCRIPTION
    Ce script gère le processus d'offboarding :
    - Vérifie que le compte utilisateur existe et est activé.
    - Réinitialise le mot de passe avec une valeur aléatoire complexe.
    - Retire l'utilisateur de TOUS les groupes de sécurité (sauf "Domain Users").
    - Désactive le compte.
    - Déplace le compte dans une OU "Comptes Désactivés" pour archivage.
    - Cache le compte de la liste d'adresses Exchange/M365.
    - Renomme et déplace son dossier personnel dans une zone d'archive.
.PARAMETER SamAccountName
    Le login (SamAccountName) de l'utilisateur à désactiver.
.EXAMPLE
    .\Disable-XanaduUser.ps1 -SamAccountName "j.dupont"
#>
param (
    [Parameter(Mandatory=$true)]
    [string]$SamAccountName
)

# --- DEBUT DU SCRIPT ---

Import-Module ActiveDirectory -ErrorAction Stop

# --- Variables de Configuration ---
$DomainController = "SRV-DC-ATL-01.xanadu.local"
$ArchiveOU = "OU=Comptes Desactives,DC=xanadu,DC=local" # OU de destination pour les comptes désactivés
$UserFolderBasePath = "\\SRV-FICHIERS\Utilisateurs"
$ArchiveFolderBasePath = "\\SRV-FICHIERS\Archives" # Partage où les dossiers sont archivés

# --- Vérification de l'Utilisateur ---
Write-Host "Recherche de l'utilisateur $SamAccountName..."
$user = Get-ADUser -Identity $SamAccountName -Properties MemberOf -Server $DomainController -ErrorAction SilentlyContinue
if (-not $user) {
    Write-Error "L'utilisateur $SamAccountName est introuvable."
    return
}
if (-not $user.Enabled) {
    Write-Warning "Le compte $SamAccountName est déjà désactivé."
    # On peut choisir de continuer pour archiver les données si ce n'est pas déjà fait
}

Write-Host "Début du processus d'offboarding pour $($user.Name)..."

# --- 1. Réinitialiser le mot de passe ---
Write-Host "Réinitialisation du mot de passe..."
$newPassword = ConvertTo-SecureString -String (Get-Random -MinimumLength 32 -SpecialChars 5 -Numbers 10) -AsPlainText -Force
Set-ADAccountPassword -Identity $user -NewPassword $newPassword -Reset -Server $DomainController

# --- 2. Retirer des Groupes ---
Write-Host "Retrait des groupes de sécurité..."
$groups = $user.MemberOf | ForEach-Object { (Get-ADGroup $_).Name }
foreach ($group in $groups) {
    # On ne retire pas du groupe principal par défaut
    if ($group -ne "Domain Users") {
        Remove-ADGroupMember -Identity $group -Members $user -Confirm:$false -Server $DomainController
        Write-Host "  - Retiré du groupe '$group'"
    }
}

# --- 3. Désactiver le Compte ---
Write-Host "Désactivation du compte..."
Disable-ADAccount -Identity $user -Server $DomainController

# --- 4. Cacher de la Liste d'Adresses ---
Write-Host "Masquage de la boîte aux lettres..."
Set-ADUser -Identity $user -Add @{msExchHideFromAddressLists=$true} -Server $DomainController

# --- 5. Archiver le Dossier Personnel ---
$UserFolderPath = Join-Path -Path $UserFolderBasePath -ChildPath $SamAccountName
$ArchiveFolderPath = Join-Path -Path $ArchiveFolderBasePath -ChildPath "$($SamAccountName)_$(Get-Date -Format 'yyyy-MM-dd')"
if (Test-Path $UserFolderPath) {
    Write-Host "Archivage du dossier personnel vers $ArchiveFolderPath..."
    Move-Item -Path $UserFolderPath -Destination $ArchiveFolderPath
    
    # Sécuriser l'archive : retirer tous les droits sauf pour les admins
    $acl = Get-Acl $ArchiveFolderPath
    $acl.SetAccessRuleProtection($true, $false) # Supprime héritage
    # Vider les règles existantes
    $acl.Access | ForEach-Object { $acl.RemoveAccessRule($_) } | Out-Null
    # Ajouter uniquement les admins
    $adminRule = New-Object System.Security.AccessControl.FileSystemAccessRule("BUILTIN\Administrators", "FullControl", "Allow")
    $acl.SetAccessRule($adminRule)
    Set-Acl -Path $ArchiveFolderPath -AclObject $acl
}

# --- 6. Déplacer l'OU ---
Write-Host "Déplacement du compte vers l'OU d'archivage..."
Move-ADObject -Identity $user -TargetPath $ArchiveOU -Server $DomainController

# --- Finalisation ---
Set-ADUser -Identity $user -Description "Compte désactivé le $(Get-Date)" -Server $DomainController
Write-Host "--- OFFBOARDING TERMINÉ ---" -ForegroundColor Green
Write-Host "Le compte $($user.Name) a été entièrement désactivé et ses données archivées."
```

### Contextualisation

Lorsqu'un employé quitte l'entreprise, il est impératif de révoquer ses accès immédiatement pour éviter toute fuite de données ou action malveillante. Ce script garantit que toutes les étapes critiques sont exécutées de manière systématique et traçable.

### Bonnes Pratiques

-   **Sécurité par défaut** : Le script ne se contente pas de désactiver le compte. Il change le mot de passe, retire les droits, et cache le compte, ce qui constitue une défense en profondeur.
-   **Traçabilité** : La description du compte est mise à jour avec la date de désactivation, laissant une trace claire dans l'AD.
-   **Archivage des données** : Le script ne supprime pas les données de l'utilisateur mais les déplace dans une zone d'archive sécurisée, accessible uniquement aux administrateurs, pour des besoins légaux ou de passation.
-   **Idempotence** : Le script vérifie si le compte est déjà désactivé pour éviter les erreurs.
-   **Gestion des erreurs** : L'utilisation de `SilentlyContinue` avec une vérification manuelle permet de gérer proprement le cas où l'utilisateur n'existe pas.
