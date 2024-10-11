# 1.1 Introduction aux volumes

## Types de volumes :

### Volumes nommés :

Ce sont des volumes gérés par Docker. Ils sont stockés dans un emplacement spécifique du système de fichiers Docker et peuvent être utilisés par plusieurs conteneurs.

#### Avantages :

- Gestion facile : Docker prend en charge la création, la gestion et la suppression des volumes.
  Partage des volumes entre plusieurs conteneurs.
  Isolés des fichiers du système d'exploitation hôte.
- Cas d’utilisation :
  Lorsque vous voulez stocker des données de manière persistante, sans interagir directement avec le système de fichiers hôte.
  Par exemple, pour les bases de données ou des applications où la persistance des données est cruciale.

### Bind Mounts :

Avec les bind mounts, Docker monte directement un répertoire ou fichier de l'hôte dans le conteneur. Contrairement aux volumes nommés, les bind mounts donnent un contrôle direct sur les fichiers du système hôte.

#### Avantages :

- Accès direct aux fichiers de l’hôte, utile pour les environnements de développement où vous devez modifier des fichiers et voir les changements en temps réel dans le conteneur.
- Cas d’utilisation :
  Pour le développement où vous avez besoin de tester des modifications de code en direct.
  Lorsqu'il est nécessaire d'avoir un contrôle total sur l'emplacement des fichiers sur l'hôte.

### Tmpfs :

Ce sont des volumes temporaires stockés en mémoire, qui disparaissent lorsque le conteneur s'arrête.

#### Avantages :

Très rapide puisque les données sont stockées en mémoire.
Bon choix pour des données temporaires qui ne doivent pas être sauvegardées.

#### Cas d’utilisation :

Utilisé pour des données sensibles ou temporaires (par exemple, des fichiers de cache ou des fichiers temporaires qui ne nécessitent pas une persistance). 2. Avantages et inconvénients :

| Type de volume |                              Avantages                              |                            Inconvénients                            |
| :------------: | :-----------------------------------------------------------------: | :-----------------------------------------------------------------: |
| Volumes nommés | Isolation des données, partage entre conteneurs, gestion par Docker |     Moins de contrôle sur l'emplacement des fichiers sur l'hôte     |
|  Bind Mounts   |         Accès direct aux fichiers de l’hôte, contrôle total         | Moins sécurisé, plus d'interaction avec le système de fichiers hôte |
| Volumes tmpfs  |        Très rapide, stockage en mémoire, données temporaires        |      Non persistant, perte des données à l’arrêt du conteneur       |

# 1.2 Exercice : Bind mounts

J'ai créé un fichier index.html :

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Ma page Nginx</title>
  </head>
  <body>
    <h1>Bienvenue sur ma page servie par Nginx</h1>
  </body>
</html>
```

Puis, j'ai éxecuté la commande suivante :

```sh
docker run --name mon-nginx -v .\index.html:/usr/share/nginx/html/index.html -d -p 8080:80 nginx
```

Voici mon résultat :

![img index](./asset/img-index.png)

Lorsque je modifie mon index.html et que je rafraichit ma page, voici le résultat :

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Ma page Nginx</title>
  </head>
  <body>
    <h1>Bienvenue sur ma page servie par Nginx 2</h1>
  </body>
</html>
```

![img index 2](./asset/img-index2.png)

- Read-only (:ro) : Permet de monter le fichier en mode lecture seule dans le conteneur. Cela empêche toute modification du fichier à l'intérieur du conteneur.

- SELinux options (z, Z) : Permet d'utiliser :z ou :Z pour gérer les permissions.
- :z : partage les fichiers montés entre plusieurs conteneurs.
- :Z : applique des permissions spécifiques pour rendre les fichiers accessibles uniquement par le conteneur actuel.

# 1.3 Exercice : Volumes tmpfs

1. **Lancer un conteneur avec un volume tmpfs :**

   - On utilise la commande suivante pour lancer un conteneur Docker avec un volume _tmpfs_ monté dans le répertoire `/mytmpfs` :

   ```bash
   docker run --name mon-conteneur-tmpfs --mount type=tmpfs,destination=/mytmpfs -d nginx
   ```

2. **Écrire des données dans ce volume :**
   - On utilise la commande suivante pour écrire des données dans le répertoire monté :

