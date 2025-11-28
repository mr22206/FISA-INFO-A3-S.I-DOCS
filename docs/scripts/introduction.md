# Scripts d'Administration

Cette section présente les 10 scripts d'administration développés pour faciliter l'exploitation, la sécurisation et la maintenance quotidienne du système d'information de XANADU.

Chaque script est conçu pour être **fonctionnel**, **robuste**, **commenté** et **contextualisé** par rapport aux besoins spécifiques de l'entreprise. Ils respectent les bonnes pratiques de codage pour PowerShell et Bash.

## 1. Scripts PowerShell (Active Directory & Windows Server)

Ces scripts ciblent l'environnement Microsoft qui constitue le cœur du SI de XANADU.

1.  **[Onboarding d'un nouvel utilisateur (`New-XanaduUser.ps1`)](./ps-onboarding-user.md)**
    *   **Contexte** : Automatise l'arrivée d'un collaborateur. Crée le compte AD, le place dans la bonne OU, l'ajoute aux bons groupes, crée son dossier personnel et lui assigne les permissions.

2.  **[Offboarding d'un utilisateur (`Disable-XanaduUser.ps1`)](./ps-offboarding-user.md)**
    *   **Contexte** : Sécurise le départ d'un collaborateur. Désactive le compte, le déplace, retire les groupes, archive les données et cache le compte de la liste d'adresses.

3.  **[Audit des comptes inactifs (`Get-StaleADAccounts.ps1`)](./ps-audit-comptes.md)**
    *   **Contexte** : Génère un rapport CSV des comptes qui ne se sont pas connectés depuis plus de 90 jours pour identifier les comptes "fantômes", un risque de sécurité.

4.  **[Sauvegarde des GPO (`Backup-AllGPOs.ps1`)](./ps-backup-gpo.md)**
    *   **Contexte** : Sauvegarde toutes les stratégies de groupe dans un dossier daté. Essentiel pour le plan de reprise d'activité Active Directory.

5.  **[Rapport de permissions NTFS (`Get-NTFSPermissionReport.ps1`)](./ps-rapport-ntfs.md)**
    *   **Contexte** : Génère un rapport de permissions sur un dossier partagé pour vérifier rapidement qui a accès à quoi, crucial pour les audits de sécurité.

6.  **[Déploiement de logiciel à distance (`Invoke-RemoteInstall.ps1`)](./ps-deploy-software.md)**
    *   **Contexte** : Permet d'installer silencieusement une application (MSI) sur un ou plusieurs postes du réseau pour standardiser le parc applicatif.

7.  **[Nettoyage des profils utilisateurs (`Clean-UserProfiles.ps1`)](./ps-clean-profiles.md)**
    *   **Contexte** : Sur les serveurs partagés (futurs RDS par exemple), ce script permet de supprimer les profils utilisateurs locaux qui n'ont pas été utilisés depuis un certain temps pour libérer de l'espace disque.

## 2. Scripts Bash (Serveurs Linux)

Ces scripts sont destinés à l'administration des deux serveurs Linux du laboratoire à Springfield.

8.  **[Sauvegarde des données du laboratoire (`backup_lab_data.sh`)](./bash-backup-lab.md)**
    *   **Contexte** : Utilise `rsync` pour archiver de manière incrémentale les données de production des serveurs Linux vers le NAS central d'Atlantis.

9.  **[Surveillance de l'état système (`check_health.sh`)](./bash-check-health.md)**
    *   **Contexte** : Script simple qui vérifie l'utilisation du CPU, de la RAM et du disque. Envoie une alerte par e-mail si un seuil est dépassé, pour une supervision proactive.

10. **[Rotation des journaux (`rotate_logs.sh`)](./bash-rotate-logs.md)**
    *   **Contexte** : Gère la rotation et la compression des fichiers de log applicatifs pour éviter la saturation de l'espace disque sur les serveurs du laboratoire.
