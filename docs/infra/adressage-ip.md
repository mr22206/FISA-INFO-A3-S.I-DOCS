# Plan d'Adressage IP et Segmentation Réseau

Ce document décrit l'architecture logique du réseau de XANADU, incluant la segmentation en VLANs, le plan d'adressage IP, les attributions statiques et les plages DHCP pour les sites d'Atlantis et de Springfield.

## 1. Stratégie de Segmentation

L'architecture réseau repose sur une segmentation stricte à l'aide de VLANs (Virtual Local Area Networks). Chaque VLAN correspond à un sous-réseau IP distinct, et le routage inter-VLAN est assuré par les commutateurs de couche 3 (Switchs Principaux). Cette approche a plusieurs objectifs :

-   **Sécurité** : Isoler les flux critiques. Par exemple, le trafic de gestion (VLAN 199) est séparé du trafic des utilisateurs. Le VLAN DMZ (130) isole les serveurs exposés à Internet.
-   **Performance** : Réduire la taille des domaines de broadcast, améliorant ainsi les performances globales du réseau.
-   **Organisation** : Structurer le réseau de manière logique, alignée sur les fonctions de l'entreprise (un VLAN par service utilisateur) et les types d'équipements.

La nomenclature des sous-réseaux suit la règle `192.168.[ID_VLAN].0/[CIDR]`, rendant l'identification des réseaux intuitive.

## 2. Tableau des VLANs et Sous-réseaux

### Site d'Atlantis

