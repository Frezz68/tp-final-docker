# 3. Réseaux Docker

### 3.1 Introduction aux réseaux Docker (15 min)

#### 1. Réseau **Bridge** :

Le réseau _bridge_ est le type de réseau par défaut utilisé par Docker lorsqu'un conteneur est créé sans spécification d'un réseau personnalisé. Docker crée un pont réseau isolé sur la machine hôte, et les conteneurs connectés à ce réseau peuvent communiquer entre eux.

- **Caractéristiques :**
  - Les conteneurs peuvent communiquer entre eux via des adresses IP privées.
  - Si un conteneur doit être accessible depuis l'extérieur, il faut utiliser la configuration du _port mapping_ pour exposer les ports.
- **Cas d'utilisation :**

  - Idéal pour les environnements de développement et de tests où les conteneurs doivent être isolés les uns des autres, mais avoir la possibilité de communiquer au sein d'un même réseau interne.

#### 2. Réseau **Host** :

Le réseau _host_ supprime la couche d'abstraction réseau habituelle en permettant au conteneur d'utiliser directement la pile réseau de la machine hôte. Le conteneur partage alors l'adresse IP de l'hôte, ce qui peut entraîner des conflits de ports si plusieurs conteneurs essaient d'exposer le même port.

- **Caractéristiques :**

  - Le conteneur utilise directement l'interface réseau de la machine hôte.
  - Il n'y a pas d'isolation entre le conteneur et l'hôte au niveau réseau.
  - Performances légèrement supérieures par rapport aux autres types de réseaux puisqu'il n'y a pas de translation d'adresse réseau (NAT).

- **Cas d'utilisation :**

  - Utilisé lorsque les performances réseau sont critiques ou lorsque les conteneurs doivent avoir exactement la même adresse IP que l'hôte, comme dans le cas d'applications qui nécessitent un accès réseau ultra-rapide.

#### 3. Réseau **Overlay** :

Le réseau _overlay_ est utilisé principalement dans les environnements Docker pour connecter des conteneurs qui s'exécutent sur différents hôtes dans un cluster. Docker crée un réseau virtuel qui superpose plusieurs hôtes, permettant à des conteneurs sur différents nœuds d'un cluster de communiquer entre eux de manière transparente.

- **Caractéristiques :**

  - Utilisé pour la communication entre différents hôtes dans un cluster Docker.
  - Les conteneurs peuvent communiquer avec des services sur plusieurs nœuds comme s'ils étaient sur un même réseau local.
  - Peut être sécurisé avec le chiffrement de trafic.

- **Cas d'utilisation :**

  - Très utilisé dans les environnements de production où Docker Swarm ou Kubernetes est déployé pour permettre la communication entre services multi-nœuds.

#### 4. Réseau **Macvlan** :

Le réseau _macvlan_ permet d'assigner directement une adresse MAC et une adresse IP distincte à chaque conteneur, comme s'il s'agissait d'une interface réseau physique connectée directement à l'hôte. Cela permet aux conteneurs d'apparaître sur le réseau physique avec leur propre identité, distincte de celle de l'hôte.

- **Caractéristiques :**

  - Les conteneurs reçoivent une adresse MAC unique et peuvent être traités comme des appareils individuels sur le réseau physique.
  - Nécessite une configuration réseau plus complexe, surtout au niveau de l'hôte et du réseau local.

- **Cas d'utilisation :**

  - Utile dans des cas où les conteneurs doivent être traités comme des dispositifs individuels sur le réseau et doivent pouvoir communiquer directement avec d'autres dispositifs réseau sans passer par l'hôte.
    ""

#### Conclusion :

- Le choix du type de réseau dépend du contexte et des besoins de l'application.
- Les réseaux _bridge_ et _host_ sont couramment utilisés dans les environnements locaux ou de développement.
- Les réseaux _overlay_ et _macvlan_ sont plus adaptés pour des environnements distribués, ou pour des besoins de réseau complexes et spécifiques.

### 3.2 Exercice : Réseau bridge personnalisé (20 min)

1. **Créer un réseau bridge personnalisé :**

   - Utilise la commande suivante pour créer un réseau _bridge_ personnalisé appelé `mon_reseau_perso` :

   ```bash
   docker network create --driver bridge mon_reseau_perso
   ```

   - **Explication** :
     - La commande `docker network create` crée un nouveau réseau Docker. L'option `--driver bridge` spécifie que le type de réseau est _bridge_.
     - Ce réseau est isolé et les conteneurs qui y seront attachés pourront communiquer entre eux, mais pas avec des conteneurs sur d'autres réseaux sans configuration supplémentaire.

