document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    const addNoteBtn = document.getElementById('add-note');
    const modal = document.getElementById('add-note-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const saveNoteBtn = document.getElementById('save-note');
    const noteList = document.getElementById('note-list');
    const noteDisplay = document.getElementById('note-display');

    let notes = JSON.parse(localStorage.getItem('notes')) || [];

    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';
    body.classList.add(currentTheme + '-theme');
    themeSwitch.checked = currentTheme === 'dark';

    // Theme toggle functionality
    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            body.classList.add('dark-theme');
            body.classList.remove('light-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.add('light-theme');
            body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });

    // Open modal
    function openModal() {
        modal.classList.add('show');
    }

    // Close modal
    function closeModal() {
        modal.classList.remove('show');
    }

    addNoteBtn.addEventListener('click', openModal);
    closeModalBtn.addEventListener('click', closeModal);

    // Function to clear inputs
    function clearInputs() {
        document.getElementById('note-title').value = '';
        document.getElementById('note-content').value = '';
    }

    // Function to auto-resize textarea
    function autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    // Add event listener for textarea auto-resize
    const noteContent = document.getElementById('note-content');
    noteContent.addEventListener('input', () => autoResizeTextarea(noteContent));

    // Save note
    saveNoteBtn.addEventListener('click', () => {
        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;
        if (title && content) {
            const newNote = { id: Date.now(), title, content };
            notes.push(newNote);
            saveNotes();
            renderNoteList();
            closeModal();
            clearInputs();
        }
    });

    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function renderNoteList() {
        noteList.innerHTML = '';
        notes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.classList.add('note-item');
            noteItem.setAttribute('data-note-id', note.id);
            noteItem.innerHTML = `
                <div class="note-title">${note.title}</div>
                <div class="note-summary">${note.content.substring(0, 50)}...</div>
            `;
            noteItem.addEventListener('click', () => displayNote(note));
            noteList.appendChild(noteItem);
        });
    }

    function displayNote(note) {
        noteDisplay.innerHTML = `
            <h2>${note.title}</h2>
            <p>${note.content}</p>
            <div class="note-actions">
                <button class="btn-edit" onclick="editNote(${note.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                </button>
                <button class="btn-delete" onclick="deleteNote(${note.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    Delete
                </button>
            </div>
        `;
    }

    window.editNote = (id) => {
        const note = notes.find(n => n.id === id);
        if (note) {
            document.getElementById('note-title').value = note.title;
            document.getElementById('note-content').value = note.content;
            autoResizeTextarea(document.getElementById('note-content'));
            openModal();
            notes = notes.filter(n => n.id !== id);
        }
    };

    window.deleteNote = (id) => {
        const noteElement = document.querySelector(`[data-note-id="${id}"]`);
        if (noteElement) {
            noteElement.style.animation = 'fadeOut 0.3s ease-out';
            noteElement.addEventListener('animationend', () => {
                notes = notes.filter(n => n.id !== id);
                saveNotes();
                renderNoteList();
                noteDisplay.innerHTML = '';
            });
        }
    };

    renderNoteList();
});

