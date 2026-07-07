# OSSGPT Backend

API Node.js / Express pour OSSGPT, l'assistant IA de démonstration de l'Observatoire du Sahara et du Sahel.

## Installation

```bash
cd backend
npm install
cp .env.example .env
```

## Configuration

Éditer le fichier `.env` :

| Variable | Défaut | Description |
|---|---|---|
| `PORT` | `8030` | Port du serveur |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | URL d'Ollama |
| `OLLAMA_CHAT_MODEL` | `llama3.2` | Modèle de chat |
| `OLLAMA_EMBED_MODEL` | `nomic-embed-text` | Modèle d'embeddings |
| `DOCUMENTS_DIR` | `./documents` | Dossier des documents |
| `INDEX_PATH` | `./data/index.json` | Fichier d'index |

## Utilisation

```bash
# Démarrer le serveur
npm start

# Mode développement (auto-reload)
npm run dev
```

## API

| Méthode | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Vérification du service |
| `POST` | `/api/chat` | Poser une question |
| `GET` | `/api/documents` | Liste des documents |
| `POST` | `/api/index` | Indexer les documents |
