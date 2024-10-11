### 2.1 Introduction aux secrets Docker

#### Pourquoi utiliser les secrets Docker ?

1. **Sécurité des données sensibles :**

   - Stocker des informations sensibles directement dans les fichiers de configuration ou les variables d'environnement pose des risques de sécurité, car elles pourraient être exposées accidentellement ou être accessibles par des utilisateurs non autorisés.
   - Les secrets Docker garantissent que ces informations ne sont pas visibles ou accessibles directement via les commandes classiques comme `docker inspect` ou dans les logs des conteneurs.

2. **Gestion centralisée des secrets :**

   - Les secrets Docker permettent de gérer les données sensibles de manière centralisée, et de les distribuer uniquement aux conteneurs qui en ont besoin.
   - Cela évite de devoir inclure ces informations dans les images Docker, les fichiers `docker-compose.yml`, ou dans les volumes montés.

3. **Utilisation contrôlée des secrets :**
   - Les secrets Docker ne sont montés que dans les conteneurs qui en ont explicitement besoin, et leur accès est restreint au processus dans le conteneur. Une fois qu'un conteneur est arrêté, les secrets sont automatiquement supprimés.

#### Fonctionnement des secrets Docker

1. **Création d'un secret :**

   - On peut créer un secret Docker à partir d'un fichier ou directement depuis le terminal. Par exemple, pour créer un secret nommé `ma-cle-api` depuis un fichier `key.txt`, vous utiliserez la commande suivante :

   ```bash
   docker secret create ma-cle-api key.txt
   ```

   - Cela enregistre le contenu du fichier `key.txt` en tant que secret dans Docker, et il sera disponible pour les services qui en auront besoin.

2. **Utilisation des secrets dans un service :**

   - Pour utiliser un secret dans un service Docker, On doit spécifier le secret lors de la création du service. Par exemple, si vous avez un service qui nécessite le secret `ma-cle-api`, vous pouvez l’ajouter au service comme ceci :

   ```bash
   docker service create --name mon-service --secret ma-cle-api nginx
   ```

   - Le secret `ma-cle-api` sera monté dans le conteneur sous la forme d'un fichier dans le répertoire `/run/secrets/ma-cle-api`, et accessible uniquement par ce service.

3. **Accès restreint aux secrets :**
   - Les secrets ne sont pas visibles dans les variables d'environnement ou dans les commandes comme `docker inspect`. Ils sont seulement accessibles à l'intérieur du conteneur via le système de fichiers sécurisé `/run/secrets/`.

#### Conclusion :

- Docker secrets est un outil puissant pour sécuriser la gestion des données sensibles dans vos applications conteneurisées.
- Ils permettent de protéger les informations confidentielles sans les inclure directement dans les images, les fichiers de configuration ou les volumes Docker.
- Leur utilisation est particulièrement adaptée pour les environnements multi-conteneurs, où les secrets peuvent être distribués de manière sécurisée uniquement aux services qui en ont besoin.

### 2.2 Exercice : Création et utilisation de secrets (25 min)

1. **Créer un secret Docker :**

   - On créer un fichier texte qui contient des informations sensibles, par exemple un mot de passe ou une clé API. Par exemple : `secret.txt`

   - Ensuite, créez un secret Docker à partir de ce fichier :

   ```bash
   docker secret create mon-secret secret.txt
   ```

   - **Explication** :
     - `docker secret create` est la commande utilisée pour créer un secret. Ici, le secret s’appelle `mon-secret` et son contenu provient du fichier `secret.txt`.
     - Le secret est désormais stocké dans Docker, prêt à être utilisé par un service.

2. **Utiliser le secret dans un conteneur :**

   - Docker secrets est conçu pour fonctionner principalement avec Docker, mais vous pouvez également tester son utilisation dans un service.

   - Ensuite, on créer un Docker qui utilise ce secret :

   docker run create --name ma-bdd --secret mon-secret postgres

   - **Explication** :
     - Cette commande crée un Docker appelé `ma-bdd` basé sur l'image `nginx`, et lui associe le secret `mon-secret`.
     - À l'intérieur du conteneur, le secret sera monté comme un fichier dans le répertoire `/run/secrets/`.

