import { auth, db, signOut } from './firebase-config.js';
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    const addNoteBtn = document.getElementById('add-note');
    const modal = document.getElementById('add-note-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const saveNoteBtn = document.getElementById('save-note');
    const noteList = document.getElementById('note-list');
    const noteDisplay = document.getElementById('note-display');
    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Logout';
    logoutBtn.classList.add('btn', 'logout-btn');
    document.querySelector('.sidebar').appendChild(logoutBtn);

    let notes = [];
    let currentUser = null;

    auth.onAuthStateChanged(async (user) => {
        if (user) {
            console.log('User is signed in:', user);
            currentUser = user;
            await loadNotes(user.uid);
        } else {
            console.log('No user is signed in.');
            window.location.href = 'index.html';
        }
    });

    // Theme toggle functionality
    const currentTheme = localStorage.getItem('theme') || 'light';
    body.classList.add(currentTheme + '-theme');
    themeSwitch.checked = currentTheme === 'dark';

    themeSwitch.addEventListener('change', () => {
        if (themeSwitch.checked) {
            body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light');
        }
    });

    // Open modal with animation
    function openModal() {
        modal.style.display = 'block';
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }

    // Close modal with animation
    function closeModal() {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
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

    // Function to load notes from Firestore
    async function loadNotes(userId) {
        const q = query(collection(db, "notes"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        notes = querySnapshot.docs.map(doc => ({id: doc.id, ...doc.data()}));
        renderNoteList();
    }

    // Save note
    const saveNote = async () => {
        const title = document.getElementById('note-title').value.trim();
        const content = document.getElementById('note-content').value.trim();
        if (title && content && currentUser) {
            const newNote = {
                title,
                content,
                userId: currentUser.uid,
                createdAt: new Date()
            };
            try {
                const docRef = await addDoc(collection(db, "notes"), newNote);
                newNote.id = docRef.id;
                notes.push(newNote);
                renderNoteList();
                closeModal();
                clearInputs();
            } catch (error) {
                console.error("Error adding document: ", error);
                alert('Failed to save the note. Please try again.');
            }
        } else {
            alert('Please enter both a title and content for the note.');
        }
    };

    saveNoteBtn.addEventListener('click', saveNote);

    function renderNoteList() {
        noteList.innerHTML = '';
        notes.forEach(note => {
            if (note && note.title && note.content) {
                const noteItem = document.createElement('div');
                noteItem.classList.add('note-item');
                noteItem.setAttribute('data-note-id', note.id);
                noteItem.innerHTML = `
                    <div class="note-title">${note.title}</div>
                    <div class="note-summary">${note.content.substring(0, 50)}${note.content.length > 50 ? '...' : ''}</div>
                `;
                noteItem.addEventListener('click', () => displayNote(note));
                noteList.appendChild(noteItem);
            } else {
                console.warn('Skipping invalid note:', note);
            }
        });
    }

    function displayNote(note) {
        noteDisplay.innerHTML = `
            <h2>${note.title}</h2>
            <p>${note.content}</p>
            <div class="note-actions">
                <button class="btn-edit" onclick="editNote('${note.id}')">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                </button>
                <button class="btn-delete" onclick="deleteNote('${note.id}')">
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
        noteDisplay.classList.remove('show');
        void noteDisplay.offsetWidth; // Trigger reflow
        noteDisplay.classList.add('show');
    }

    window.editNote = async (id) => {
        const note = notes.find(n => n.id === id);
        if (note) {
            document.getElementById('note-title').value = note.title;
            document.getElementById('note-content').value = note.content;
            autoResizeTextarea(document.getElementById('note-content'));
            openModal();

            // Update the save button to handle edits
            saveNoteBtn.onclick = async () => {
                const updatedTitle = document.getElementById('note-title').value.trim();
                const updatedContent = document.getElementById('note-content').value.trim();
                if (updatedTitle && updatedContent) {
                    try {
                        await updateDoc(doc(db, "notes", id), {
                            title: updatedTitle,
                            content: updatedContent,
                            updatedAt: new Date()
                        });
                        note.title = updatedTitle;
                        note.content = updatedContent;
                        renderNoteList();
                        displayNote(note);
                        closeModal();
                        // Reset saveNoteBtn onclick to its original function
                        saveNoteBtn.onclick = saveNote;
                    } catch (error) {
                        console.error("Error updating document: ", error);
                        alert('Failed to update the note. Please try again.');
                    }
                } else {
                    alert('Please enter both a title and content for the note.');
                }
            };
        }
    };

    window.deleteNote = async (id) => {
        const noteElement = document.querySelector(`[data-note-id="${id}"]`);
        if (noteElement) {
            noteElement.style.animation = 'fadeOut 0.3s ease-out';
            noteElement.addEventListener('animationend', async () => {
                await deleteDoc(doc(db, "notes", id));
                notes = notes.filter(n => n.id !== id);
                renderNoteList();
                noteDisplay.innerHTML = '';
            });
        }
    };

    logoutBtn.addEventListener('click', () => {
        body.classList.add('fade-out');
        setTimeout(() => {
            signOut(auth).then(() => {
                console.log('User signed out successfully');
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error('Sign out error:', error);
            });
        }, 500); // Wait for the animation to complete
    });

    renderNoteList();
});

