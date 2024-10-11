### 5. Projet final (1h)

```yml
services:
  backend:
    build:
      context: ./backend
    networks:
      - backend-net
    environment:
      NODE_ENV: production

  frontend:
    build:
      context: ./frontend
    networks:
      - frontend-net

  postgres:
    image: postgres:alpine
    networks:
      - backend-net
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:alpine
    networks:
      - backend-net

networks:
  frontend-net:
  backend-net:

volumes:
  pgdata:
  redisdata:
```

Démarrez l'application en mode développement :

```bash
docker-compose -f docker-compose.dev.yml up --build
```

Démarrez l'application en mode production :

```bash
docker-compose -f docker-compose.prod.yml up --build
```
