# Tripurari AI Song Writer 🎵

A sleek, responsive, and fully functional songwriting web application that crafts high-quality, rhythmically aligned, and genre-appropriate song lyrics. Built with **React (Vite)**, **Tailwind CSS**, and **Express.js**, integrated with the state-of-the-art **Google Gemini 3.5 API**.

---

## ✨ Features

- **Beautiful Sleek Theme**: Elegant, dark futuristic interface designed with high-contrast color highlights, refined typography, and glassmorphism.
- **Dynamic Topic Generation**: Put any custom prompt, story, or emotional trigger to write beautiful rhymes.
- **Multilingual Support**: Supports four distinct languages:
  - **Hindi (हिंदी)** in native Devanagari script
  - **Bhojpuri (भोजपुरी)** capturing authentic local dialect and cultural rhythm
  - **Maithili (मैथिली)** in elegant traditional tone
  - **English** with perfect rhythm and rhyme structures
- **Musical Styles**: Tailors the meter, pace, and mood for:
  - Romantic ❤️
  - DJ / Upbeat ⚡
  - Bhakti (Devotional) 🙏
  - Sad / Heartbroken 💔
  - Rap / Hip-Hop 🎤
  - Motivational 🔥
- **Song Duration Control**:
  - **Short (1 Minute)**: 1 Verse + Chorus + Outro (concise and catchy)
  - **Standard (3 Minutes)**: 2 Verses + Chorus + Bridge + Outro (classic layout)
  - **Extended (5 Minutes)**: 3 Verses + Chorus + Bridge + Hook + Outro (deep lyrical journey)
- **Advanced Control Options**:
  - Full copy of structured lyrics or section-by-section copying.
  - One-click `.txt` file downloading.
  - In-app **API Key Overriding Settings Panel** to run using custom personal API quotas.
  - Persistent offline favorites studio using browser localStorage.

---

## 🚀 Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS v4, Lucide React, Motion.
- **Backend**: Express.js server proxy (runs the Gemini API calls securely server-side).
- **AI Core**: `@google/genai` (Gemini 3.5 Flash Model) with structured JSON schemas.

---

## 🛠️ How to run locally

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Secrets
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="your_api_key_here"
```

### 3. Run Development Server
```bash
npm run dev
```

---

## 📤 How to Export to GitHub

To save this completed project to your GitHub repository **`tripurari-ai-song-writer`**:
1. Click the **Settings** gear icon (or the export menu) in the top-right corner of the **Google AI Studio** interface.
2. Select **Export to GitHub**.
3. Authenticate with your GitHub account and select your repository **`tripurari-ai-song-writer`** (or create a new one instantly).
4. The full production-ready codebase, including the server-side architecture, will be pushed immediately.