2. **Lancer deux conteneurs sur ce réseau :**

   - Maintenant, lance deux conteneurs sur le réseau _bridge_ personnalisé. On utilise l'image `alpine` avec la commande `ping` installée pour tester la connectivité entre eux. Voici les commandes pour lancer les deux conteneurs :

   ```bash
   docker run -dit --name conteneur1 --network mon_reseau_perso alpine sh

   docker run -dit --name conteneur2 --network mon_reseau_perso alpine sh
   ```

   - **Explication** :
     - `docker run -dit` démarre un conteneur en mode détaché (`-d`), interactif (`-i`), avec un terminal (`-t`).
     - L'option `--network mon_reseau_perso` attache chaque conteneur au réseau personnalisé.
     - Les conteneurs sont nommés `conteneur1` et `conteneur2` pour les identifier facilement.

3. **Tester la communication entre les deux conteneurs :**

   - Pour tester la communication, connecte-toi au premier conteneur (`conteneur1`) et essaie de _pinger_ le second conteneur (`conteneur2`) en utilisant son nom :

   ```bash
   docker exec -it conteneur1 sh

   ping conteneur2
   ```

   - **Explication** :
     - `docker exec -it conteneur1 sh` permet d'exécuter une commande interactive dans le conteneur `conteneur1`. On se retrouves dans le shell du conteneur.
     - La commande `ping conteneur2` envoie des paquets au conteneur `conteneur2` pour vérifier que la communication fonctionne.
     - Docker résout automatiquement les noms des conteneurs à leurs adresses IP sur le réseau _bridge_ personnalisé.

4. **Tester la communication depuis le deuxième conteneur :**

   - Tu peux également tester la communication dans l'autre sens en te connectant à `conteneur2` et en pingant `conteneur1` :

   ```bash
   docker exec -it conteneur2 sh

   ping conteneur1
   ```

   - De la même manière, tu devrais recevoir des réponses du conteneur `conteneur1`, confirmant que la communication fonctionne dans les deux sens.

#### Conclusion :

- Tu as appris à créer un réseau _bridge_ personnalisé avec Docker.
- Deux conteneurs ont été lancés sur ce réseau, et tu as testé avec succès leur communication en utilisant leurs noms.
- Le réseau _bridge_ personnalisé permet une isolation réseau tout en permettant la communication interne entre les conteneurs qui y sont attachés.

### 3.3 Exercice : Réseau overlay (25 min)

1. **Initialiser un Swarm Docker :**

   - Avant de pouvoir utiliser des réseaux _overlay_, Docker Swarm doit être activé. Pour cela, on exécute la commande suivante afin d'initialiser un Swarm sur ta machine locale :

   ```bash
   docker swarm init

   ```

2. **Créer un réseau overlay :**

   - Une fois que le Swarm est initialisé, on créer un réseau _overlay_ pour permettre aux services de communiquer entre plusieurs nœuds (si nécessaire). Utilise la commande suivante pour créer un réseau _overlay_ appelé `mon_reseau_overlay` :

   ```bash
   docker network create --driver overlay mon_reseau_overlay
   ```

   - **Explication** :
     - `docker network create --driver overlay` crée un réseau Docker de type _overlay_, qui permet la communication entre des services répartis sur plusieurs nœuds dans le Swarm.
     - Ce réseau est essentiel pour permettre aux services distribués d'interagir comme s'ils étaient sur le même réseau local, même s'ils s'exécutent sur des hôtes différents.

3. **Déployer un service en utilisant ce réseau :**

   - Maintenant que le réseau _overlay_ est créé, déployons un service qui utilise ce réseau pour ses communications. Par exemple, déployons un service Nginx qui sera connecté au réseau _overlay_ :

   ```bash
   docker service create --name mon-service-web --network mon_reseau_overlay -p 8080:80 nginx
   ```

   - **Explication** :
     - `docker service create` permet de déployer un service dans le Swarm.
     - L'option `--network mon_reseau_overlay` indique que ce service sera connecté au réseau _overlay_ que tu viens de créer.
     - L'option `-p 8080:80` expose le port 80 du service Nginx sur le port 8080 de l'hôte pour y accéder via un navigateur ou une autre interface.

4. **Vérifier le bon fonctionnement du service :**

   - Une fois le service déployé, il faut vérifier qu'il est bien en cours d'exécution avec la commande suivante :

   ```bash
   docker service ls
   ```

   - Cela montrera une liste des services en cours d'exécution, y compris `mon-service-web`.

   - On peut également vérifier que le service est accessible en accédant à `http://localhost:8080` via un navigateur, où il y a la page d'accueil par défaut de Nginx.

#### Conclusion :

- Le réseau _overlay_ permet une communication sécurisée et efficace entre les services sur différents nœuds d'un cluster.
- Ce type de réseau est particulièrement utile dans les environnements de production où des services distribués doivent interagir entre eux sans compromettre l'isolation réseau.
