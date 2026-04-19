# ArchLens

Photograph a whiteboard architecture diagram. Get instant AI analysis, threat modeling, and expert feedback.

Built at HackKU 2026.

---

## What it does

- **Scan** — take a photo of any whiteboard architecture diagram
- **Extract** — Gemini Vision parses nodes, edges, zones, and protocols
- **Analyze** — get architectural feedback, a plain-English summary, and a confidence score
- **Improve** — one tap to have Gemini refactor the architecture based on its own feedback
- **Threat model** — STRIDE overlay highlights security risks on every node and edge
- **Ask** — ask free-form questions about the diagram ("where is the single point of failure?")
- **Share** — generate a public link so stakeholders can view the diagram without the app
- **History** — all past scans stored in MongoDB Atlas with full-text search

---

## Stack

| Layer          | Tech                            |
| -------------- | ------------------------------- |
| Mobile / Web   | Expo (React Native)             |
| Diagram canvas | ReactFlow (rendered in WebView) |
| Backend        | FastAPI                         |
| AI             | Gemini 2.5 Flash                |
| Database       | MongoDB Atlas + Beanie ODM      |
| Image storage  | Cloudinary                      |

---

## Prerequisites

- Node 18+
- Python 3.11+
- MongoDB Atlas cluster
- Gemini API key
- Cloudinary account (free tier works)

---

## Setup

### 1. Clone

```bash
git clone https://github.com/aepii/ArchLens.git
cd archlens
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create `backend/.env`:

```
GEMINI_API_KEY=your_gemini_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the server:

```bash
uvicorn main:app --reload
```

API runs at `http://localhost:8000`.

### 3. Frontend

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `w` for browser.

### 4. Atlas Search index (for history search)

In the MongoDB Atlas UI, go to your cluster → **Search** → **Create Search Index** → **JSON Editor**, select the `architectures` collection, and paste:

```json
{
  "mappings": {
    "dynamic": false,
    "fields": {
      "summary": [{ "type": "string" }],
      "feedback": [{ "type": "string" }],
      "nodes": {
        "type": "document",
        "fields": {
          "label": [{ "type": "string" }],
          "type": [{ "type": "string" }]
        }
      },
      "zones": {
        "type": "document",
        "fields": { "label": [{ "type": "string" }] }
      }
    }
  }
}
```

Name it `default` and save. Takes ~1 minute to build.

---

## Environment variables reference

| Variable                | Where   | Description             |
| ----------------------- | ------- | ----------------------- |
| `GEMINI_API_KEY`        | backend | Google AI Studio key    |
| `MONGODB_URI`           | backend | Atlas connection string |
| `CLOUDINARY_CLOUD_NAME` | backend | Cloudinary cloud name   |
| `CLOUDINARY_API_KEY`    | backend | Cloudinary API key      |
| `CLOUDINARY_API_SECRET` | backend | Cloudinary API secret   |
