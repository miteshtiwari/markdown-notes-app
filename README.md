# 📝 Markdown Notes App

An offline-first note-taking app built using React and IndexedDB. Create, edit, and manage notes locally, with automatic syncing to a mock backend when you're online.

---

## 🚀 Features

- 📝 Create, edit, and delete notes
- 🔍 Search notes by title or content
- 💾 Offline-first support with IndexedDB
- 🌐 Sync with backend when online
- 📊 Status indicators: Unsynced, Syncing, Synced
- 🕒 Notes sorted by last updated time
- ⏳ Upcoming: Live Markdown preview

---

## Deployment Link 
Note :- If you want to see full functionality of this you just need to run Backend server in your local By doing this :-

1. Create db.json file in root directory with content Given below
{
  "notes":[]
}

2. Start JSON Server (Mock Backend)
npm install -g json-server
--
json-server --watch db.json --port 3001


Link :- https://markdown-notes-app-8j86.vercel.app/


## 🏗️ Tech Stack

- **React** – Frontend UI
- **IndexedDB** (`idb`) – Local offline storage
- **JSON Server** – Mock backend
- **JavaScript Fetch API** – Sync logic
- **Inline CSS** – Simple styling

---


---

## 📦 Design Decisions, Assumptions & Limitations

### ✅ Design Decisions

- **Offline-first approach**: Using IndexedDB ensures the app works without an internet connection.
- **Sync on demand (not real-time typing)**: Sync is triggered on save or when connectivity is restored.
- **Status tracking per note**: Each note has a `syncStatus` (`unsynced`, `syncing`, `synced`) for visual feedback.
- **Flat JSON format**: Kept notes simple and independent for easier syncing and conflict avoidance.

### ⚠️ Assumptions

- A single user is using the app — no multi-user accounts or auth.
- Internet connection is stable during sync.
- Notes are synced fully (no merge conflict handling).

### 🚫 Limitations

- No rich-text or Markdown preview (coming soon).
- No authentication or encryption.
- Sync errors are logged in console but not shown in UI.
- Backend is only a mock JSON server — not a persistent DB.

---

## 📦 Getting Started

### 1. Clone the Project

```bash
1.CLone
git clone https://github.com/miteshtiwari/markdown-notes-app.git
cd markdown-notes-app

2. Install Dependencies
npm install

3. Create db.json file in root directory with content Given below
{
  "notes":[]
}

4. Start JSON Server (Mock Backend)
npm install -g json-server
json-server --watch db.json --port 3001

5. now switch to another Terminal  & Start the App
npm start

