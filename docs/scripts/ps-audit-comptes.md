## 3. Audit des Comptes Inactifs (`Get-StaleADAccounts.ps1`)

Les comptes "morts" ou inactifs sont un risque de sécurité. Ils peuvent être oubliés et potentiellement utilisés par un attaquant. Ce script génère un rapport pour identifier ces comptes.

### Code Source Commenté

```powershell
<#
.SYNOPSIS
    Génère un rapport des comptes d'utilisateurs et d'ordinateurs inactifs dans Active Directory.
.DESCRIPTION
    Ce script recherche dans l'AD les comptes qui ne se sont pas connectés depuis un
    nombre de jours défini. Il exporte les résultats dans un fichier CSV pour analyse.
    Il peut chercher les comptes utilisateurs, les comptes ordinateurs, ou les deux.
.PARAMETER InactiveDays
    Le nombre de jours d'inactivité pour qu'un compte soit considéré comme "périmé".
    La valeur par défaut est 90 jours.
.PARAMETER Type
    Le type de compte à rechercher ('User', 'Computer', ou 'All'). La valeur par défaut est 'All'.
.PARAMETER ReportPath
    Le chemin où le rapport CSV sera sauvegardé.
.EXAMPLE
    .\Get-StaleADAccounts.ps1 -InactiveDays 60 -Type User -ReportPath "C:\Temp\Comptes_Inactifs.csv"
#>
param (
    [Parameter(Mandatory=$false)]
    [int]$InactiveDays = 90,

    [Parameter(Mandatory=$false)]
    [ValidateSet("User", "Computer", "All")]
    [string]$Type = "All",

    [Parameter(Mandatory=$true)]
    [string]$ReportPath
)

# --- DEBUT DU SCRIPT ---
Import-Module ActiveDirectory -ErrorAction Stop

# --- Calcul de la Date Limite ---
$limitDate = (Get-Date).AddDays(-$InactiveDays)

# --- Préparation du Filtre et des Propriétés ---
$searchBase = "OU=XANADU_CORP,DC=xanadu,DC=local" # On exclut les OU admin et les comptes désactivés
$propertiesToLoad = @("Name", "SamAccountName", "LastLogonDate", "DistinguishedName", "Enabled")
$finalResults = @()

# --- Recherche des Utilisateurs ---
if ($Type -in @("User", "All")) {
    Write-Host "Recherche des utilisateurs inactifs depuis $InactiveDays jours..."
    $userFilter = "LastLogonDate -lt '$limitDate' -or LastLogonDate -notlike '*'"
    $inactiveUsers = Get-ADUser -Filter $userFilter -SearchBase $searchBase -Properties $propertiesToLoad -ResultSetSize $null

    foreach ($user in $inactiveUsers) {
        $finalResults += [PSCustomObject]@{
            Type              = "User"
            Name              = $user.Name
            SamAccountName    = $user.SamAccountName
            LastLogonDate     = if ($user.LastLogonDate) { $user.LastLogonDate } else { "Jamais" }
            DistinguishedName = $user.DistinguishedName
            IsEnabled         = $user.Enabled
        }
    }
}

# --- Recherche des Ordinateurs ---
if ($Type -in @("Computer", "All")) {
    Write-Host "Recherche des ordinateurs inactifs depuis $InactiveDays jours..."
    $computerFilter = "LastLogonDate -lt '$limitDate' -or LastLogonDate -notlike '*'"
    $inactiveComputers = Get-ADComputer -Filter $computerFilter -SearchBase $searchBase -Properties $propertiesToLoad -ResultSetSize $null

    foreach ($computer in $inactiveComputers) {
        $finalResults += [PSCustomObject]@{
            Type              = "Computer"
            Name              = $computer.Name
            SamAccountName    = $computer.SamAccountName
            LastLogonDate     = if ($computer.LastLogonDate) { $computer.LastLogonDate } else { "Jamais" }
            DistinguishedName = $computer.DistinguishedName
            IsEnabled         = $computer.Enabled
        }
    }
}

# --- Export du Rapport ---
if ($finalResults.Count -gt 0) {
    Write-Host "Export de $($finalResults.Count) comptes inactifs vers $ReportPath..." -ForegroundColor Green
    $finalResults | Export-Csv -Path $ReportPath -NoTypeInformation -Encoding UTF8
} else {
    Write-Host "Aucun compte inactif trouvé avec les critères spécifiés." -ForegroundColor Yellow
}

Write-Host "--- AUDIT TERMINÉ ---"
```

### Contextualisation

Ce script est un outil essentiel pour l'**hygiène de la sécurité** de l'annuaire Active Directory. Il doit être planifié pour s'exécuter automatiquement (par exemple, une fois par mois) via une tâche planifiée. Le rapport CSV généré est ensuite envoyé à l'équipe IT pour analyse et action (contacter les managers, désactiver les comptes, etc.).

### Bonnes Pratiques

-   **Flexibilité** : Le script permet de choisir le nombre de jours d'inactivité et le type de compte à auditer (utilisateurs, ordinateurs ou les deux).
-   **Performance** : La recherche est ciblée sur l'OU de production (`XANADU_CORP`) pour éviter de scanner inutilement les OU systèmes. L'attribut `LastLogonDate` est utilisé car il est répliqué entre les contrôleurs de domaine, ce qui donne une vision plus précise que `LastLogon`.
-   **Rapport Clair** : Le script génère un fichier CSV, un format universel facile à ouvrir avec Excel ou à importer dans d'autres outils pour le traitement.
-   **Gestion du "Jamais Connecté"** : Le filtre `LastLogonDate -notlike '*'` inclut les comptes qui n'ont jamais été utilisés, ce qui est important pour détecter les comptes créés par erreur.
-   **Feedback Utilisateur** : Le script informe l'utilisateur de ce qu'il fait et du nombre de résultats trouvés, ce qui est utile en mode interactif.