| ID &nbsp;&nbsp; | Nom du VLAN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Sous-réseau (CIDR) | Plage Utilisable &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Passerelle &nbsp;&nbsp;&nbsp;&nbsp; | Description / Usage &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
|:---|:---|:---|:---|:---|:---|
| 199 | **Management** | `192.168.199.0/24` | `.1` à `.253` | `.254` | **Statique.** Interfaces de gestion des serveurs, switchs, firewalls, ESXi, SAN. |
| 130 | **DMZ** | `192.168.130.0/24` | `.1` à `.253` | `.254` | **Statique.** Zone Démilitarisée pour les serveurs exposés (frontal ERP). |
| 120 | **Servers** | `192.168.120.0/24` | `.1` à `.253` | `.254` | **Statique.** Serveurs de production internes (Backend et DB de l'ERP). |
| 180 | **Storage** | `192.168.180.0/24` | `.1` à `.253` | `.254` | **Statique.** Réseau de stockage dédié pour les NAS et les flux de sauvegarde. |
| 111-116 | **Users-Services** | `192.168.111-116.0/27` | `.1` à `.29` | `.30` | **DHCP.** VLANs segmentés pour chaque service (Direction, RH, Compta, etc.). |
| 170 | **Peripherals** | `192.168.170.0/27` | `.1` à `.29` | `.30` | **Statique/DHCP.** Imprimantes, copieurs et autres périphériques. |
| 140 | **WiFi-Corporate** | `192.168.140.0/24` | `.1` à `.253` | `.254` | **DHCP.** Accès sans-fil pour les employés, avec accès aux ressources internes. |
| 150 | **WiFi-Guest** | `192.168.150.0/24` | `.1` à `.253` | `.254` | **DHCP.** Accès sans-fil pour les invités, en isolation complète (accès Internet uniquement). |

### Site de Springfield

| ID &nbsp;&nbsp; | Nom du VLAN &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Sous-réseau (CIDR) | Plage Utilisable &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; | Passerelle &nbsp;&nbsp;&nbsp;&nbsp; | Description / Usage &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |
|:---|:---|:---|:---|:---|:---|
| 299 | **S-Management** | `192.168.299.0/24` | `.1` à `.253` | `.254` | **Statique.** Gestion des équipements réseau du site distant. |
| 220 | **S-Servers** | `192.168.220.0/27` | `.1` à `.29` | `.30` | **Statique.** RODC et serveurs Linux du laboratoire. |
| 280 | **S-Storage** | `192.168.280.0/28` | `.1` à `.13` | `.14` | **Statique.** NAS physique du site distant. |
| 240 | **S-Users** | `192.168.240.0/27` | `.1` à `.29` | `.30` | **DHCP.** Postes de travail des 10 chercheurs. |
| 230 | **S-Peripherals** | `192.168.230.0/28` | `.1` à `.13` | `.14` | **Statique/DHCP.** Périphériques du laboratoire. |
| 241 | **S-WiFi-Corporate**| `192.168.241.0/27` | `.1` à `.29` | `.30` | **DHCP.** Accès sans-fil pour les employés du site distant. |
| 250 | **S-WiFi-Guest** | `192.168.250.0/24` | `.1` à `.253` | `.254` | **DHCP.** Accès sans-fil pour les invités du site distant. |

## 3. Tableau des Adresses IP Statiques

### Site d'Atlantis

| Hôte (DNS) | Rôle | VLAN (ID) | Adresse IP | OS / Type |
|:---|:---|:---|:---|:---|
| `A-FW-01` | Firewall Principal | Management (199) | `192.168.199.1` | Firewall Appliance |
| `A-SW-CORE-01` | Switch Coeur de Réseau 1 | Management (199) | `192.168.199.2` | Switch L3 |
| `A-SW-CORE-02` | Switch Coeur de Réseau 2 | Management (199) | `192.168.199.3` | Switch L3 |
| `A-ESXI-01` | Hôte de Virtualisation 1 | Management (199) | `192.168.199.10` | VMware ESXi |
| `A-ESXI-02` | Hôte de Virtualisation 2 | Management (199) | `192.168.199.11` | VMware ESXi |
| `A-DC-01` | Contrôleur Domaine (FSMO), DNS | Management (199) | `192.168.199.20` | Windows Server (VM) |
| `A-VM-DHCP-01`| Serveur DHCP | Management (199) | `192.168.199.21` | Windows Server (VM) |
| `A-VM-MON-01` | Serveur de Monitoring | Management (199) | `192.168.199.22` | Linux (VM) |
| `A-VM-SYSLOG-01`| Serveur de Logs | Management (199) | `192.168.199.23` | Linux (VM) |
| `A-VM-BASTION-01`| Serveur Bastion (Accès sécurisé) | Management (199) | `192.168.199.24` | Linux (VM) |
| `A-VM-ERP-FE-01`| Frontal Web ERP | DMZ (130) | `192.168.130.10` | Linux (VM) |
| `A-VM-ERP-BE-01`| Backend Applicatif ERP | Servers (120) | `192.168.120.10` | Linux (VM) |
| `A-VM-ERP-DB-01`| Base de Données PostgreSQL ERP | Servers (120) | `192.168.120.11` | Linux (VM) |
| `A-NAS-PHY-01`| NAS Physique principal | Storage (180) | `192.168.180.10` | Appliance NAS |
| `A-PRN-COPIEUR` | Copieur Multifonction | Peripherals (170) | `192.168.170.10` | Imprimante |
| `A-PRN-COULEUR` | Imprimante Couleur | Peripherals (170) | `192.168.170.11` | Imprimante |

### Site de Springfield

| Hôte (DNS) | Rôle | VLAN (ID) | Adresse IP | OS / Type |
|:---|:---|:---|:---|:---|
| `S-FW-01` | Firewall Site Distant 1 | S-Management (299) | `192.168.299.1` | Firewall Appliance |
| `S-FW-02` | Firewall Site Distant 2 | S-Management (299) | `192.168.299.2` | Firewall Appliance |
| `S-SW-01` | Switch d'Accès 1 | S-Management (299) | `192.168.299.3` | Switch L3 |
| `S-SW-02` | Switch d'Accès 2 | S-Management (299) | `192.168.299.4` | Switch L3 |
| `S-RODC-01` | Read-Only Domain Controller | S-Servers (220) | `192.168.220.10` | Windows Server (VM) |
| `S-SRV-LAB-01`| Serveur Linux Laboratoire 1 | S-Servers (220) | `192.168.220.11` | Linux (Physique) |
| `S-SRV-LAB-02`| Serveur Linux Laboratoire 2 | S-Servers (220) | `192.168.220.12` | Linux (Physique) |
| `S-NAS-PHY-01`| NAS Physique site distant | S-Storage (280) | `192.168.280.10` | Appliance NAS |
| `S-PRN-COPIEUR`| Copieur Multifonction | S-Peripherals (230) | `192.168.230.10` | Imprimante |
| `S-PRN-METIER` | Imprimante Métier | S-Peripherals (230) | `192.168.230.11` | Imprimante |

## 4. Synthèse des Plages DHCP

Le service DHCP (hébergé sur `A-VM-DHCP-01`) gèrera les étendues suivantes. Des relais DHCP seront configurés sur les switchs de couche 3 pour les VLANs qui en ont besoin.

-   **Atlantis** :
    -   VLANs `USERS_Services` (111 à 116) : Plages de `192.168.11x.1` à `192.168.11x.20`.
    -   VLAN `WiFi-Corporate` (140) : Plage de `192.168.140.100` à `192.168.140.200`.
    -   VLAN `WiFi-Guest` (150) : Plage de `192.168.150.100` à `192.168.150.200`.
-   **Springfield** :
    -   VLAN `S-Users` (240) : Plage de `192.168.240.1` à `192.168.240.25`.
    -   VLAN `S-WiFi-Corporate` (241) : Plage de `192.168.241.1` à `192.168.241.25`.
    -   VLAN `S-WiFi-Guest` (250) : Plage de `192.168.250.100` à `192.168.250.200`.
