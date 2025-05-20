import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getAllNotes, saveNote, deleteNote } from './db/indexedDB';
import { syncNotesWithBackend } from './db/sync';
import NoteEditor from './components/NoteEditor';
import NoteList from './components/NoteList';
import { openDB } from 'idb';

const styles = {
  container: {
    padding: '24px',
    maxWidth: '80rem',
    margin: '0 auto',
    minHeight: '100vh',
    backgroundColor: '#f9fafb',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
    borderBottom: '1px solid #d1d5db',
    paddingBottom: '12px',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    color: '#111827',
  },
  statusOnline: {
    color: '#16a34a',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  statusOffline: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: '0.875rem',
  },
  main: {
    display: 'flex',
    flex: 1,
    gap: '24px',
    overflow: 'hidden',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '0.375rem',
    boxShadow: '0 1px 3px rgb(0 0 0 / 0.1)',
  },
  emptyMessage: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#6b7280',
    fontStyle: 'italic',
  },
  syncStatus: {
    fontSize: '0.8rem',
    marginLeft: 8,
  },
  unsynced: { color: 'orange' },
  syncing: { color: 'blue' },
  synced: { color: 'green' },
  error: { color: 'red' },
};


export default function App() {

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
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      console.log('Back online: syncing...');
      syncNotesWithBackend(setNotes);
    };
  
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);
  

  useEffect(() => {
    async function fetchNotes() {
      const storedNotes = await getAllNotes();
      setNotes(storedNotes);
    }
    fetchNotes();

    async function handleOnline() {
      setIsOnline(true);
      await syncNotesWithBackend(setNotes);
    }
    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSave = async (note) => {
    note.updatedAt = new Date().toISOString();
  
    const db = await getDB();
  
    if (navigator.onLine) {
      note.syncStatus = 'syncing';
      await saveNote(note); 
      setNotes((prev) => [...prev.filter((n) => n.id !== note.id), note]);
  
      try {
        const method = note.synced ? 'PUT' : 'POST';
        const url = note.synced
          ? `${API_URL}/${note.id}`
          : `${API_URL}`;
  
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(note),
        });
  
        if (response.ok) {
          note.syncStatus = 'synced';
          note.synced = true;
        } else {
          note.syncStatus = 'unsynced';
        }
      } catch (err) {
        note.syncStatus = 'unsynced';
      }
  
      await saveNote(note); 
      const updatedNotes = await getAllNotes();
      setNotes(updatedNotes);
    } else {
      
      note.syncStatus = 'unsynced';
      await saveNote(note);
      setNotes((prev) => [...prev.filter((n) => n.id !== note.id), note]);
    }
  };
  

  const handleDelete = async (id) => {
    await deleteNote(id);
    setNotes((prev) => prev.filter((note) => note.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Markdown Notes</h1>
        <span style={isOnline ? styles.statusOnline : styles.statusOffline}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </header>
      <main style={styles.main}>
        <NoteList
          notes={notes}
          onSelect={setSelectedNote}
          onNew={() =>
            setSelectedNote({
              id: uuidv4(),
              title: '',
              content: '',
              updatedAt: new Date().toISOString(),
              syncStatus: 'unsynced',
            })
          }
          syncStyles={styles}
        />
        {selectedNote ? (
          <NoteEditor
          note={selectedNote}
          setNotes={setNotes}      
          onSave={handleSave}
          onDelete={handleDelete}
        />
        
        ) : (
          <div style={styles.emptyMessage}>Select or create a note to get started</div>
        )}
      </main>
    </div>
  );
}
