# Plan d'Adressage IP et Segmentation Réseau

Ce document décrit l'architecture logique du réseau de XANADU, incluant la segmentation en VLANs, le plan d'adressage IP, les attributions statiques et les plages DHCP pour les sites d'Atlantis et de Springfield.

## 1. Stratégie de Segmentation

L'architecture réseau repose sur une segmentation stricte à l'aide de VLANs (Virtual Local Area Networks). Chaque VLAN correspond à un sous-réseau IP distinct, et le routage inter-VLAN est assuré par les commutateurs de couche 3 (Switchs Principaux). Cette approche a plusieurs objectifs :

-   **Sécurité** : Isoler les flux critiques. Par exemple, le trafic de gestion (VLAN 199) est séparé du trafic des utilisateurs. Le VLAN DMZ (130) isole les serveurs exposés à Internet.
-   **Performance** : Réduire la taille des domaines de broadcast, améliorant ainsi les performances globales du réseau.
-   **Organisation** : Structurer le réseau de manière logique, alignée sur les fonctions de l'entreprise (un VLAN par service utilisateur) et les types d'équipements.

La nomenclature des sous-réseaux suit la règle `192.168.[ID_VLAN].0/[CIDR]`, rendant l'identification des réseaux intuitive.

### Convention de Nommage des Hôtes

Tous les équipements suivent la convention : **`[SiteType]-[Rôle]-[Num]`**

| Élément | Description | Valeurs |
|:--------|:------------|:--------|
| **SiteType** | Site + Type de déploiement | `AP` = Atlantis Physique, `AV` = Atlantis Virtuel, `SP` = Springfield Physique, `SV` = Springfield Virtuel |
| **Rôle** | Fonction de l'équipement | `FW`, `SW`, `ESXI`, `DC`, `NAS`, `PRN`, `SYSLOG`, etc. |
| **Num** | Numéro d'instance | `01`, `02`, etc. |

**Exemples :**
- `AP-FW-01` → Atlantis Physique, Firewall, instance 01
- `AV-DC-01` → Atlantis Virtuel, Domain Controller, instance 01
- `SP-SRV-LAB-01` → Springfield Physique, Serveur Laboratoire, instance 01

## 2. Tableau des VLANs et Sous-réseaux

> **Note :** Les adresses de passerelle correspondent aux interfaces du firewall (ou du switch L3 pour le routage inter-VLAN).

### Site d'Atlantis

