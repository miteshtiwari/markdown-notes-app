import React, { useEffect, useState } from 'react';
import { editNoteAndSync } from '../db/sync';

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '24px',
  },
  titleInput: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '16px',
    padding: '8px 12px',
    borderRadius: '0.375rem',
    border: '1px solid #d1d5db',
    outline: 'none',
    transition: 'box-shadow 0.2s',
  },
  contentTextarea: {
    flex: 1,
    padding: '12px',
    borderRadius: '0.375rem',
    border: '1px solid #d1d5db',
    outline: 'none',
    fontFamily: 'monospace, monospace',
    resize: 'none',
    transition: 'box-shadow 0.2s',
  },
  deleteButton: {
    marginTop: '16px',
    backgroundColor: '#dc2626',
    color: 'white',
    fontWeight: '600',
    borderRadius: '0.375rem',
    padding: '10px 16px',
    border: 'none',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    transition: 'background-color 0.2s',
  },
};

export default function NoteEditor({ note, onSave, onDelete,setNotes }) {
  const [localNote, setLocalNote] = useState(note);

  useEffect(() => {
    setLocalNote(note);
  }, [note]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      // editNoteAndSync(localNote, {}, setNotes);
      onSave(localNote);

    }, 500);
    return () => clearTimeout(timeout);
  }, [localNote]);

  return (
    <section style={styles.container}>
      <input
        type="text"
        value={localNote.title}
        onChange={(e) => setLocalNote({ ...localNote, title: e.target.value })}
        placeholder="Title"
        style={styles.titleInput}
        onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #3b82f6')}
        onBlur={(e) => (e.target.style.boxShadow = 'none')}
      />
      <textarea
        value={localNote.content}
        onChange={(e) => setLocalNote({ ...localNote, content: e.target.value })}
        style={styles.contentTextarea}
        placeholder="Write your Markdown content here..."
        onFocus={(e) => (e.target.style.boxShadow = '0 0 0 2px #3b82f6')}
        onBlur={(e) => (e.target.style.boxShadow = 'none')}
      />
      <button
        onClick={() => onDelete(localNote.id)}
        style={styles.deleteButton}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
      >
        Delete Note
      </button>
    </section>
  );
}
