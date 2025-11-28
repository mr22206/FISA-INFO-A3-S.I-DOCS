# Stratégies de Groupe (GPO)

Les GPO sont le pilier de la sécurisation et de la standardisation du parc informatique. Elles sont conçues pour être granulaires et appliquées au plus près des objets qu'elles ciblent (serveurs, postes, utilisateurs) en respectant l'héritage.

## 1. GPO de Sécurité (5 exemples)

Ces stratégies visent à durcir le système d'information contre les menaces internes et externes.

| Nom de la GPO | Contenu Principal | Liaison (OU) | Justification |
| :--- | :--- | :--- | :--- |
| **SEC-DefaultDomainPolicy** | **Politique de mot de passe renforcée** : 12 caractères min, complexité activée, historique de 24 mots de passe. **Politique de verrouillage** : 5 tentatives échouées avant verrouillage de 30 minutes. | Racine du domaine (`xanadu.local`) | Applique une politique de mot de passe robuste à tous les comptes du domaine, conformément aux recommandations de l'ANSSI. |
| **SEC-Baseline-Workstation-T2** | **Durcissement des postes de travail** : Désactivation des protocoles obsolètes (SMBv1), activation du pare-feu Windows, restriction de l'exécution de scripts PowerShell, interdiction de stocker les hashs LM. | `ORDINATEURS_AT`, `ORDINATEURS_SP` | Réduit la surface d'attaque sur les postes utilisateurs, qui sont le maillon faible de la sécurité. |
| **SEC-Baseline-Server-T1** | **Durcissement des serveurs** : Configuration d'une politique d'audit avancée (connexions, accès aux objets), restriction des droits d'ouverture de session (uniquement administrateurs et services), configuration de WinRM sur HTTPS. | `SERVEURS_AT`, `SERVEURS_SP` | Sécurise les serveurs hébergeant les données critiques en limitant les accès et en assurant une traçabilité forte. |
| **SEC-Restrict-Admin-Rights** | **Restriction des administrateurs locaux** : Le groupe "Administrateurs" local est vidé de tous les utilisateurs par défaut. Seul un groupe `DL_Local_Admin_POSTE_DEFAUT` (contrôlé par l'IT) y est ajouté. | `ORDINATEURS_AT`, `ORDINATEURS_SP` | Empêche les utilisateurs d'être administrateurs de leur poste, une vulnérabilité majeure exploitée par les rançongiciels. |
| **SEC-AppLocker-Execution** | **Contrôle d'exécution des applications** : Définit des règles AppLocker pour n'autoriser que les exécutables signés et provenant de répertoires sécurisés (Program Files, Windows). Bloque l'exécution depuis le profil utilisateur (`AppData`). | `XANADU_CORP` (filtrée sur les postes) | Empêche l'exécution de logiciels malveillants ou non autorisés téléchargés par les utilisateurs. |

## 2. GPO d'Administration (5 exemples)

Ces stratégies facilitent la gestion du parc, déploient des configurations standard et améliorent l'expérience utilisateur.

| Nom de la GPO | Contenu Principal | Liaison (OU) | Justification |
| :--- | :--- | :--- | :--- |
| **ADM-Redirect-Known-Folders** | **Redirection des dossiers connus** : Redirige les dossiers "Documents", "Bureau" et "Téléchargements" vers le partage personnel de l'utilisateur sur le serveur de fichiers (`\\SRV-FICHIERS\%username%`). | `UTILISATEURS_AT`, `UTILISATEURS_SP` | Centralise les données utilisateurs, facilite la sauvegarde et permet à l'utilisateur de retrouver son environnement sur n'importe quel poste. |
| **ADM-Deploy-Printers-Atlantis** | **Déploiement des imprimantes** : Déploie automatiquement le copieur multifonction et l'imprimante couleur pour les utilisateurs basés sur le site d'Atlantis. | `ATLANTIS` | Simplifie l'ajout d'imprimantes pour les utilisateurs et garantit qu'ils disposent des bons pilotes. |
| **ADM-WSUS-Configuration** | **Configuration de Windows Update** : Force les clients et serveurs à contacter le serveur WSUS interne pour les mises à jour et définit une politique d'installation (automatique la nuit pour les serveurs, planifiée pour les postes). | `SERVEURS_AT`, `SERVEURS_SP`, `ORDINATEURS_AT`, `ORDINATEURS_SP` | Assure un contrôle centralisé des mises à jour de sécurité, essentiel pour la protection contre les vulnérabilités. |
| **ADM-Drive-Mappings** | **Mappage des lecteurs réseaux** : Mappe le lecteur `P:` vers le dossier personnel de l'utilisateur et le lecteur `S:` vers le dossier partagé de son service (utilise le ciblage par groupe de sécurité). | `UTILISATEURS_AT`, `UTILISATEURS_SP` | Fournit un accès simple et standardisé aux partages de fichiers pour tous les employés. |
| **ADM-Power-Settings** | **Configuration de l'alimentation** : Définit un plan d'alimentation optimisé pour les postes de travail (mise en veille après 30 minutes, veille prolongée après 2 heures) pour réduire la consommation énergétique. | `ORDINATEURS_AT`, `ORDINATEURS_SP` | Standardise la gestion de l'énergie et participe à la politique RSE de l'entreprise. |
