# Backend Express pour pfpc_vbg

## Installation

```
cd backend
npm install
```

## Lancement du serveur

En développement (avec rechargement auto) :
```
npm run dev
```

En production :
```
npm start
```

Le serveur écoute par défaut sur le port 5000 (modifiable dans `.env`).

## Exemple de route

- GET `/api/hello` → `{ message: "Hello from backend!" }`
