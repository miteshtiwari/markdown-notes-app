import React, { useState } from 'react';

const styles = {
  container: {
    width: '20rem',
    display: 'flex',
    flexDirection: 'column',
    borderRight: '1px solid #e5e7eb',
    backgroundColor: '#f3f4f6',
  },
  controls: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  newButton: {
    backgroundColor: '#2563eb',
    color: 'white',
    fontWeight: '600',
    borderRadius: '0.375rem',
    padding: '8px 12px',
    cursor: 'pointer',
    border: 'none',
    transition: 'background-color 0.2s',
  },
  newButtonHover: {
    backgroundColor: '#1d4ed8',
  },
  searchInput: {
    padding: '8px',
    borderRadius: '0.375rem',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    borderTop: '1px solid #d1d5db',
  },
  noteItem: {
    padding: '12px 16px',
    cursor: 'pointer',
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s',
  },
  noteItemHover: {
    backgroundColor: '#bfdbfe',
  },
  title: {
    fontWeight: '600',
    color: '#111827',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  meta: {
    fontSize: '0.75rem',
    color: '#6b7280',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noNotes: {
    fontStyle: 'italic',
    color: '#6b7280',
    padding: '12px 16px',
  },

  
  syncStatus: {
    fontWeight: '600',
    marginRight: '8px',
  },
  unsynced: { color: '#d97706' }, // orange
  syncing: { color: '#3b82f6' }, // blue
  synced: { color: '#22c55e' }, // green
  error: { color: '#ef4444' }, // red
};

export default function NoteList({ notes, onSelect, onNew }) {
  const [search, setSearch] = useState('');

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase())
  );

  
  function renderSyncStatus(status) {
    switch (status) {
      case 'unsynced':
        return <span style={{ ...styles.syncStatus, ...styles.unsynced }}>Unsynced</span>;
      case 'syncing':
        return <span style={{ ...styles.syncStatus, ...styles.syncing }}>Syncing...</span>;
      case 'synced':
        return <span style={{ ...styles.syncStatus, ...styles.synced }}>Synced</span>;
      case 'error':
        return <span style={{ ...styles.syncStatus, ...styles.error }}>Error</span>;
      default:
        return <span style={{ ...styles.syncStatus, ...styles.unsynced }}>Unknown</span>;
    }
  }

  return (
    <aside style={styles.container}>
      <div style={styles.controls}>
        <button
          onClick={onNew}
          style={styles.newButton}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#1d4ed8')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#2563eb')}
        >
          + New Note
        </button>
        <input
          type="text"
          placeholder="Search notes..."
          style={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <ul style={styles.list}>
        {filteredNotes.length === 0 && <li style={styles.noNotes}>No notes found</li>}
        {filteredNotes.map((note) => (
          <li
            key={note.id}
            onClick={() => onSelect(note)}
            style={styles.noteItem}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#bfdbfe')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '')}
            title={note.title || '(No Title)'}
          >
            <div style={styles.title}>{note.title || '(No Title)'}</div>
            <div style={styles.meta}>
              {renderSyncStatus(note.syncStatus || 'unsynced')}
              <span>{new Date(note.updatedAt).toLocaleString()}</span>
            </div>
          </li>
        ))}
      </ul>
    </aside>
  );
}
