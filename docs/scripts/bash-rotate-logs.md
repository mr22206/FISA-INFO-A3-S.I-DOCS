## 10. Rotation des Journaux (`rotate_logs.sh`)

Les fichiers journaux (logs) peuvent rapidement devenir très volumineux. Ce script gère leur archivage et leur compression pour maîtriser l'espace disque utilisé.

*Note : Sous Linux, l'outil standard pour cette tâche est `logrotate`. Ce script est une implémentation simplifiée à but pédagogique pour montrer les mécanismes de manipulation de fichiers.*

### Code Source Commenté

```bash
#!/bin/bash
#
# SYNOPSIS
#   Archive et compresse les fichiers de log d'une application spécifique.
#
# DESCRIPTION
#   Ce script recherche les fichiers .log dans un répertoire donné, les archive
#   avec une date, les compresse avec gzip, et supprime les archives de plus
#   d'un certain nombre de jours.
#
# PREREQUIS
#   - gzip doit être installé.
#   - Le script doit avoir les droits d'écriture sur le dossier des logs.

# --- Variables de Configuration ---
LOG_DIR="/var/log/lab_app"      # Dossier contenant les logs de l'application du labo
RETENTION_DAYS=30               # Nombre de jours de rétention pour les logs compressés

# --- Début du Script ---
echo "--- Début de la rotation des logs pour $LOG_DIR ---"

# 1. Vérifier si le dossier de logs existe
if [ ! -d "$LOG_DIR" ]; then
    echo "Le dossier $LOG_DIR n'existe pas. Aucune action n'est requise."
    exit 0
fi

# 2. Archiver et compresser les fichiers .log
# On utilise `find` pour ne sélectionner que les fichiers se terminant par .log
# et qui ne sont pas vides.
find "$LOG_DIR" -name "*.log" -type f -size +0c | while read -r logfile; do
    # On renomme le fichier avec la date du jour
    timestamp=$(date '+%Y-%m-%d')
    archive_name="${logfile}_${timestamp}"
    
    echo "Archivage de $logfile vers $archive_name"
    mv "$logfile" "$archive_name"
    
    echo "Compression de $archive_name"
    gzip "$archive_name"
    
    # Optionnel: recréer un fichier de log vide pour que l'application puisse continuer à écrire
    touch "$logfile"
    # Optionnel: ajuster les permissions si nécessaire
    # chown appuser:appgroup "$logfile"
done

# 3. Supprimer les vieilles archives
echo "Suppression des archives compressées de plus de $RETENTION_DAYS jours..."
# On cherche les fichiers .gz qui ont été modifiés il y a plus de RETENTION_DAYS jours
find "$LOG_DIR" -name "*.log_*.gz" -type f -mtime +"$RETENTION_DAYS" -print -delete

echo "--- Rotation des logs terminée ---"

exit 0
```

### Contextualisation

Les applications sur les serveurs du laboratoire peuvent générer une grande quantité de logs. Sans gestion, cela peut saturer le disque système et rendre le diagnostic difficile. Ce script, exécuté via une **tâche cron** (généralement la nuit), assure une maintenance automatique. Il permet de conserver un historique des logs sur 30 jours, ce qui est suffisant pour la plupart des analyses post-incident, tout en gardant l'utilisation du disque sous contrôle.

### Bonnes Pratiques

-   **Ciblage Précis** : Le script utilise `find` pour ne cibler que les fichiers `.log` non vides, évitant ainsi d'archiver des fichiers qui ne sont pas des logs ou des logs vides.
-   **Nommage Clair** : Les archives sont horodatées (`.log_YYYY-MM-DD`), ce qui les rend faciles à identifier et à trier.
-   **Gestion de la Rétention** : L'utilisation de `find` avec l'option `-mtime` est la méthode standard et efficace sous Linux pour supprimer les fichiers basés sur leur âge.
-   **Continuité de Service** : Le script recrée un fichier de log vide après l'archivage pour que l'application puisse continuer à écrire ses journaux sans interruption.
-   **Sécurité (`-delete`)** : L'option `-print -delete` de `find` est une bonne pratique : elle affiche d'abord les fichiers qui seront supprimés avant de les supprimer, ce qui est utile pour le débogage.
