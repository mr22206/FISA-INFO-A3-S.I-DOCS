# Gestion des Identités et Accès (IAM)

La stratégie de gestion des droits de XANADU repose sur le modèle **AGDLP**, garantissant une traçabilité parfaite et une maintenance simplifiée.

-   **A**ccount (Compte Utilisateur) -> est membre de ->
-   **G**lobal Group (Groupe Métier) -> est membre de ->
-   **D**omain **L**ocal Group (Groupe de Permission) -> possède les droits ->
-   **P**ermission (ACL sur Dossier / Imprimante)

## 1. Typologie des Groupes

### A. Groupes Globaux (`GG_...`) — Rôle Métier

Ils regroupent les utilisateurs par service pour refléter l'organisation de l'entreprise.

-   **Exemples** : `GG_Direction`, `GG_RH`, `GG_Compta`, `GG_Labo`
-   **Justification** : Servent d’identités logiques pour l’attribution de permissions, facilitent l'intégration d'un nouvel employé et évitent la gestion des droits au cas par cas.

### B. Groupes d'Administration Déléguée (`GG_Admin_...`)

Ces groupes contiennent les comptes d'administration T2 des **Correspondants Informatiques**.

-   **Exemples** : `GG_Admin_RH`, `GG_Admin_Compta`, `GG_Admin_Labo`
-   **Rôle** : Reçoivent des droits d'administration limités sur leur propre OU via l'assistant de délégation d'Active Directory.
-   **Permissions Déléguées** :
    -   Réinitialiser les mots de passe des utilisateurs de leur service.
    -   Créer/modifier les comptes utilisateurs de leur service.
    -   Intégrer de nouveaux postes de travail au domaine.
-   **Justification** : Répond précisément au besoin du cahier des charges tout en appliquant le principe du moindre privilège. Les correspondants informatiques n'ont aucun accès aux serveurs (Tier 1) ou aux contrôleurs de domaine (Tier 0).

### C. Groupes Locaux de Domaine (`DL_...`) — Permissions sur Ressources

Ils portent les permissions techniques (ACL) sur les ressources partagées.

-   **Exemples** : `DL_Fichiers_RH_RW` (Lecture/Écriture), `DL_Fichiers_BE_RO` (Lecture seule), `DL_Acces_ERP`
-   **Fonctionnement** : On place les Groupes Globaux (GG) dans les Groupes Locaux (DL). Par exemple, `GG_RH` est membre de `DL_Fichiers_RH_RW`.
-   **Justification** : Centralise la gestion des permissions. Pour modifier les droits d'un service, on modifie l'appartenance de son GG à un DL, sans jamais toucher aux ACL sur les dossiers, ce qui est plus fiable et plus simple à auditer.

### D. Groupes de Tier 0

-   **Exemples** : `Admins_Domaine`, `Admins_Schema`.
-   **Justification** : Ces groupes sont placés dans l'OU `_ADMINISTRATION` et sont totalement isolés. Aucune délégation n'est appliquée sur eux, et leur appartenance est auditée en permanence pour protéger l'intégrité du domaine.

## 2. Gestion des Droits Croisés

Les accès inter-services sont gérés en respectant le modèle AGDLP.

| Service Demandeur | Ressource Cible | Implémentation Technique |
| :--- | :--- | :--- |
| **Juridique** | Données RH (Lecture) | `GG_Juridique` est ajouté comme membre de `DL_Fichiers_RH_RO`. |
| **Direction** | Tous les dossiers (Lecture) | `GG_Direction` est ajouté comme membre de tous les groupes `DL_*_RO`. |
| **Bureau d'Étude** | Données Labo (Écriture) | `GG_BE` est ajouté comme membre de `DL_Fichiers_Labo_RW`. |
| **Laboratoire** | Données BE (Lecture) | `GG_Labo` est ajouté comme membre de `DL_Fichiers_BE_RO`. |

## 3. Types de Comptes et Rôles

Pour garantir le principe du moindre privilège et la traçabilité, une convention de nommage stricte est appliquée selon le niveau de Tiering.

| Type de Compte | Convention de Nommage | Usage | Politique de Sécurité |
| :--- | :--- | :--- | :--- |
| **Utilisateur Standard (T2)** | `p.nom` (ex: `j.martin`) | Accès quotidien, bureautique, ERP. | Mot de passe complexe, expiration à 90j. |
| **Admin Délégué (T2)** | `adm_p.nom` | Administration locale d'une OU (création d'utilisateurs, reset MDP). | Compte secondaire, MFA, pas d'accès Internet. |
| **Admin Serveurs (T1)** | `a1_p.nom` | Administration des serveurs métiers (ERP, Fichiers). | Compte dédié, MFA, station de travail sécurisée (PAW). |
| **Admin Domaine (T0)** | `a0_p.nom` | Administration des contrôleurs de domaine. | Compte dédié, MFA via clé physique (YubiKey), PAW Tier 0. |
| **Compte de Service** | `svc_nomapp` | Tâches automatisées (ex: `svc_backup`). | Mot de passe très long (>25 car.), rotation manuelle contrôlée. |
| **Compte GMSA** | `gmsa_app$` | Services modernes (IIS, SQL) qui le supportent. | Géré par l'AD, rotation automatique du mot de passe. |
