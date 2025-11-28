# Architecture Active Directory

La structure d’annuaire Active Directory proposée pour XANADU repose sur une organisation logique en tiers de sécurité (Tier 0 / Tier 1 / Tier 2) inspirée des bonnes pratiques Microsoft (ESA-E, Securing Privileged Access).

Cette architecture garantit l’isolation stricte des comptes à privilèges, la sécurité des ressources critiques et la délégation simple pour les services métiers.

## 1. Schéma de la Structure Logique (Draw.io)

Voici le schéma détaillé de l'arborescence, incluant le tiering, les OU par site, et les GPO principales.

<details>
<summary>Cliquer pour voir le code source Draw.io</summary>

```
title Architecture AD Logique XANADU - Optimisée selon Recommandations d'Audit (Tiers Explicites)

%% Définition du domaine racine
xanadu.local [icon: network-cloud, color: red, label: "xanadu.local (Périmètre T0)", colorMode: bold] {
  %% =========================================
  %% TIER 0 : ZONE CRITIQUE (Nommage standardisé)
  %% =========================================
  _ADMINISTRATION [icon: shield, color: red, label: "_ADMINISTRATION (Comptes T0)"] {
    "But : Isolation stricte des identités T0" [icon: lock]
    Admins_Domaine [icon: user-cog, label: "a0_admin_infra (Compte T0)"]
    Admins_Schema [icon: user-cog, label: "T0_Schema_Admins (Groupe)"]
    Comptes_Service_T0 [icon: server, label: "svc_backup_T0 (Compte Svc)"]
  }
  _GROUPES_SECURITE [icon: layers, color: purple, label: "_GROUPES_SECURITE (Référentiel T0)"] {
    "But : Hébergement des groupes à hauts privilèges" [icon: azure-administrative-units]
    Groupes_Globaux [icon: users, label: "GG_T0_Roles (Conteneur)"]
    Groupes_Locaux [icon: share-alt, label: "DL_T0_Permissions (Conteneur)"]
  }
  %% =========================================
  %% PRODUCTION (TIER 1 & TIER 2)
  %% =========================================
  XANADU_CORP [icon: building, color: darkgreen, label: "XANADU_CORP (Racine Prod T1/T2)"] {
    %% -----------------------------------------
    %% SITE ATLANTIS (SIÈGE)
    %% -----------------------------------------
    ATLANTIS [icon: map-pin, color: green, label: "Site siège (Mixte T0/T1/T2)\nGPO: WSUS Siège, Imprimantes Siège"] {
      
      %% TIER 1 : SERVEURS & ADMINS T1
      SERVEURS_AT [icon: server, label: "SERVEURS_AT (T0/T1)\nGPO: Sec_Baseline_Server_T1"] {
        SRV-DC-ATL-01 [icon: server, label: "FSMO x5 (Principal - T0)"]
        SRV-DC-ATL-02 [icon: server, label: "DC secondaire (Redondance - T0)"]
        %% Ajout des ressources T1 distinctes
        SRV-FICHIERS [icon: hdd, label: "Srv Fichiers (Ressource T1)"]
        SRV-ERP-APP [icon: database, label: "Srv ERP (Ressource T1)"]
        %% AJOUT : Compte de service T1 explicite
        SVC_ERP [icon: user-cog, label: "svc_erp_T1 (Compte Svc)"]
        %% AJOUT : Groupe d'admin T1 explicite
        T1_ADMINS [icon: user-shield, label: "T1_Srv_Admins_GG (Groupe Admin T1)"]
      }
      
      %% TIER 2 : UTILISATEURS & ADMINS T2 (Nommage affiné)
      UTILISATEURS_AT [icon: users, label: "UTILISATEURS_AT (Zone T2)"] {
        DIRECTION [icon: user, label: "DIRECTION (OU T2)"] {
          GG_Direction [icon: user-friends, label: "GG_Direction (Groupe T2)"]
          GG_Admin_Direction [icon: user-shield, label: "T2_Adm_Dir_GG (Admin T2)"]
        }
        RH [icon: user, label: "RH (OU T2)"] {
          GG_RH [icon: user-friends, label: "GG_RH (Groupe T2)"]
          %% Nommage affiné pour le T2
          GG_Admin_RH [icon: user-shield, label: "T2_Adm_RH_GG (Admin T2)"]
        }
        COMPTA [icon: user, label: "COMPTA (OU T2)"] {
          GG_Compta [icon: user-friends, label: "GG_Compta (Groupe T2)"]
          GG_Admin_Compta [icon: user-shield, label: "T2_Adm_Compta_GG (Admin T2)"]
        }
        JURIDIQUE [icon: user, label: "JURIDIQUE (OU T2)"] {
          GG_Juridique [icon: user-friends, label: "GG_Juridique (Groupe T2)"]
          GG_Admin_Juridique [icon: user-shield, label: "T2_Adm_Jur_GG (Admin T2)"]
        }
        BE [icon: user, label: "Bureau d'étude (OU T2)"] {
          GG_BE [icon: user-friends, label: "GG_BE (Groupe T2)"]
          GG_Admin_BE [icon: user-shield, label: "T2_Adm_BE_GG (Admin T2)"]
        }
        COMMERCIAL [icon: user, label: "COMMERCIAL (OU T2)"] {
          GG_Commercial [icon: user-friends, label: "GG_Commercial (Groupe T2)"]
          GG_Admin_Commercial [icon: user-shield, label: "T2_Adm_Com_GG (Admin T2)"]
        }
      }
      
      %% TIER 2 : POSTES DE TRAVAIL
      ORDINATEURS_AT [icon: laptop, label: "ORDINATEURS_AT (Zone T2)\nGPO: Sec_Baseline_Workstation_T2"] {
        Fixes [icon: desktop, label: "Fixes (Ressources T2)"]
        Portables [icon: laptop, label: "Portables (Ressources T2)\nGPO: BitLocker + VPN Auto"]
        Imprimantes_AT [icon: print, label: "Imprimantes (Ressources T2)"]
      }
    }
    %% -----------------------------------------
    %% SITE SPRINGFIELD (DISTANT)
    %% -----------------------------------------
    SPRINGFIELD [icon: map-pin, color: orange, label: "Site distant (Mixte T0/T1/T2)\nGPO: WSUS Distant, Imprimantes Labo"] {
      
      SERVEURS_SP [icon: server, label: "SERVEURS_SP (Mixte T0/T1)\nGPO: Sec_Baseline_Server_T1"] {
        
        SRV-DC-SPR-01 [icon: server, label: "RODC (Lecture Seule - T0)"]
        "SRV-LINUX-01" [icon: server, label: "Linux Labo 1 (Ressource T1)"]
        "SRV-LINUX-02" [icon: server, label: "Linux Labo 2 (Ressource T1)"]
      }
      
      UTILISATEURS_SP [icon: users, label: "UTILISATEURS_SP (Zone T2)"] {
        LABORATOIRE [icon: flask, label: "LABORATOIRE (OU T2)"] {
          GG_Labo [icon: user-friends, label: "GG_Labo (Groupe T2)"]
          %% Nommage affiné T2
          GG_Admin_Labo [icon: user-shield, label: "T2_Adm_Labo_GG (Admin T2)"]
        }
      }
      
      ORDINATEURS_SP [icon: laptop, label: "ORDINATEURS_SP (Zone T2)\nGPO: Sec_Baseline_Workstation_T2"] {
        Labo_Postes [icon: desktop, label: "Postes Labo (T2)\nGPO: Restrictions Sécurité"]
        Imprimantes_SP [icon: print, label: "Imprimantes Labo (Ressources T2)"]
      }
    }
  }
}
```
</details>

