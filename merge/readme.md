# 4. Merge de fichiers Docker Compose

### 4.1 Introduction au merge de fichiers Compose

#### Utilité du merge de fichiers Compose

1. **Séparer les configurations de base et les environnements spécifiques :**

   - Un des principaux avantages du _merge_ est de pouvoir séparer la configuration de base de l’application (comme les services essentiels) et les configurations spécifiques à un environnement (comme les variables d’environnement ou les options de déploiement).

2. **Gestion des environnements multiples :**

   - Le _merge_ de fichiers Compose permet de gérer des environnements multiples, comme le développement, le test, et la production, tout en réutilisant la même base de services. Plutôt que de dupliquer le fichier Compose entier, ou on peut définir les différences dans des fichiers complémentaires.

3. **Ajout d'extensions ou de services temporaires :**

   - Le _merge_ de fichiers Compose est aussi utile lorsqu'il faut ajouter des services ou des extensions temporaires à une configuration de base. Par exemple, pour des tests ou des débogages, tu peux définir des fichiers complémentaires avec des outils ou des services supplémentaires sans modifier la configuration de base.

4. **Optimisation des workflows CI/CD :**
   - Dans les pipelines CI/CD (intégration et déploiement continus), le _merge_ de fichiers Compose permet d'utiliser un fichier de base pour définir l'application, puis de superposer des fichiers spécifiques pour tester ou déployer des variantes (par exemple, en ajoutant des outils de monitoring ou de tests).

#### Cas d'usage du merge de fichiers Compose

1. **Développement et production :**

   - On peut avoir un fichier `docker-compose.yml` pour définir les services de base, comme une application web et une base de données, et un fichier `docker-compose.override.yml` pour ajouter des configurations spécifiques à l’environnement de développement (comme les montages de fichiers locaux ou des variables d’environnement de développement).
   - Pour l’environnement de production, on peut créer un fichier `docker-compose.prod.yml` pour définir des paramètres optimisés pour la production, comme les limites de ressources, les réseaux spécifiques, ou la configuration de services supplémentaires (comme un serveur proxy).

2. **Extensions pour les tests :**

   - Si on veut ajouter des outils de tests à une configuration existante, tu peux créer un fichier `docker-compose.test.yml` et le _merger_ avec le fichier principal uniquement lors des tests.
   - Cela permet de maintenir une configuration propre pour la production, tout en ajoutant des services temporaires et spécifiques pour les environnements de tests.

3. **Orchestration de services complexes :**
   - Dans les applications complexes où plusieurs équipes travaillent sur différents services, on peut avoir un fichier Compose de base et permettre à chaque équipe de gérer ses propres fichiers complémentaires. Cela favorise une meilleure modularité et permet à chaque équipe d’apporter ses modifications sans toucher à la configuration de base.

#### Conclusion :

- Le _merge_ de fichiers Compose est un outil puissant pour gérer des configurations multi-environnements ou des extensions temporaires sans dupliquer inutilement les fichiers Compose.
- Il permet de maintenir un fichier principal simple et clair tout en superposant des fichiers spécifiques aux environnements ou aux cas d’usage, ce qui simplifie la gestion des projets et des déploiements.

### 4.2 Exercice : Merge simple (20 min)

1. **Créer un fichier `docker-compose.yml` de base :**

   - On crée un fichier `docker-compose.yml` qui définit une configuration simple pour un service Nginx :

   ```yml
   services:
     web:
       image: nginx
       ports:
         - "8080:80"
   ```

   - **Explication** :
     - Ce fichier définit un service `web` qui utilise l'image Nginx. Le service expose le port 80 du conteneur sur le port 8080 de la machine hôte.

2. **Créer un fichier `docker-compose.override.yml` :**

   - Ensuite, crée un fichier `docker-compose.override.yml` qui ajoute des modifications ou extensions à la configuration de base. Par exemple, on ajoute un volume pour monter un fichier HTML local dans le conteneur Nginx, ainsi qu'une variable d'environnement :

   ```yml
   services:
     web:
       volumes:
         - ./site:/usr/share/nginx/html
       environment:
         - ENV=development
   ```

   - **Explication** :
     - Ce fichier ajoute un volume local `./site` qui sera monté dans le répertoire `/usr/share/nginx/html` du conteneur Nginx. Cela permet de servir des fichiers HTML depuis un dossier local.
     - Il définit également une variable d'environnement `ENV=development` pour indiquer que le service est en mode développement.

3. **Combiner les fichiers et observer le résultat :**

   - Docker Compose fusionne automatiquement le fichier `docker-compose.override.yml` avec le fichier `docker-compose.yml` si aucun fichier n'est spécifié explicitement lors du démarrage des services. Pour voir le résultat de la combinaison des fichiers, lance la commande suivante :

   ```bash
   docker compose config
   ```

   - **Explication** :
     - La commande `docker-compose config` affiche la configuration résultante après avoir fusionné tous les fichiers. On devrait voir la configuration de base du service `web` avec l'ajout du volume et de la variable d'environnement provenant du fichier `docker-compose.override.yml`.

