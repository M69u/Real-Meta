from fastapi import FastAPI, UploadFile, File
from sqlalchemy import text
from src.db import SessionLocal
from src.models_utils import get_embedding_from_bytes
import numpy as np

app = FastAPI(title="ArtScope API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://museum-app-landing-ts5cvBYvhsa.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/scan/")
async def scan_artwork(file: UploadFile = File(...)):
    db = SessionLocal()
    try:
        # Step 1: Read and embed the uploaded image
        image_bytes = await file.read()
        query_vec = np.array(get_embedding_from_bytes(image_bytes))

        # Step 2: Fetch all artworks and embeddings
        rows = db.execute(
            text("SELECT id, name, artist, description, embedding FROM artworks")
        ).fetchall()

        if not rows:
            return {"message": "No artworks found in database"}

        # Step 3: Compute cosine similarity in Python
        similarities = []
        for row in rows:
            db_embedding = np.array(row.embedding, dtype=np.float32)
            sim = np.dot(query_vec, db_embedding) / (
                np.linalg.norm(query_vec) * np.linalg.norm(db_embedding)
            )
            similarities.append((row, sim))

        # Step 4: Pick the best match
        best_match, best_score = max(similarities, key=lambda x: x[1])

        return {
            "artwork_id": best_match.id,
            "name": best_match.name,
            "artist": best_match.artist,
            "description": best_match.description,
            "similarity": round(float(best_score), 4),
        }

    except Exception as e:
        return {"error": str(e)}

    finally:
        db.close()
