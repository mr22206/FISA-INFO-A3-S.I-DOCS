## 8. Sauvegarde des Données du Laboratoire (`backup_lab_data.sh`)

Ce script Bash est conçu pour s'exécuter sur les serveurs Linux de Springfield. Il automatise la sauvegarde des données de recherche critiques vers le NAS central d'Atlantis.

### Code Source Commenté

```bash
#!/bin/bash
#
# SYNOPSIS
#   Sauvegarde les données du laboratoire vers un partage distant en utilisant rsync.
#
# DESCRIPTION
#   Ce script effectue une sauvegarde incrémentale d'un dossier source local
#   vers une destination NFS/CIFS distante. Il gère un fichier de log
#   et un fichier de verrouillage pour éviter les exécutions multiples.
#
# PREREQUIS
#   - rsync doit être installé (sudo apt-get install rsync).
#   - Le partage distant doit être monté et accessible.
#   - Le script doit être exécuté avec un utilisateur ayant les droits de lecture sur la source
#     et d'écriture sur la destination.

# --- Variables de Configuration ---
SOURCE_DIR="/data/lab_results"        # Dossier local contenant les données à sauvegarder
DEST_DIR="/mnt/nas_atlantis/backups/lab" # Point de montage du NAS distant
LOG_FILE="/var/log/backup_lab.log"    # Fichier pour journaliser les opérations
LOCK_FILE="/tmp/backup_lab.lock"      # Fichier de verrouillage pour éviter l'exécution simultanée

# --- Fonctions ---

# Fonction pour écrire un message dans le log avec une date
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# --- Début du Script ---

# 1. Vérifier si le script est déjà en cours d'exécution
if [ -e "$LOCK_FILE" ]; then
    log_message "ERREUR: Le script de sauvegarde est déjà en cours (fichier de verrouillage trouvé)."
    # Optionnel: envoyer une alerte email ici
    exit 1
else
    # Créer le fichier de verrouillage
    touch "$LOCK_FILE"
fi

# 2. Vérifier que la source et la destination sont accessibles
if [ ! -d "$SOURCE_DIR" ]; then
    log_message "ERREUR: Le dossier source $SOURCE_DIR n'existe pas."
    rm "$LOCK_FILE" # Ne pas oublier de supprimer le verrou
    exit 1
fi
if [ ! -d "$DEST_DIR" ]; then
    log_message "ERREUR: Le dossier de destination $DEST_DIR n'est pas monté ou accessible."
    rm "$LOCK_FILE"
    exit 1
fi

# --- Exécution de la Sauvegarde ---
log_message "Début de la sauvegarde de $SOURCE_DIR vers $DEST_DIR"

# Commande rsync
# -a : mode archive (préserve permissions, liens, etc.)
# -v : mode verbeux
# -z : compresse les données pendant le transfert
# --delete : supprime les fichiers de la destination qui n'existent plus dans la source
# --log-file : envoie la sortie détaillée de rsync dans notre fichier de log
rsync -avz --delete "$SOURCE_DIR/" "$DEST_DIR/" --log-file="$LOG_FILE"

# Vérifier le code de retour de rsync
RSYNC_EXIT_CODE=$?
if [ $RSYNC_EXIT_CODE -eq 0 ]; then
    log_message "Sauvegarde terminée avec succès."
else
    log_message "ERREUR: La commande rsync a échoué avec le code de sortie $RSYNC_EXIT_CODE."
    # Optionnel: envoyer une alerte email ici
fi

# --- Nettoyage ---
# Supprimer le fichier de verrouillage à la fin
rm "$LOCK_FILE"

log_message "Fin du script de sauvegarde."
exit $RSYNC_EXIT_CODE
```

### Contextualisation

Les deux serveurs Linux du laboratoire génèrent des données de recherche qui sont critiques pour le Bureau d'Étude. Ce script, déployé sur ces deux serveurs et exécuté via une **tâche cron** toutes les nuits, garantit que ces données sont externalisées sur le NAS d'Atlantis. Elles sont ainsi intégrées dans le cycle de sauvegarde global de l'entreprise (sauvegarde du NAS vers le cloud, etc.).

### Bonnes Pratiques

-   **Robustesse (Fichier de Verrouillage)** : Le script utilise un "lock file" pour s'assurer qu'une seule instance de la sauvegarde s'exécute à la fois. C'est crucial pour les tâches cron qui pourraient se chevaucher si une sauvegarde est plus longue que prévu.
-   **Journalisation (Logging)** : Toutes les actions, succès comme erreurs, sont écrites dans un fichier de log avec une date. C'est indispensable pour le dépannage.
-   **Utilisation de `rsync`** : `rsync` est l'outil standard de l'industrie pour la synchronisation de fichiers sous Linux. Son algorithme de "delta-transfer" est très efficace car il ne transfère que les parties modifiées des fichiers.
-   **Vérifications Préalables** : Le script vérifie que les dossiers source et destination existent avant de lancer la copie, évitant ainsi des erreurs imprévues.
-   **Gestion des Erreurs** : Le script vérifie le code de retour de la commande `rsync` pour logger un succès ou un échec.