| ID &nbsp;&nbsp; | Nom du VLAN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Sous-réseau (CIDR) | Plage Utilisable &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Passerelle &nbsp;&nbsp;&nbsp;&nbsp; | Description / Usage &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
|:---|:---|:---|:---|:---|:---|
| 111 | **Comptabilité** | `192.168.111.0/27` | `.1` à `.29` | `.30` | **DHCP.** Postes du service Comptabilité. |
| 112 | **Commercial** | `192.168.112.0/27` | `.1` à `.29` | `.30` | **DHCP.** Postes du service Commercial. |
| 113 | **Bureau d'étude** | `192.168.113.0/27` | `.1` à `.29` | `.30` | **DHCP.** Postes du Bureau d'étude. |
| 114 | **Juridique** | `192.168.114.0/27` | `.1` à `.29` | `.30` | **DHCP.** Postes du service Juridique. |
| 115 | **RH** | `192.168.115.0/27` | `.1` à `.29` | `.30` | **DHCP.** Postes du service RH. |
| 116 | **Laboratoire** | `192.168.116.0/27` | `.1` à `.29` | `.30` | **DHCP.** Postes du Laboratoire. |
| 117 | **Direction** | `192.168.117.0/27` | `.1` à `.29` | `.30` | **DHCP.** Postes de la Direction. |
| 120 | **Servers** | `192.168.120.0/28` | `.1` à `.13` | `.14` | **Statique.** Serveurs de production internes (Backend et DB de l'ERP). |
| 130 | **DMZ** | `192.168.130.0/28` | `.1` à `.13` | `.14` | **Statique.** Zone Démilitarisée pour les serveurs exposés (frontal ERP). |
| 140 | **WiFi-Corporate** | `192.168.140.0/24` | `.1` à `.253` | `.254` | **DHCP.** Accès sans-fil pour les employés, avec accès aux ressources internes. |
| 150 | **WiFi-Guest** | `192.168.150.0/24` | `.1` à `.253` | `.254` | **DHCP.** Accès sans-fil pour les invités, en isolation complète (accès Internet uniquement). |
| 160 | **Storage** | `192.168.160.0/28` | `.1` à `.13` | `.14` | **Statique.** Réseau de stockage dédié pour les NAS et les flux de sauvegarde. |
| 170 | **Peripherals** | `192.168.170.0/28` | `.1` à `.13` | `.14` | **Statique/DHCP.** Imprimantes, copieurs et autres périphériques. |
| 199 | **Management** | `192.168.199.0/28` | `.1` à `.13` | `.14` | **Statique.** Interfaces de gestion des serveurs, switchs, firewalls, ESXi, SAN. |

### Site de Springfield

| ID &nbsp;&nbsp; | Nom du VLAN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Sous-réseau (CIDR) | Plage Utilisable &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Passerelle &nbsp;&nbsp;&nbsp;&nbsp; | Description / Usage &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
|:---|:---|:---|:---|:---|:---|
| 220 | **Servers** | `192.168.220.0/28` | `.1` à `.13` | `.14` | **Statique.** RODC et serveurs Linux du laboratoire. |
| 230 | **Peripherals** | `192.168.230.0/28` | `.1` à `.13` | `.14` | **Statique/DHCP.** Périphériques du laboratoire. |
| 240 | **Users** | `192.168.240.0/27` | `.1` à `.29` | `.30` | **DHCP.** Postes de travail des 10 chercheurs. |
| 241 | **WiFi-Corporate** | `192.168.241.0/27` | `.1` à `.29` | `.30` | **DHCP.** Accès sans-fil pour les employés du site distant. |
| 250 | **WiFi-Guest** | `192.168.250.0/27` | `.1` à `.29` | `.30` | **DHCP.** Accès sans-fil pour les invités du site distant. |
| 260 | **Storage** | `192.168.260.0/28` | `.1` à `.13` | `.14` | **Statique.** NAS physique du site distant. |
| 299 | **Management** | `192.168.299.0/28` | `.1` à `.13` | `.14` | **Statique.** Gestion des équipements réseau du site distant. |

## 3. Tableau des Adresses IP Statiques

### Site d'Atlantis

#### VLAN Servers (120) — `192.168.120.0/28`

| Hôte (DNS) | Rôle | Adresse IP | OS / Type |
|:---|:---|:---|:---|
| `AV-ERP-BE-01` | Backend Applicatif ERP | `192.168.120.13` | Linux (VM) |
| `AV-ERP-DB-01` | Base de Données PostgreSQL ERP | `192.168.120.12` | Linux (VM) |

#### VLAN DMZ (130) — `192.168.130.0/28`

| Hôte (DNS) | Rôle | Adresse IP | OS / Type |
|:---|:---|:---|:---|
| `AV-ERP-FE-01` | Frontal Web ERP | `192.168.130.13` | Linux (VM) |

#### VLAN WiFi-Corporate (140) — `192.168.140.0/24`

| Hôte (DNS) | Rôle | Adresse IP | OS / Type |
|:---|:---|:---|:---|
| `AP-WAP-01` | Borne WiFi Corporate 1 | `192.168.140.1` | Access Point |
| `AP-WAP-02` | Borne WiFi Corporate 2 | `192.168.140.2` | Access Point |

#### VLAN WiFi-Guest (150) — `192.168.150.0/24`

| Hôte (DNS) | Rôle | Adresse IP | OS / Type |
|:---|:---|:---|:---|
| `AP-WAP-GUEST-01` | Borne WiFi Guest 1 | `192.168.150.1` | Access Point |
| `AP-WAP-GUEST-02` | Borne WiFi Guest 2 | `192.168.150.2` | Access Point |

#### VLAN Storage (160) — `192.168.160.0/28`

| Hôte (DNS) | Rôle | Adresse IP | OS / Type |
|:---|:---|:---|:---|
| `AP-NAS-01` | NAS Physique principal | `192.168.160.13` | Appliance NAS |
| `AV-NAS-01` | NAS Virtuel (réplication/backup) | `192.168.160.12` | Linux (VM) |

#### VLAN Peripherals (170) — `192.168.170.0/28`

| Hôte (DNS) | Rôle | Adresse IP | OS / Type |
|:---|:---|:---|:---|
| `AP-PRN-COPIEUR-01` | Copieur Multifonction | `192.168.170.13` | Imprimante |
| `AP-PRN-COULEUR-01` | Imprimante Couleur | `192.168.170.12` | Imprimante |

#### VLAN Management (199) — `192.168.199.0/28`

| Hôte (DNS) | Rôle | Adresse IP | OS / Type |
|:---|:---|:---|:---|
| `AP-FW-01` | Firewall Principal (Cluster) | `192.168.199.1` | Firewall Appliance |
| `AP-FW-02` | Firewall Secondaire (Cluster) | `192.168.199.2` | Firewall Appliance |
| `AP-SW-CORE-01` | Switch Coeur de Réseau 1 | `192.168.199.3` | Switch L3 |
| `AP-SW-CORE-02` | Switch Coeur de Réseau 2 | `192.168.199.4` | Switch L3 |
| `AP-ESXI-01` | Hôte de Virtualisation 1 | `192.168.199.5` | VMware ESXi |
| `AP-ESXI-02` | Hôte de Virtualisation 2 | `192.168.199.6` | VMware ESXi |
| `AV-DC-01` | Contrôleur Domaine (FSMO) | `192.168.199.7` | Windows Server (VM) |
| `AV-DNS-01` | Serveur DNS | `192.168.199.8` | Linux (VM) |
| `AV-DHCP-01` | Serveur DHCP | `192.168.199.9` | Windows Server (VM) |
| `AV-MON-01` | Serveur de Monitoring | `192.168.199.10` | Linux (VM) |
| `AV-SYSLOG-01` | Serveur de Logs | `192.168.199.11` | Linux (VM) |
| `AV-BASTION-01` | Serveur Bastion (Accès sécurisé) | `192.168.199.12` | Linux (VM) |

### Site de Springfield

#### VLAN Servers (220) — `192.168.220.0/28`

| Hôte (DNS) | Rôle | Adresse IP | OS / Type |
|:---|:---|:---|:---|
| `SV-RODC-01` | Read-Only Domain Controller | `192.168.220.13` | Windows Server (VM) |
| `SP-SRV-LAB-01` | Serveur Linux Laboratoire 1 | `192.168.220.12` | Linux (Physique) |
| `SP-SRV-LAB-02` | Serveur Linux Laboratoire 2 | `192.168.220.11` | Linux (Physique) |

#### VLAN Peripherals (230) — `192.168.230.0/28`

| Hôte (DNS) | Rôle | Adresse IP | OS / Type |
|:---|:---|:---|:---|
| `SP-PRN-COPIEUR-01` | Copieur Multifonction | `192.168.230.13` | Imprimante |
| `SP-PRN-METIER-01` | Imprimante Métier | `192.168.230.12` | Imprimante |

#### VLAN WiFi-Corporate (241) — `192.168.241.0/27`

| Hôte (DNS) | Rôle | Adresse IP | OS / Type |
|:---|:---|:---|:---|
| `SP-WAP-01` | Borne WiFi Corporate | `192.168.241.1` | Access Point |

#### VLAN WiFi-Guest (250) — `192.168.250.0/27`

| Hôte (DNS) | Rôle | Adresse IP | OS / Type |
|:---|:---|:---|:---|
| `SP-WAP-GUEST-01` | Borne WiFi Guest | `192.168.250.1` | Access Point |

#### VLAN Storage (260) — `192.168.260.0/28`

| Hôte (DNS) | Rôle | Adresse IP | OS / Type |
|:---|:---|:---|:---|
| `SP-NAS-01` | NAS Physique site distant | `192.168.260.13` | Appliance NAS |

#### VLAN Management (299) — `192.168.299.0/28`

| Hôte (DNS) | Rôle | Adresse IP | OS / Type |
|:---|:---|:---|:---|
| `SP-FW-01` | Firewall Site Distant 1 | `192.168.299.1` | Firewall Appliance |
| `SP-FW-02` | Firewall Site Distant 2 | `192.168.299.2` | Firewall Appliance |
| `SP-SW-01` | Switch d'Accès 1 | `192.168.299.3` | Switch L3 |
| `SP-SW-02` | Switch d'Accès 2 | `192.168.299.4` | Switch L3 |

## 4. Synthèse des Plages DHCP

Le service DHCP (hébergé sur `AV-DHCP-01`) gèrera les étendues suivantes. Des relais DHCP seront configurés sur les switchs de couche 3 pour les VLANs qui en ont besoin.

-   **Atlantis** :
    -   VLANs Services (111 à 117) : Plages de `192.168.11x.1` à `192.168.11x.29`.
    -   VLAN `WiFi-Corporate` (140) : Plage de `192.168.140.100` à `192.168.140.200`.
    -   VLAN `WiFi-Guest` (150) : Plage de `192.168.150.100` à `192.168.150.200`.
-   **Springfield** :
    -   VLAN `Users` (240) : Plage de `192.168.240.1` à `192.168.240.29`.
    -   VLAN `WiFi-Corporate` (241) : Plage de `192.168.241.1` à `192.168.241.29`.
    -   VLAN `WiFi-Guest` (250) : Plage de `192.168.250.1` à `192.168.250.29`.
