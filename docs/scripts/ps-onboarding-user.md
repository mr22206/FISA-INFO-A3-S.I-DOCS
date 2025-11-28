## 1. Onboarding d'un Nouvel Utilisateur (`New-XanaduUser.ps1`)

Ce script PowerShell automatise l'intégralité du processus d'accueil d'un nouvel employé dans Active Directory.

### Code Source Commenté

```powershell
<#
.SYNOPSIS
    Crée un nouvel utilisateur Active Directory, son dossier personnel,
    et configure les permissions de base pour XANADU.
.DESCRIPTION
    Ce script prend en charge l'onboarding d'un nouvel utilisateur.
    Il automatise les tâches suivantes :
    - Création du compte AD avec un mot de passe aléatoire et sécurisé.
    - Ajout de l'utilisateur aux groupes de sécurité par défaut et au groupe de son service.
    - Création de son dossier personnel sur le serveur de fichiers.
    - Attribution des permissions NTFS correctes sur ce dossier.
    - Déplacement de l'utilisateur dans l'OU de son service.
.PARAMETER Prenom
    Prénom de l'utilisateur.
.PARAMETER Nom
    Nom de l'utilisateur.
.PARAMETER Service
    Le service de l'utilisateur (ex: RH, Compta, BE). Doit correspondre à une OU existante.
.EXAMPLE
    .\New-XanaduUser.ps1 -Prenom "Jean" -Nom "Dupont" -Service "Compta"
#>
param (
    [Parameter(Mandatory=$true)]
    [string]$Prenom,

    [Parameter(Mandatory=$true)]
    [string]$Nom,

    [Parameter(Mandatory=$true)]
    [ValidateSet("Direction", "RH", "Compta", "Juridique", "BE", "Commercial", "Laboratoire")]
    [string]$Service
)

# --- DEBUT DU SCRIPT ---

# Importe le module Active Directory si ce n'est pas déjà fait
if (-not (Get-Module -ListAvailable -Name ActiveDirectory)) {
    Write-Warning "Le module Active Directory pour PowerShell n'est pas installé."
    return
}
Import-Module ActiveDirectory -ErrorAction Stop

# --- Variables de Configuration ---
$DomainName = "xanadu.local"
$DomainController = "SRV-DC-ATL-01.xanadu.local" # Cible le DC principal pour la création
$FileServerPath = "\\SRV-FICHIERS\Utilisateurs" # Chemin UNC du partage des dossiers personnels

# --- Construction des Attributs Utilisateur ---
$SamAccountName = "$($Prenom.Substring(0,1).ToLower()).$($Nom.ToLower())"
$UserPrincipalName = "$SamAccountName@$DomainName"
$DisplayName = "$Prenom $Nom"
$Description = "Compte utilisateur pour le service $Service"

# Détermine l'OU de destination en fonction du site et du service
# NOTE: Pour cet exemple, on suppose que tous les services sauf Labo sont à Atlantis.
$Site = if ($Service -eq "Laboratoire") { "SPRINGFIELD" } else { "ATLANTIS" }
$TargetPathOU = "OU=$Service,OU=UTILISATEURS_$($Site.Substring(0,2)),OU=XANADU_CORP,DC=xanadu,DC=local"

# --- Vérification d'Existence ---
Write-Host "Vérification de l'existence de l'utilisateur $SamAccountName..."
$userExists = Get-ADUser -Filter "SamAccountName -eq '$SamAccountName'" -Server $DomainController
if ($userExists) {
    Write-Error "L'utilisateur $SamAccountName existe déjà. Abandon de la création."
    return
}

# --- Création du Mot de Passe ---
$Password = ConvertTo-SecureString -String (Get-Random -MinimumLength 14 -SpecialChars 2 -Numbers 3) -AsPlainText -Force

# --- Création de l'Utilisateur ---
Write-Host "Création du compte pour $DisplayName..."
$NewUserParams = @{
    Name                      = $DisplayName
    SamAccountName            = $SamAccountName
    UserPrincipalName         = $UserPrincipalName
    GivenName                 = $Prenom
    Surname                   = $Nom
    DisplayName               = $DisplayName
    Description               = $Description
    Path                      = $TargetPathOU
    AccountPassword           = $Password
    ChangePasswordAtLogon     = $true
    Enabled                   = $true
    Server                    = $DomainController
}
$newUser = New-ADUser @NewUserParams

# --- Gestion des Groupes ---
Write-Host "Ajout de l'utilisateur aux groupes..."
$DefaultGroup = "GG_Utilisateurs_Domaine" # Un groupe par défaut pour tous
$ServiceGroup = "GG_$Service"
Add-ADGroupMember -Identity $DefaultGroup -Members $newUser -Server $DomainController
Add-ADGroupMember -Identity $ServiceGroup -Members $newUser -Server $DomainController

# --- Création du Dossier Personnel ---
Write-Host "Création du dossier personnel..."
$UserFolderPath = Join-Path -Path $FileServerPath -ChildPath $SamAccountName
if (-not (Test-Path -Path $UserFolderPath)) {
    New-Item -Path $UserFolderPath -ItemType Directory | Out-Null
}

# --- Attribution des Permissions NTFS ---
Write-Host "Configuration des permissions NTFS..."
$acl = Get-Acl $UserFolderPath
# Règle 1: Supprimer l'héritage pour un contrôle total
$acl.SetAccessRuleProtection($true, $false)
# Règle 2: Donner le contrôle total à l'utilisateur lui-même
$accessRuleUser = New-Object System.Security.AccessControl.FileSystemAccessRule($UserPrincipalName, "FullControl", "ContainerInherit, ObjectInherit", "None", "Allow")
$acl.AddAccessRule($accessRuleUser)
# Règle 3: Donner le contrôle total aux Admins du Domaine pour la maintenance
$accessRuleAdmins = New-Object System.Security.AccessControl.FileSystemAccessRule("BUILTIN\Administrators", "FullControl", "ContainerInherit, ObjectInherit", "None", "Allow")
$acl.AddAccessRule($accessRuleAdmins)
Set-Acl -Path $UserFolderPath -AclObject $acl

# --- Finalisation ---
Write-Host "--- ONBOARDING TERMINÉ ---" -ForegroundColor Green
Write-Host "Utilisateur : $SamAccountName"
Write-Host "Mot de passe temporaire (à communiquer de manière sécurisée) :"
Write-Host (ConvertTo-UnsecureString $Password)
Write-Host "Le mot de passe devra être changé à la première connexion."
```

### Contextualisation

Ce script répond directement à la problématique de **standardisation et de rapidité** pour l'intégration des nouveaux employés. Il évite les erreurs manuelles et garantit que chaque nouvel utilisateur est configuré de manière identique et sécurisée. Il sera utilisé par l'équipe IT ou par les **correspondants informatiques** (via une interface de délégation).

### Bonnes Pratiques

-   **Paramètres et Validation** : Le script utilise des paramètres obligatoires et un ensemble de validation (`ValidateSet`) pour garantir l'intégrité des données d'entrée.
-   **Sécurité du Mot de Passe** : Génération d'un mot de passe aléatoire et robuste, avec obligation de changement à la première connexion.
-   **Robustesse** : Le script vérifie l'existence de l'utilisateur avant de tenter de le créer pour éviter les erreurs.
-   **Permissions NTFS** : Application du principe du moindre privilège sur le dossier personnel.
-   **Lisibilité** : Code commenté et structuré pour une maintenance aisée.
