# ArtScope 

**Problem Statement:**  
Enable museum visitors to instantly access rich, contextual information about artworks simply by scanning them — without login or installation.

## Module: Image Embedding Generator

This component uses **MobileNetV3** to convert artwork images into **vector embeddings** and store them in a **PostgreSQL database** for fast cosine similarity search.

### Setup Instructions

```bash
git clone https://github.com/M69u/Real-Meta.git
cd ArtScope
python -m venv venv
venv\Scripts\activate  
pip install -r requirements.txt