## 2. Justification de la Structure

### 2.1 Racine du domaine – xanadu.local (Périmètre Tier 0)

La racine contient uniquement les éléments fondamentaux du domaine. Rien d’opérationnel n’y est placé afin de réduire les risques :

-   **`_ADMINISTRATION` (Tier 0)** : Contient les comptes hautement privilégiés (Admins du domaine, Admins du schéma). Leur séparation protège les rôles critiques (FSMO, ADDS) contre une compromission depuis un poste ou un serveur de Tier 1 ou 2.
-   **`_GROUPES_SECURITE` (Tier 0/T1)** : Contient le référentiel technique des groupes globaux (GG) et locaux (DL). L'objectif est d'éviter la dispersion des objets sensibles dans les OU métiers et de faciliter l'audit.

### 2.2 XANADU_CORP – Production (Tier 1 et Tier 2)

L’OU principale regroupe tous les objets opérationnels, divisée par site : **ATLANTIS** (Siège) et **SPRINGFIELD** (Distant).

-   **SERVEURS (Tier 0/T1)** : Les contrôleurs de domaine (T0) sont isolés logiquement des serveurs métiers (ERP, fichiers) qui sont en Tier 1. Cette organisation permet l'application de GPO de durcissement spécifiques par niveau de criticité.
-   **UTILISATEURS (Tier 2)** : Chaque service possède sa propre OU pour une délégation fine des droits aux **correspondants informatiques**. Cette segmentation est la base de la sécurité et de l'agilité administrative.
-   **ORDINATEURS (Tier 2)** : Les postes fixes et portables sont séparés pour pouvoir appliquer des GPO distinctes (ex: BitLocker et configuration VPN automatique pour les portables).
