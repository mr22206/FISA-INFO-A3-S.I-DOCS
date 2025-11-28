# Garantie de la Sécurité du S.I.

L'architecture proposée pour XANADU a été conçue pour répondre aux quatre exigences fondamentales de la sécurité des systèmes d'information : la Confidentialité, l'Intégrité, la Disponibilité et la Traçabilité.

## 1. Confidentialité

*La confidentialité garantit que seules les personnes autorisées peuvent accéder aux informations.*

| Mesure Implémentée | Justification |
| :--- | :--- |
| **Modèle de Tiering (Tier 0, 1, 2)** | Isole les identités à privilèges. Un compte utilisateur compromis (Tier 2) ne peut pas être utilisé pour accéder aux serveurs (Tier 1) ou aux contrôleurs de domaine (Tier 0). |
| **Permissions NTFS via AGDLP** | Le modèle `Compte -> Groupe Global -> Groupe Local -> Permission` assure un contrôle granulaire. Les droits sont basés sur le rôle métier, pas sur l'individu, empêchant les accès illégitimes. |
| **GPO de chiffrement BitLocker** | La GPO `SEC-Baseline-Workstation-T2` force le chiffrement des disques durs des ordinateurs portables. En cas de vol, les données restent inaccessibles. |
| **Accès VPN pour les nomades** | Les connexions à distance sont sécurisées via un tunnel VPN MPLS, garantissant que le trafic entre les sites et avec les utilisateurs distants est chiffré. |

## 2. Intégrité

*L'intégrité assure que les données sont exactes et n'ont pas été modifiées de manière non autorisée.*

| Mesure Implémentée | Justification |
| :--- | :--- |
| **Principe du moindre privilège** | Les utilisateurs et les administrateurs délégués n'ont que les droits strictement nécessaires à leurs missions. Par exemple, un correspondant informatique RH ne peut pas modifier les GPO. |
| **GPO de restriction (AppLocker)** | La GPO `SEC-AppLocker-Execution` empêche l'exécution de logiciels non approuvés, réduisant le risque d'altération du système par des malwares. |
| **Journalisation des accès aux fichiers** | La GPO `SEC-Baseline-Server-T1` active l'audit sur les serveurs de fichiers. Toute tentative de modification, de suppression ou d'accès non autorisé à un fichier sensible est enregistrée. |
| **Hachage des mots de passe** | Active Directory stocke les mots de passe sous forme de hachages sécurisés, les protégeant contre le vol direct même en cas de compromission d'un contrôleur de domaine. |

## 3. Disponibilité

*La disponibilité garantit que les utilisateurs peuvent accéder aux services et aux données lorsque c'est nécessaire.*

| Mesure Implémentée | Justification |
| :--- | :--- |
| **Redondance des Contrôleurs de Domaine** | Le site d'Atlantis dispose de deux contrôleurs de domaine (`SRV-DC-ATL-01` et `SRV-DC-ATL-02`). En cas de défaillance du premier, le second prend le relais pour l'authentification et les services AD. |
| **Plan de Sauvegarde 3-2-1** | La politique de sauvegarde (à détailler dans le document dédié) assure qu'il existe plusieurs copies des données sur différents supports, dont une hors site, permettant une restauration rapide en cas d'incident (panne, rançongiciel). |
| **RTO et RPO définis** | Le cahier des charges impose un RTO de 4h pour les services critiques. L'architecture est conçue pour permettre une restauration dans ces délais. |
| **Serveur WSUS centralisé** | La GPO `ADM-WSUS-Configuration` permet de maîtriser le déploiement des mises à jour, évitant les redémarrages intempestifs en pleine journée de travail qui pourraient nuire à la productivité. |

## 4. Traçabilité

*La traçabilité (ou auditabilité) garantit que chaque action effectuée sur le système peut être attribuée à une personne ou à un processus.*

| Mesure Implémentée | Justification |
| :--- | :--- |
| **Politique d'audit avancée** | Les GPO de sécurité activent des journaux d'événements détaillés sur les serveurs et les postes : qui s'est connecté, à quelle heure, quel fichier a été accédé, quelle GPO a été modifiée, etc. |
| **Centralisation des logs (à venir)** | Dans le cadre de la supervision, il est prévu de centraliser les journaux d'événements (via un collecteur d'événements Windows ou un SIEM) pour permettre des analyses de corrélation et des enquêtes post-incident. |
| **Types de comptes nominatifs** | L'abandon des comptes génériques (ex: `RH:RH` sur l'ERP) au profit de comptes individuels est une exigence. Chaque action est ainsi liée à une personne unique. |
| **Délégation via groupes dédiés** | Les actions des correspondants informatiques sont tracées via leurs comptes `adm_p.nom`, ce qui permet de savoir exactement qui a réinitialisé un mot de passe ou créé un utilisateur. |