```bash
 docker exec -it mon-conteneur-tmpfs bash
 echo "Données temporaires" > /mytmpfs/fichier.txt
```

- Cela écrit le texte "Données temporaires" dans le fichier `fichier.txt` situé dans le volume _tmpfs_.

3. **Vérifier la persistance des données après redémarrage du conteneur :**
   - On redémarre le conteneur en utilisant la commande :

```bash
 docker restart mon-conteneur-tmpfs
```

- Une fois le conteneur redémarré, on accéde à nouveau à l'intérieur du conteneur et vérifiez si les données existent toujours :

```bash
 docker exec -it mon-conteneur-tmpfs bash
 ls /mytmpfs
```

- **Réponse** : Le fichier `fichier.txt` ne sera plus présent car les volumes _tmpfs_ ne sont pas persistants. Toutes les données sont perdues à l'arrêt ou au redémarrage du conteneur.

4. **Comparer les performances avec un volume standard :**
   - Pour comparer, on lance un nouveau conteneur avec un volume standard (persistant) :

```bash
 docker run --name mon-conteneur-volume -v mon-volume:/mydata -d nginx
 docker exec -it mon-conteneur-volume bash
 echo "Données persistantes" > /mydata/fichier.txt
```

- On redémarre ce conteneur :

```bash
 docker restart mon-conteneur-volume
```

- Après redémarrage, on vérifie la persistance des données dans le volume standard :

```bash
 docker exec -it mon-conteneur-volume bash
 ls /mydata
```

- **Réponse** : Contrairement aux volumes _tmpfs_, les volumes standards conservent les données après le redémarrage. Le fichier `fichier.txt` sera toujours présent dans ce cas.

#### Conclusion :

- Les volumes _tmpfs_ sont rapides et idéaux pour stocker des données temporaires ou sensibles, mais ils ne persistent pas après l'arrêt ou le redémarrage du conteneur.
- Les volumes standards offrent une solution de stockage persistant, mais ils sont plus lents comparés aux volumes _tmpfs_.

# 1.4 Défi : Sauvegarde et restauration de volumes

1. **Créer un script bash pour sauvegarder le contenu d'un volume dans un fichier tar.gz :**
   - On créer un fichier de script nommé `sauvegarde_volume.sh` avec le contenu suivant :

```bash
 #!/bin/bash
 VOLUME_NAME=$1
 BACKUP_PATH=$2

 if [ -z "$VOLUME_NAME" ] || [ -z "$BACKUP_PATH" ]; then
     echo "Usage: $0 <nom_du_volume> <chemin_de_sauvegarde>"
     exit 1
 fi

 docker run --rm -v $VOLUME_NAME:/volume -v $BACKUP_PATH:/backup busybox \
     tar czf /backup/backup.tar.gz -C /volume .
```

- **Explication** :
  - Ce script prend en paramètres le nom du volume Docker et l'emplacement où on veux sauvegarder le fichier `backup.tar.gz`.
  - Il lance un conteneur `busybox` pour créer une archive compressée (`tar.gz`) du contenu du volume.

2. **Créer un second script pour restaurer un volume à partir d'une sauvegarde :**
   - On créer un fichier de script nommé `restauration_volume.sh` avec le contenu suivant :

```bash
 #!/bin/bash
 VOLUME_NAME=$1
 BACKUP_FILE=$2

 if [ -z "$VOLUME_NAME" ] || [ -z "$BACKUP_FILE" ]; then
     echo "Usage: $0 <nom_du_volume> <fichier_de_sauvegarde>"
     exit 1
 fi

 docker run --rm -v $VOLUME_NAME:/volume -v $BACKUP_FILE:/backup/backup.tar.gz busybox \
     tar xzf /backup/backup.tar.gz -C /volume
```

- **Explication** :
  - Ce script prend en paramètres le nom du volume Docker et le fichier de sauvegarde (`backup.tar.gz`).
  - Il lance un conteneur `busybox` pour extraire les données du fichier de sauvegarde vers le volume Docker.

3. **Tester le processus de sauvegarde et restauration avec des données réelles :**

   - **Sauvegarde :** On Lance un conteneur Docker et on créer un fichier à l'intérieur du volume :

```bash
 docker run -d --name test-container -v mon-volume:/data busybox sh -c "echo 'Données importantes' > /data/fichier.txt"
```