3. **Vérifier que le secret est correctement monté dans le conteneur :**

   - Une fois que le service est lancé, on peut vérifier que le secret est bien accessible dans le conteneur en listant les fichiers dans le répertoire `/run/secrets/`. Pour cela, récupérez l'ID du conteneur en cours d'exécution avec `docker ps`, puis exécutez une commande dans le conteneur :

   ```bash
   docker exec -it <container_id> ls /run/secrets
   ```

   - On devrait voir le fichier `mon-secret` dans ce répertoire.

   - Pour lire le contenu du secret, on peut utiliser la commande suivante dans le conteneur :

   ```bash
   docker exec -it <container_id> cat /run/secrets/mon-secret
   ```

   - Cela affichera le contenu du secret (ici, "ma-cle-secrete").

4. **Vérifier que le secret n'est pas visible via les commandes Docker classiques :**
   - Un des avantages des secrets Docker est qu'ils ne sont pas visibles via des commandes comme `docker inspect`. On peut le tester en exécutant la commande suivante pour inspecter le conteneur :
   ```bash
   docker inspect <container_id>
   ```
   - **Réponse** : Le secret ne doit pas apparaître dans la sortie de cette commande, car Docker sécurise ces informations pour éviter leur exposition.

#### Conclusion :

- Les secrets Docker sont accessibles uniquement à l'intérieur des conteneurs qui en ont besoin et ne sont pas exposés via les commandes Docker classiques comme `docker inspect` ou dans les variables d'environnement.
- L'utilisation de Docker secrets permet de sécuriser les informations sensibles dans vos conteneurs.

### 2.3 Exercice : Gestion des secrets avec Docker Compose (25 min)

1. **Créer le secret Docker pour la base de données :**

   - Tout d’abord, on crée un fichier texte contenant le mot de passe de la base de données, par exemple :

   ```bash
   echo "mot-de-passe-bdd" > db_password.txt
   ```

   - Ensuite, on crée le secret Docker à partir de ce fichier :

   ```bash
   docker secret create db_password db_password.txt
   ```

   - **Explication** :
     - Le secret `db_password` est créé avec la commande `docker secret create` à partir du contenu du fichier `db_password.txt`.

2. **Créer un fichier Docker Compose :**

   - Crée un fichier `docker-compose.yml` qui définit un service web et un service de base de données (par exemple, MySQL). Ce fichier va utiliser le secret pour permettre au service web de se connecter à la base de données. Voici un exemple de fichier `docker-compose.yml` :

   ```yml
   services:
   web:
    build:
      context: ./back-end-todo
    ports:
      - "4000:3000"
    secrets:
      - db_password
    environment:
      DATABASE_HOST: db
      DATABASE_USER: root
      DATABASE_PASSWORD: /run/secrets/db_password
    depends_on:
      - db
    networks:
      - bdd

   db:
   image: mysql:latest
   environment:
       MYSQL_ROOT_PASSWORD_FILE: /run/secrets/db_password
   secrets:
       - db_password
   volumes:
       - db_data:/var/lib/mysql

   secrets:
    db_password:
       external: true

   volumes:
    db_data:
   ```

   - **Explication** :
     - Le service `web` utilise une image nginx et se connecte à la base de données MySQL en récupérant le mot de passe dans le fichier monté `/run/secrets/db_password`.
     - Le service `db` (la base de données MySQL) est configuré pour utiliser le même secret pour le mot de passe administrateur de la base de données (`MYSQL_ROOT_PASSWORD_FILE`).
     - La section `secrets` sous chaque service indique que le secret `db_password` doit être monté dans ces services.
     - Dans la section `secrets` globale, `external: true` signifie que le secret a été créé en dehors de Docker Compose et sera utilisé tel quel.

3. **Démarrer les services avec Docker Compose :**

   - Une fois que le fichier `docker-compose.yml` est prêt, démarre les services avec Docker Compose :

   ```bash
   docker compose up --build
   ```

   - **Explication** :
     - Cette commande démarre les services `web` et `db`, en s'assurant que le mot de passe de la base de données est correctement passé via le secret.

4. **Vérifier que le secret est monté et utilisé dans les services :**

   - Pour vérifier que le secret est bien monté dans le conteneur web, récupère l’ID du conteneur web avec `docker ps`, puis liste les fichiers dans le répertoire `/run/secrets` :

   docker exec -it <container_id_web> ls /run/secrets

   - On devrait voir le fichier `db_password`. Pour vérifier son contenu, exécute la commande suivante :

   ```bash
   docker exec -it <container_id_web> cat /run/secrets/db_password
   ```

   - Cela affichera le contenu du secret (le mot de passe de la base de données).

#### Conclusion :

- Les secrets sont montés dans les conteneurs et accessibles uniquement par les services qui en ont besoin, tout en restant protégés des commandes Docker classiques.
