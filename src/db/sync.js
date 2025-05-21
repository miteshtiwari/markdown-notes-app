import { openDB } from 'idb';



async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}


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
        note.syncStatus = 'syncing';
        await db.put(STORE_NAME, note);
        console.log(`[SYNC] Note ${note.id} marked as 'syncing'`);
        hasChanges = true;

        let response;

        if (!note.synced) {

          response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note),
          });
        } else {
          
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

        note.syncStatus = 'synced';
        note.synced = true;
        await db.put(STORE_NAME, note);
        console.log(`[SYNC] Note ${note.id} successfully synced`);
        hasChanges = true;

      } catch (err) {
        console.error(`[SYNC] Error syncing note ${note.id}:`, err.message);

        
        note.syncStatus = 'unsynced';
        await db.put(STORE_NAME, note);
        console.warn(`[SYNC] Note ${note.id} marked as 'unsynced' for retry`);
        hasChanges = true;
      }
    }
  }

  if (hasChanges && setNotes) {
  
    const updatedNotes = await db.getAll(STORE_NAME);
    console.log(`[SYNC] Updated notes pushed to UI`);
    setNotes(updatedNotes);
  } else {
    console.log(`[SYNC] No changes detected; state unchanged`);
  }
}
