# 🕹️ Gemini Game Lab

**A real-time AI web game generator powered by Google Cloud & Gemini 2.5 Flash.**

This project is an interactive demo that showcases the ability of the Gemini AI to generate complete, playable HTML5 web games on the fly from simple, natural language prompts. It also allows users to experience and compare the results with high-quality, pre-built retro games.

---

## ✨ Features

* **🤖 Real-time AI Game Generation**: Simply type a prompt like "a game to break bricks by hitting a ball," and Gemini will generate the full code for the game, ready to play instantly.
* **🎮 High-Quality Pre-built Games**: Load and enjoy 5 high-quality retro games (hosted on GCS) to compare with the AI-generated ones.
* **📚 Dynamic Game Specs**: When selecting a pre-built game, you can view a detailed prompt example (a "game requirement document") that could be used to create that game.
* **💡 Gemini Storytelling**: While the AI generates a game, the storytelling panel provides real-time fun facts and history about the requested game genre.
* **🌐 Cloud-Native Architecture**: The entire infrastructure is serverless, automatically deployed and scaled using Google Cloud Run for the backend and Cloud Storage for the frontend.
* **🎨 Google Material 3 Design**: The UI is designed with Google's latest design system for a clean, intuitive, and beautiful user experience.

---

## 📂 Project Structure

The repository contains the core application shell. The pre-built game files are fetched from a separate Google Cloud Storage bucket during runtime.
```
gemini-game-lab/
├── deploy.sh               # All-in-one script for a full deployment
├── README.md               # This project description file
├── .gitignore              # Specifies intentionally untracked files
└── src/
├── backend/            # Python backend for Cloud Run
│   ├── app.py
│   ├── Dockerfile
│   └── requirements.txt
└── frontend/           # Static assets for Cloud Storage
├── index.html
└── assets/
├── main.js
└── style.css
```
> **Note:** The pre-built game files (`game-htmls/`) and their requirement documents (`game-docs/`) are **not** included in this repository. They are expected to be pre-populated in the GCS bucket specified in `deploy.sh`.

---

## 🚀 Setup & Deployment

Follow these steps in a Google Cloud Shell or any environment with the Google Cloud SDK installed.

1.  **Clone the Repository**:
    ```bash
    git clone [https://github.com/ldu1225/gemini-game-lab.git](https://github.com/ldu1225/gemini-game-lab.git)
    cd gemini-game-lab
    ```

2.  **Set Your Project ID**: Ensure `gcloud` is configured to use your GCP project.
    ```bash
    gcloud config set project [YOUR_GCP_PROJECT_ID]
    ```

3.  **Grant Execute Permissions**:
    ```bash
    chmod +x deploy.sh
    ```

4.  **Run the Deployment Script**: The script will automatically deploy the backend and frontend. This may take about 5 minutes.
    ```bash
    ./deploy.sh
    ```

5.  **Access the URL**: Once the script completes, it will output the final URL. Open this UR