4. **Lancer les services avec la configuration fusionnée :**
   - Une fois que tu as vérifié que la fusion fonctionne correctement, tu peux lancer les services avec Docker Compose :
   ```bash
   docker-compose up -d
   ```
   - **Explication** :
     - Cette commande démarrera le service `web` en utilisant la configuration combinée des deux fichiers. Nginx servira les fichiers du répertoire local `./site`, et la variable d'environnement sera disponible à l'intérieur du conteneur.

#### Conclusion :

- Cette approche permet de garder les fichiers Compose modulaires et adaptés à différents environnements, comme le développement ou la production.

### 4.3 Exercice : Merge pour différents environnements (30 min)

1. **Créer un fichier `docker-compose.yml` de base :**

   - Crée un fichier `docker-compose.yml` qui définit une configuration de base pour une application web simple avec Nginx :

   ```yml
   services:
     web:
       image: nginx
       ports:
         - "80:80"
   ```

   - **Explication** :
     - Ce fichier de base définit un service web avec l'image Nginx, qui expose le port 80 pour servir une application web dans tous les environnements.

2. **Créer un fichier `docker-compose.dev.yml` pour l'environnement de développement :**

   - Crée un fichier `docker-compose.dev.yml` qui ajoute des configurations spécifiques pour l'environnement de développement :

   ```yml
   services:
     web:
       environment:
         - ENV=development
       volumes:
         - ./dev-site:/usr/share/nginx/html
   ```

   - **Explication** :
     - Ce fichier ajoute un volume local pour le développement (`./dev-site`) qui sera monté dans le répertoire HTML de Nginx, permettant de tester des changements en temps réel.
     - Il définit également la variable d'environnement `ENV=development`.

3. **Créer un fichier `docker-compose.test.yml` pour l'environnement de test :**

   - Crée un fichier `docker-compose.test.yml` qui ajoute des configurations pour l'environnement de test, notamment en ajoutant un service de base de données MySQL :

   ```yml
   services:
     web:
       environment:
         - ENV=test
       depends_on:
         - db
     db:
       image: mysql:latest
       environment:
         MYSQL_ROOT_PASSWORD: testpassword
   ```

   - **Explication** :
     - Ce fichier ajoute une variable d'environnement `ENV=test` et introduit un service MySQL pour les tests. Le service `web` dépend désormais du service `db`, simulant une architecture multi-services.

4. **Créer un fichier `docker-compose.prod.yml` pour l'environnement de production :**

   - Crée un fichier `docker-compose.prod.yml` qui contient des optimisations spécifiques pour la production, comme la limitation des ressources et l'utilisation de volumes persistants :

   ```yml
   services:
     web:
       environment:
         - ENV=production
       deploy:
         resources:
           limits:
             cpus: "0.5"
             memory: "512M"
       volumes:
         - /var/www/html:/usr/share/nginx/html
   ```

   - **Explication** :
     - Ce fichier définit des limites de ressources pour le service web en production (0,5 CPU et 512 Mo de mémoire) et utilise un volume persistant `/var/www/html` pour stocker les fichiers de production.

5. **Utiliser le merge pour déployer dans chaque environnement :**

   - Pour l'environnement de développement, on peut combiner le fichier de base avec le fichier `docker-compose.dev.yml` en exécutant la commande suivante :

   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml up -d
   ```

   - **Explication** :

     - Cette commande combine les configurations du fichier de base et du fichier spécifique au développement. Les changements en temps réel seront possibles grâce au montage du volume local.

   - Pour l'environnement de test, utilise la commande suivante pour inclure la configuration de test :

   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.test.yml up -d
   ```

   - **Explication** :

     - Ici, la configuration de base est fusionnée avec celle de l'environnement de test, incluant le service MySQL.

   - Pour l'environnement de production, déploie avec cette commande :

   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

   - **Explication** :
     - Cette commande fusionne les fichiers pour déployer l'application en production avec les optimisations de performance et le volume persistant pour les fichiers HTML.

6. **Vérifier les configurations dans chaque environnement :**

   - Pour voir la configuration finale après le _merge_ des fichiers, utilise la commande `docker-compose config` dans chaque environnement :

   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.dev.yml config
   docker-compose -f docker-compose.yml -f docker-compose.test.yml config
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml config
   ```

#### Conclusion :

- Cette approche permet d'adapter facilement les configurations sans dupliquer entièrement les fichiers Compose, tout en maintenant une base commune pour l'application.
- Le _merge_ de fichiers Compose est un outil puissant pour gérer les applications multi-environnements et déployer des services adaptés à chaque situation.
