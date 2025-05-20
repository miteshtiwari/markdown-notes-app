import { openDB } from 'idb';

const DB_NAME = 'notes-db';
const STORE_NAME = 'notes';

export async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

export async function getAllNotes() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function saveNote(note) {
  const db = await getDB();
  await db.put(STORE_NAME, note);
}

export async function deleteNote(id) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
