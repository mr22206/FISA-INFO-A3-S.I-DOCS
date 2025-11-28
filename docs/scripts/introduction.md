# Scripts d'Administration

Cette section présente les 10 scripts d'administration développés pour faciliter l'exploitation, la sécurisation et la maintenance quotidienne du système d'information de XANADU.

Chaque script est détaillé dans sa propre page, accessible via les liens ci-dessous.

## PowerShell (Windows Server & Active Directory)

1.  **[Onboarding d'un nouvel utilisateur](./ps-onboarding-user.md)** : Automatise l'arrivée d'un collaborateur.
2.  **[Offboarding d'un utilisateur](./ps-offboarding-user.md)** : Sécurise le départ d'un collaborateur.
3.  **[Audit des comptes inactifs](./ps-audit-comptes.md)** : Génère un rapport sur les comptes "fantômes".
4.  **[Sauvegarde des GPO](./ps-backup-gpo.md)** : Sauvegarde toutes les stratégies de groupe pour le PRA.
5.  **[Rapport de permissions NTFS](./ps-rapport-ntfs.md)** : Audite les droits d'accès sur un partage de fichiers.
6.  **[Déploiement de logiciel à distance](./ps-deploy-software.md)** : Installe une application MSI sur des postes distants.
7.  **[Nettoyage des profils utilisateurs](./ps-clean-profiles.md)** : Libère de l'espace disque sur les serveurs partagés.

## Bash (Serveurs Linux)

8.  **[Sauvegarde des données du laboratoire](./bash-backup-lab.md)** : Archive les données de recherche vers le NAS.
9.  **[Surveillance de l'état système](./bash-check-health.md)** : Alerte en cas de surutilisation des ressources.
10. **[Rotation des journaux](./bash-rotate-logs.md)** : Gère l'archivage et la compression des fichiers de log.