- Ensuite, sauvegardez le volume `mon-volume` en exécutant le script de sauvegarde :

```bash
./sauvegarde_volume.sh mon-volume ../save
```

- Cela créera un fichier `backup.tar.gz` dans le répertoire de sauvegarde spécifié.

- **Restauration :** Pour tester la restauration, on supprime le volume ou créer-en un nouveau, puis restaurez les données :

```bash
docker volume rm mon-volume
docker volume create mon-volume
./restauration_volume.sh mon-volume ../save/backup.tar.gz
```

- On Vérifie que les données ont été correctement restaurées en accédant au volume restauré :

```bash
docker run --rm -v mon-volume:/data busybox cat /data/fichier.txt
```

- On doit avoir le contenu original du fichier, à savoir "Données importantes".

#### Conclusion :

- Ces scripts permettent d'automatiser la sauvegarde et la restauration de volumes Docker.
- On peut utiliser cette méthode pour préserver des données importantes ou transférer des volumes entre différents environnements Docker.

# 1.5 Discussion et bonnes pratiques

#### 1. Quand utiliser chaque type de volume ?

1. **Volumes nommés :**

   - Idéal pour les environnements de production où on souhaite une gestion des données indépendante du système de fichiers hôte.
   - Utile lorsque plusieurs conteneurs doivent partager des données (par exemple, une base de données partagée entre plusieurs services).
   - Recommandé lorsqu'on a pas besoin d'un accès direct aux fichiers de l'hôte.

2. **Bind mounts :**

   - Utilisés principalement en développement pour travailler avec des fichiers de l'hôte en temps réel (modification de code, tests, etc.).
   - Pratique lorsqu'on doit accéder directement aux fichiers de l'hôte ou interagir avec eux.
   - Moins recommandé en production en raison de l'exposition directe des fichiers hôtes, ce qui peut poser des problèmes de sécurité.

3. **Tmpfs :**
   - Idéal pour stocker des données temporaires qui n'ont pas besoin d'être persistées (par exemple, des fichiers temporaires ou de cache).
   - Utilisé lorsqu'on a besoin de rapidité, car les données sont stockées en mémoire.
   - À éviter pour des données critiques ou sensibles qui nécessitent d’être sauvegardées.

#### 2. Sécurité des volumes et des données :

1. **Accès en lecture seule :**

   - Lorsqu'on monte un volume ou un _bind mount_, le mieux est d'utiliser l'option `:ro` (lecture seule) si les données ne doivent pas être modifiées dans le conteneur. Cela réduit le risque d'altération accidentelle des fichiers.

2. **Protection des volumes sensibles :**

   - Si on manipule des données sensibles, comme des clés API ou des informations d'authentification, on doit s'assurer de bien configurer les permissions et d'utiliser des _secrets_ Docker plutôt que de les stocker directement dans les volumes.

3. **Utilisation de SELinux ou AppArmor :**
   - Pour les environnements Linux avec des mécanismes de sécurité renforcés comme SELinux ou AppArmor, on configure les volumes avec les bonnes options (`:z`, `:Z`) afin d'assurer une bonne isolation et des permissions sécurisées.

#### 3. Gestion des volumes dans un environnement de production :

1. **Surveillance des volumes :**

   - Pour Surveiller régulièrement l'utilisation de l'espace disque des volumes, surtout dans des environnements à forte charge. On peut des outils comme `docker system df` pour surveiller la taille des volumes.

2. **Nettoyage des volumes inutilisés :**

   - Docker ne supprime pas automatiquement les volumes non utilisés après la suppression d'un conteneur. il existe la commande `docker volume prune` pour nettoyer les volumes inutilisés et éviter une accumulation inutile de données.

3. **Sauvegarde des volumes :**
   - Nous pouvons mettre en place un mécanisme de sauvegarde et de restauration des volumes en production. Les volumes peuvent contenir des données critiques qui doivent être protégées contre la perte.

#### Conclusion :

- Le choix du type de volume dépend du contexte d’utilisation (développement, production, nature des données).
- La sécurité des volumes, notamment dans des environnements multi-conteneurs ou avec des données sensibles, est primordiale.
- Des stratégies de sauvegarde et de nettoyage régulier des volumes doivent être mises en place en production pour éviter les pertes de données et les surcharges.
