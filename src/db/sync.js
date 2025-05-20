import { openDB } from 'idb';

const API_URL = 'http://localhost:3001/notes';
const DB_NAME = 'notes-db';
const STORE_NAME = 'notes';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

/**
 * Initialize missing syncStatus
 */
export async function initializeSyncStatus() {
  const db = await getDB();
  const notes = await db.getAll(STORE_NAME);
  let changed = false;

  for (const note of notes) {
    if (!note.syncStatus) {
      note.syncStatus = 'unsynced';
      note.synced = false;
      await db.put(STORE_NAME, note);
      changed = true;
    }
  }

  if (changed) {
    return await db.getAll(STORE_NAME);
  }

  return notes;
}

/**
 * Sync notes with backend if online
 */
// export async function syncNotesWithBackend(setNotes) {
//   if (!navigator.onLine) {
//     console.warn('[SYNC] Offline: Skipping sync');
//     return;
//   }

//   const db = await getDB();
//   const notes = await db.getAll(STORE_NAME);
//   console.log(`[SYNC] Starting sync for ${notes.length} notes`);

//   let hasChanges = false;

//   for (const note of notes) {
//     if (note.syncStatus !== 'synced') {
//       console.log(`[SYNC] Processing note: ${note.id}, current status: ${note.syncStatus}`);

//       try {
//         // Mark as syncing
//         note.syncStatus = 'syncing';
//         await db.put(STORE_NAME, note);
//         console.log(`[SYNC] Note ${note.id} marked as 'syncing'`);
//         hasChanges = true;

//         let syncResponse;

//         if (!note.synced) {
//           // New note → POST
//           syncResponse = await fetch(API_URL, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(note),
//           });
//         } else {
//           // Existing note → PUT
//           syncResponse = await fetch(`${API_URL}/${note.id}`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(note),
//           });
//         }

//         console.log(`[SYNC] Response for note ${note.id}: ${syncResponse.status}`);

//         if (!syncResponse.ok) {
//           throw new Error(`Sync failed: ${syncResponse.statusText}`);
//         }

//         // Mark as synced
//         note.syncStatus = 'synced';
//         note.synced = true;
//         await db.put(STORE_NAME, note);
//         console.log(`[SYNC] Note ${note.id} successfully synced`);
//         hasChanges = true;

//       } catch (err) {
//         console.error(`[SYNC] Error syncing note ${note.id}:`, err.message);

//         // Fallback: set to unsynced for retry
//         note.syncStatus = 'unsynced';
//         await db.put(STORE_NAME, note);
//         console.warn(`[SYNC] Note ${note.id} marked as 'unsynced' for retry`);
//         hasChanges = true;
//       }
//     }
//   }

//   if (hasChanges && setNotes) {
//     const updated = await db.getAll(STORE_NAME);
//     console.log(`[SYNC] Updated notes pushed to UI`);
//     setNotes(updated);
//   } else {
//     console.log(`[SYNC] No changes detected; state unchanged`);
//   }
// }



// Simulate your backend API call - replace with your real API call
// export async function syncNotesWithBackend(note) {
//   // e.g. await fetch('/api/notes/' + note.id, { method: 'PUT', body: JSON.stringify(note) })
//   return new Promise((resolve) => setTimeout(resolve, 1000)); // fake delay
// }

// export async function editNoteAndSync(note, updatedFields, setNotes) {
//   const db = await getDB();

//   const isOnline = navigator.onLine;

//   if (!isOnline) {
//     // Offline: just save locally with unsynced status
//     const updatedNote = { ...note, ...updatedFields, syncStatus: 'unsynced' };
//     await db.put(STORE_NAME, updatedNote);

//     const allNotes = await db.getAll(STORE_NAME);
//     setNotes(allNotes);
//     return;
//   }

//   // Online: set syncing first, update UI
//   let updatedNote = { ...note, ...updatedFields, syncStatus: 'syncing' };
//   await db.put(STORE_NAME, updatedNote);
//   setNotes(await db.getAll(STORE_NAME));

//   try {
//     await syncNotesWithBackend(updatedNote);

//     // If backend success, update status to synced
//     updatedNote = { ...updatedNote, syncStatus: 'synced' };
//     await db.put(STORE_NAME, updatedNote);
//   } catch (error) {
//     // If backend fails, mark as unsynced so it retries later
//     updatedNote = { ...updatedNote, syncStatus: 'unsynced' };
//     await db.put(STORE_NAME, updatedNote);
//   }

//   // Update UI with final syncStatus
//   const allNotes = await db.getAll(STORE_NAME);
//   setNotes(allNotes);
// }
// import { getDB, STORE_NAME } from './indexedDB';  // adjust import paths
// const API_URL = 'https://your.api.endpoint/notes';  // replace with your real backend URL

export async function syncNotesWithBackend(setNotes) {
  if (!navigator.onLine) {
    console.warn('[SYNC] Offline: Skipping sync');
    return;
  }

  const db = await getDB();
  const notes = await db.getAll(STORE_NAME);
  console.log(`[SYNC] Starting sync for ${notes.length} notes`);

  let hasChanges = false;

  for (const note of notes) {
    if (note.syncStatus !== 'synced') {
      console.log(`[SYNC] Processing note: ${note.id}, current status: ${note.syncStatus}`);

      try {
        // Mark as syncing locally
        note.syncStatus = 'syncing';
        await db.put(STORE_NAME, note);
        console.log(`[SYNC] Note ${note.id} marked as 'syncing'`);
        hasChanges = true;

        let response;

        if (!note.synced) {
          // New note → POST request to backend
          response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note),
          });
        } else {
          // Existing note → PUT request to backend
          response = await fetch(`${API_URL}/${note.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note),
          });
        }

        console.log(`[SYNC] Response for note ${note.id}: ${response.status}`);

        if (!response.ok) {
          throw new Error(`Sync failed: ${response.statusText}`);
        }

        // Successfully synced
        note.syncStatus = 'synced';
        note.synced = true;
        await db.put(STORE_NAME, note);
        console.log(`[SYNC] Note ${note.id} successfully synced`);
        hasChanges = true;

      } catch (err) {
        console.error(`[SYNC] Error syncing note ${note.id}:`, err.message);

        // Mark as unsynced for retry later
        note.syncStatus = 'unsynced';
        await db.put(STORE_NAME, note);
        console.warn(`[SYNC] Note ${note.id} marked as 'unsynced' for retry`);
        hasChanges = true;
      }
    }
  }

  if (hasChanges && setNotes) {
    // Update React state with fresh notes from IndexedDB
    const updatedNotes = await db.getAll(STORE_NAME);
    console.log(`[SYNC] Updated notes pushed to UI`);
    setNotes(updatedNotes);
  } else {
    console.log(`[SYNC] No changes detected; state unchanged`);
  }
}
