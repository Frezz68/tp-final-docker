#!/bin/bash
 VOLUME_NAME=$1
 BACKUP_PATH=$2

 if [ -z "$VOLUME_NAME" ] || [ -z "$BACKUP_PATH" ]; then
     echo "Usage: $0 <nom_du_volume> <chemin_de_sauvegarde>"
     exit 1
 fi

 docker run --rm -v $VOLUME_NAME:/volume -v $BACKUP_PATH:/backup busybox \
     tar czf /backup/backup.tar.gz -C /volume .