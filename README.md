# OSSGPT

Assistant IA de démonstration pour l'**Observatoire du Sahara et du Sahel (OSS)**.

OSSGPT est une application web type ChatGPT qui répond aux questions des utilisateurs en
s'appuyant sur des documents publics via un système RAG (Retrieval-Augmented Generation)
alimenté par **Ollama** en local.

## Architecture

```
┌─────────────┐     ┌───────────┐     ┌──────────┐
│  Angular    │────▶│  Express  │────▶│  Ollama  │
│  Frontend   │     │  Backend  │     │  (local) │
└─────────────┘     └───────────┘     └──────────┘
                         │
                    ┌────┴────┐
                    │ /documents│
                    │ /data    │
                    └─────────┘
```

## Prérequis

- [Node.js](https://nodejs.org/) ≥ 18
- [Ollama](https://ollama.com/) ≥ 0.20

## Installation d'Ollama

```bash
# Installer Ollama : https://ollama.com/download

# Démarrer Ollama
ollama serve

# Télécharger les modèles
ollama pull llama3.2
ollama pull nomic-embed-text
```

## Installation du backend

```bash
cd backend
npm install
cp .env.example .env
```

Configurer le fichier `.env` si nécessaire (valeurs par défaut déjà adaptées).

## Installation du frontend

```bash
cd frontend
npm install
```

## Lancement

### 1. Démarrer Ollama (si pas déjà fait)

```bash
ollama serve
```

### 2. Démarrer le backend

```bash
cd backend
npm start
```

Le serveur écoute sur `http://localhost:8030`.

### 3. Indexer les documents

```bash
curl -X POST http://localhost:8030/api/index
```

### 4. Démarrer le frontend

```bash
cd frontend
npm start
```

Ouvrir `http://localhost:4200`.

## Utilisation

Posez une question dans l'interface OSSGPT. L'assistant répondra en français
en s'appuyant sur les documents indexés.

### Exemples de questions

- "Qu'est-ce que l'Observatoire du Sahara et du Sahel ?"
- "Quels sont les pays membres de l'OSS ?"
- "Quels sont les projets phares de l'OSS ?"
- "Où se trouve le siège de l'OSS ?"

## API du backend

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Vérification de l'état du serveur et de la connexion Ollama |
| `POST` | `/api/chat` | Envoie une question et reçoit une réponse |
| `GET` | `/api/documents` | Liste les documents disponibles |
| `POST` | `/api/index` | Indexe ou ré-indexe les documents |

### Exemple de requête `/api/chat`

```json
POST /api/chat
{
  "message": "Qu'est-ce que l'OSS ?"
}
```

Réponse :

```json
{
  "reply": "L'Observatoire du Sahara et du Sahel (OSS) est une organisation...",
  "sources": [
    { "name": "exemple.md", "score": "0.892" }
  ]
}
```

## Publication sur GitHub

```bash
# Créer un dépôt sur GitHub, puis :
git remote add origin https://github.com/<user>/OSSGPT.git
git push -u origin main
```

### Déploiement du frontend sur GitHub Pages

```bash
cd frontend
npm run build:ghpages
# Pousser le dossier dist/ sur la branche gh-pages
npx angular-cli-ghpages --dir=dist/frontend/browser
```

## Avertissement

Ne pas exposer directement Ollama au public sans protection. Le backend Express
fait office de proxy sécurisé. En production, ajouter une authentification et
utiliser HTTPS.

## Structure du projet

```
├── README.md
├── documents/            # Documents source (.md, .txt, .pdf, .docx)
├── data/                 # Index des embeddings (généré)
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js
│       ├── routes/
│       ├── services/
│       └── utils/
└── frontend/
    ├── package.json
    ├── angular.json
    └── src/
        └── app/
```

## Licence

MIT
