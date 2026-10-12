# AI adventures for dog walks (SniffQuest 🐾)

> **SniffQuest** is an AI-powered dog-walking adventure application designed for hackathons. It transforms everyday neighborhood dog walks into captivating sensory quests, olfactory detective stories, and interactive canine waypoints.

---

## 🌟 Online & Offline Operation Architecture

SniffQuest now supports seamless **Online** and **Offline** execution with resilient fallback:

### 1. 🌐 Online Mode (Google Gemini Cloud AI)
- Uses **Google Gemini** (`gemini-2.5-flash`) to generate rich, contextual, breed-specific olfactory adventures.
- **Security First**: Gemini is contacted **strictly through the local Node.js backend** (`server/index.js`).
- The `GEMINI_API_KEY` is loaded from your local `.env` file and is **never** exposed in client-side JavaScript or committed to GitHub (`.gitignore` protects all `.env` files).

### 2. 💻 Offline Mode (Local Ollama AI)
- If cloud access or Gemini is unavailable (or if selected explicitly), SniffQuest queries a locally running **Ollama** instance (`http://localhost:11434`) using an open-weight model (e.g., `llama3.2`).
- **Zero Cloud Data**: No data or prompts leave your computer.

### 3. 📚 Safe Offline Activity Library (Guaranteed Availability)
- If neither Gemini nor Ollama is reachable, SniffQuest automatically uses a built-in library of safe, veterinary-approved sensory enrichment activities.
- **Clear Labeling**: Activities from the offline library are prominently labeled **"Offline Sample Activity (Non-AI)"** so users always know whether an adventure was AI-generated or selected from the curated offline catalog.

---

## 🔑 How to Configure Your Google Gemini API Key

1. **Obtain an API Key**:
   - Go to [Google AI Studio](https://aistudio.google.com/) and create a free Gemini API key.

2. **Add to `.env`**:
   - In the root folder of this project, open (or create) the `.env` file (you can copy `.env.example`).
   - Add your key:
     ```env
     GEMINI_API_KEY=AIzaSy...YourRealKeyHere...
     GEMINI_MODEL=gemini-2.5-flash
     PORT=3001
     ```
   - *Never commit this key or paste it into public chats!* Git automatically ignores `.env`.

3. **Restart the Backend**:
   - The backend will immediately detect the key and switch the indicator in the header to **"Online (Gemini Cloud)"**.

---

## 🚀 Running the Project

1. **Start the Backend Server**:
   ```bash
   npm run server
   ```
   Runs on `http://localhost:3001` with status endpoint at `/api/status`.

2. **Start the Frontend Web App**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173/` in your browser. (API requests are automatically proxied to the backend).

3. **Run Tests & Linting**:
   ```bash
   npm test
   npm run lint
   ```

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 🛡️ Privacy & Mode Guarantees

| Mode Selected | Cloud Data Sent? | Requires Internet? | Result Label |
| :--- | :--- | :--- | :--- |
| **Google Gemini (Online)** | Yes (via secure backend only) | Yes | `Google Gemini Cloud AI` |
| **Local Ollama (Offline AI)** | **No** (Localhost only) | **No** | `Local Ollama (Offline AI)` |
| **Safe Offline Library** | **No** (Zero network) | **No** | `Offline Sample Activity (Non-AI)` |
| **Auto Resilient** | Only if Gemini configured | Falls back offline gracefully | Matches source with fallback explanation |
