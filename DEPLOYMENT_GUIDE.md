# 🌐 DeepGuard — Complete Cloud Deployment Guide

This guide provides simple, step-by-step instructions to deploy your DeepGuard project to the web for **free**, with a live URL you can share with professors, recruiters, and interviewers.

---

## 🎯 Recommended Deployment Options

| Platform | Best For | Cost | RAM / Specs | Setup Time |
| :--- | :--- | :--- | :--- | :--- |
| **1. Render.com (Recommended)** | 1-Click Docker from GitHub | **Free** | 512MB RAM, Auto-HTTPS | ~4 mins |
| **2. Hugging Face Spaces** | AI/ML Showcase, Fast CPU | **Free** | **16 GB RAM**, 2 vCPUs | ~3 mins |
| **3. Railway.app** | High performance container | Free Trial | 8 GB RAM, high bandwidth | ~2 mins |
| **4. Docker Compose (VPS)** | AWS EC2 / DigitalOcean / Linode | Paid ($4-6/mo) | Full root control | ~5 mins |

---

## 🚀 Option 1: Deploy on Render.com (Easiest & Free)

Render lets you connect your GitHub repository directly and automatically builds the container using the included `Dockerfile`.

### Step-by-Step:
1. **Push your code to GitHub**:
   Your repository is already live at:
   `https://github.com/varshakolekar20/DeepFake_Project`

2. **Sign Up / Log In to Render**:
   - Go to [render.com](https://render.com/) and click **Sign in with GitHub**.

3. **Create a New Web Service**:
   - In the Render Dashboard, click **New +** (top right) $\rightarrow$ **Web Service**.
   - Select **Build and deploy from a Git repository** $\rightarrow$ Click **Next**.
   - Connect your GitHub repository: `varshakolekar20/DeepFake_Project`.

4. **Configure the Service Settings**:
   - **Name**: `deepguard-ai` (or any name you like)
   - **Region**: Choose the closest region (e.g., *Singapore*, *Frankfurt*, or *Oregon*)
   - **Branch**: `main`
   - **Runtime**: Select **Docker** (Render will automatically detect our multi-stage `Dockerfile`)
   - **Instance Type**: Select **Free** ($0 / month)

5. **Deploy**:
   - Click **Create Web Service** at the bottom of the page.
   - Render will automatically build the React frontend with Node.js and launch the FastAPI PyTorch server.
   - In 3 to 5 minutes, your live URL will be ready:
     `https://deepguard-ai.onrender.com`

> **Note on Free Tier**: Render spins down free containers after 15 minutes of inactivity. When you open the link after inactivity, the first request may take 30–50 seconds to wake up the server.

---

## 🤗 Option 2: Deploy on Hugging Face Spaces (Best for AI Projects)

Hugging Face Spaces offers **16 GB of RAM and 2 vCPUs completely free**, which is exceptionally fast for PyTorch neural network inference.

### Step-by-Step:
1. Go to [huggingface.co](https://huggingface.co/) and create a free account (or log in).
2. Click on your profile icon (top right) $\rightarrow$ **New Space**.
3. Fill in the details:
   - **Space Name**: `deepguard-deepfake-detector`
   - **License**: `mit`
   - **Select the Space SDK**: Choose **Docker** $\rightarrow$ **Blank**.
   - **Space hardware**: Select **Free (2 vCPU · 16 GB RAM)**.
   - **Visibility**: **Public**.
   - Click **Create Space**.
4. In the Space settings, copy the repository Git clone URL.
5. In your local terminal, add Hugging Face as a remote and push:
   ```bash
   git remote add hf https://huggingface.co/spaces/YOUR_USERNAME/deepguard-deepfake-detector
   git push hf main --force
   ```
   *Or connect your GitHub repository directly in the Space settings under "GitHub Integration".*
6. Hugging Face will automatically build your `Dockerfile` and give you a permanent live URL:
   `https://YOUR_USERNAME-deepguard-deepfake-detector.hf.space`

---

## 🚂 Option 3: Deploy on Railway.app

1. Go to [railway.app](https://railway.app/) and sign in with GitHub.
2. Click **New Project** $\rightarrow$ **Deploy from GitHub repo**.
3. Select `varshakolekar20/DeepFake_Project`.
4. Railway will automatically read `Dockerfile` and start building.
5. Once built, go to **Settings** $\rightarrow$ **Generate Domain**.
6. Your app is live with SSL at `https://deepguard-production.up.railway.app`.

---

## 🐳 Option 4: Deploy on Any Cloud Server (Docker Compose)

If you have a Linux VPS (DigitalOcean Droplet, AWS EC2, Google Cloud, Linode):

1. SSH into your server:
   ```bash
   ssh root@your-server-ip
   ```
2. Install Docker and Docker Compose (if not already installed):
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh
   ```
3. Clone your repository:
   ```bash
   git clone https://github.com/varshakolekar20/DeepFake_Project.git
   cd DeepFake_Project
   ```
4. Start the application with Docker Compose:
   ```bash
   docker compose up -d --build
   ```
5. Your application is now live on `http://your-server-ip:8000`!

---

## 🔍 Verifying Your Live Deployment

Once deployed, test your live URL:
- **Web App Interface**: `https://your-domain.com/`
- **Health Check**: `https://your-domain.com/health` $\rightarrow$ should return `{"status": "ok"}`
- **Interactive API Docs**: `https://your-domain.com/docs` $\rightarrow$ opens Swagger UI
- **Camera Feature**: Browser will prompt for camera access (WebRTC requires HTTPS in production, which Render, Hugging Face, and Railway provide automatically).
