VOLUME_NAME=$1
   BACKUP_FILE=$2

   if [ -z "$VOLUME_NAME" ] || [ -z "$BACKUP_FILE" ]; then
       echo "Usage: $0 <nom_du_volume> <fichier_de_sauvegarde>"
       exit 1
   fi

   docker run --rm -v $VOLUME_NAME:/volume -v $BACKUP_FILE:/backup/backup.tar.gz busybox \
       tar xzf /backup/backup.tar.gz -C /volume