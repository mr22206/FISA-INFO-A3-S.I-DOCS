## 9. Surveillance de l'État Système (`check_health.sh`)

Ce script Bash fournit un bilan de santé de base pour un serveur Linux. Il est conçu pour être exécuté via une tâche cron et envoyer une alerte si des seuils critiques sont atteints.

### Code Source Commenté

```bash
#!/bin/bash
#
# SYNOPSIS
#   Vérifie l'utilisation des ressources système (CPU, RAM, Disque) et envoie
#   une alerte par e-mail si les seuils sont dépassés.
#
# DESCRIPTION
#   Ce script est un outil de monitoring simple mais efficace.
#   Il est non-intrusif et utilise des commandes Linux standard.
#
# PREREQUIS
#   - Un client mail comme `mailutils` ou `ssmtp` doit être installé et configuré
#     pour pouvoir envoyer des e-mails (ex: via un relais SMTP Office 365).
#   - Les commandes `vmstat`, `df`, `awk` doivent être disponibles.

# --- Variables de Configuration ---
CPU_THRESHOLD=90        # Seuil d'alerte pour l'utilisation CPU (en %)
MEM_THRESHOLD=90        # Seuil d'alerte pour l'utilisation RAM (en %)
DISK_THRESHOLD=95       # Seuil d'alerte pour l'utilisation disque (en %)
ALERT_EMAIL="admin-si@xanadu.local" # Adresse e-mail de l'équipe IT

# --- Récupération des Métriques ---

# 1. Utilisation CPU
# On utilise `vmstat` pour avoir une mesure lissée.
# 1 2 signifie 2 mesures à 1 seconde d'intervalle. On prend la 2ème.
# '100 - $15' calcule le % d'utilisation (100 - % idle)
CPU_USAGE=$(vmstat 1 2 | tail -1 | awk '{print 100 - $15}')

# 2. Utilisation Mémoire
# `free -m` pour avoir les valeurs en Mo.
# On calcule le % utilisé : (used / total) * 100
MEM_TOTAL=$(free -m | awk '/^Mem:/{print $2}')
MEM_USED=$(free -m | awk '/^Mem:/{print $3}')
MEM_USAGE=$((MEM_USED * 100 / MEM_TOTAL))

# 3. Utilisation Disque
# On vérifie la partition racine (`/`). On pourrait ajouter d'autres points de montage.
# `df -h /` récupère l'info. `awk` extrait la 5ème colonne (le pourcentage).
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

# --- Logique d'Alerte ---

# On prépare le corps du message d'alerte
ALERT_MESSAGE=""
HAS_ALERT=false

if [ "$CPU_USAGE" -ge "$CPU_THRESHOLD" ]; then
    ALERT_MESSAGE+="ALERTE CPU: Utilisation à ${CPU_USAGE}% (Seuil: ${CPU_THRESHOLD}%)\n"
    HAS_ALERT=true
fi

if [ "$MEM_USAGE" -ge "$MEM_THRESHOLD" ]; then
    ALERT_MESSAGE+="ALERTE RAM: Utilisation à ${MEM_USAGE}% (Seuil: ${MEM_THRESHOLD}%)\n"
    HAS_ALERT=true
fi

if [ "$DISK_USAGE" -ge "$DISK_THRESHOLD" ]; then
    ALERT_MESSAGE+="ALERTE DISQUE: Utilisation à ${DISK_USAGE}% (Seuil: ${DISK_THRESHOLD}%)\n"
    HAS_ALERT=true
fi

# --- Envoi de l'E-mail si nécessaire ---
if [ "$HAS_ALERT" = true ]; then
    SUBJECT="[ALERTE] Problème de ressource sur le serveur $(hostname)"
    
    # On ajoute un en-tête avec l'état actuel pour information
    FULL_BODY="État des ressources sur $(hostname) à $(date):\n"
    FULL_BODY+="CPU: ${CPU_USAGE}%\n"
    FULL_BODY+="RAM: ${MEM_USAGE}%\n"
    FULL_BODY+="Disque: ${DISK_USAGE}%\n\n"
    FULL_BODY+="$ALERT_MESSAGE"

    # Envoi de l'email
    echo -e "$FULL_BODY" | mail -s "$SUBJECT" "$ALERT_EMAIL"
    
    echo "Alerte envoyée à $ALERT_EMAIL"
fi

exit 0
```

### Contextualisation

Ce script est le premier niveau de la **supervision** pour les serveurs du laboratoire. Exécuté toutes les 5 ou 10 minutes par une **tâche cron**, il assure une surveillance de base mais essentielle. Si une application consomme trop de mémoire ou si un disque se remplit, l'équipe IT d'Atlantis est immédiatement notifiée et peut intervenir avant que le service ne soit interrompu. Il complète une solution de supervision plus globale.

### Bonnes Pratiques

-   **Simplicité et Portabilité** : Le script n'utilise que des commandes Linux standard (`vmstat`, `free`, `df`), il est donc compatible avec la plupart des distributions (Debian, CentOS, etc.) sans dépendances complexes.
-   **Configuration Facile** : Les seuils et l'adresse e-mail sont définis dans des variables en haut du script, ce qui les rend faciles à modifier.
-   **Alerte Conditionnelle** : Un e-mail n'est envoyé que si un seuil est effectivement dépassé, évitant ainsi le "spam" de notifications.
-   **Message d'Alerte Informatif** : Le corps de l'e-mail contient non seulement l'alerte, mais aussi l'état de toutes les ressources au moment du problème, ce qui aide au diagnostic.
-   **Utilisation de `hostname`** : Le sujet de l'e-mail inclut le nom du serveur, ce qui permet à l'administrateur de savoir immédiatement quelle machine est concernée.
