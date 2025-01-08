// تنظیمات Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBxz0xX36wbydgdnN2j-QV7atCo_J2EUQ0",
    authDomain: "my-notes-project-4455a.firebaseapp.com",
    projectId: "my-notes-project-4455a",
    storageBucket: "my-notes-project-4455a.firebasestorage.app",
    messagingSenderId: "345038341310",
    appId: "1:345038341310:web:f59fae90b5ee17903b8aef",
    measurementId: "G-MBZZZ1S5DE"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const firestore = firebase.firestore();

// المان‌های HTML
const loginSection = document.getElementById("login-section");
const notesSection = document.getElementById("notes-section");
const noteEditSection = document.getElementById("note-edit-section");
const notesList = document.getElementById("notes-list");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const googleSignInBtn = document.getElementById("googleSignInBtn");

const noteTitle = document.getElementById("noteTitle");
const noteBody = document.getElementById("noteBody");
const saveNoteBtn = document.getElementById("saveNoteBtn");

const addNoteBtn = document.getElementById("addNoteBtn");
const logoutBtn = document.getElementById("logoutBtn");

// ۱. رویداد ثبت‌نام
registerBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    try {
        await auth.createUserWithEmailAndPassword(email, password);
        alert("Registered successfully!");
    } catch (error) {
        alert(error.message);
    }
});

// ۲. رویداد ورود
loginBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;
    try {
        await auth.signInWithEmailAndPassword(email, password);
        alert("Logged in successfully!");
    } catch (error) {
        alert(error.message);
    }
});

// ۳. ورود با حساب گوگل
googleSignInBtn.addEventListener("click", async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
        await auth.signInWithPopup(provider);
        alert("Signed in with Google!");
    } catch (error) {
        alert(error.message);
    }
});

// ۴. خروج
logoutBtn.addEventListener("click", async () => {
    try {
        await auth.signOut();
        alert("Logged out");
    } catch (error) {
        alert(error.message);
    }
});

// ۵. افزودن نوت
addNoteBtn.addEventListener("click", () => {
    noteEditSection.classList.add("active");
    notesSection.classList.remove("active");
    noteTitle.value = '';
    noteBody.value = '';
    saveNoteBtn.textContent = 'Create Note';
});

// ۶. ذخیره نوت
saveNoteBtn.addEventListener("click", async () => {
    const title = noteTitle.value;
    const body = noteBody.value;
    const user = auth.currentUser;

    if (!user) {
        alert("You must be logged in");
        return;
    }

    if (!title || !body) {
        alert("Please fill Title and Body");
        return;
    }

    try {
        await firestore.collection("notes").add({
            userId: user.uid,
            title,
            body,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        noteTitle.value = '';
        noteBody.value = '';
        noteEditSection.classList.remove("active");
        notesSection.classList.add("active");

        loadNotes(user.uid);
    } catch (error) {
        alert(error.message);
    }
});

// ۷. بارگذاری نوت‌ها
async function loadNotes(userId) {
    try {
        const snapshot = await firestore.collection("notes")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .get();

        notesList.innerHTML = '';

        snapshot.forEach(doc => {
            const note = doc.data();
            const noteDiv = document.createElement('div');
            noteDiv.classList.add('note-item');
            noteDiv.innerHTML = `
        <h3>${note.title}</h3>
        <p>${note.body}</p>
        <div class="note-buttons">
          <button class="note-edit-btn" data-id="${doc.id}">Edit</button>
          <button class="note-delete-btn" data-id="${doc.id}">Delete</button>
        </div>
      `;
            notesList.appendChild(noteDiv);

            // ویرایش نوت
            noteDiv.querySelector('.note-edit-btn').addEventListener('click', () => {
                noteEditSection.classList.add('active');
                notesSection.classList.remove('active');
                noteTitle.value = note.title;
                noteBody.value = note.body;
                saveNoteBtn.textContent = 'Update Note';
                saveNoteBtn.setAttribute('data-id', doc.id);
            });

            // حذف نوت
            noteDiv.querySelector('.note-delete-btn').addEventListener('click', async () => {
                await firestore.collection('notes').doc(doc.id).delete();
                loadNotes(userId);
            });
        });
    } catch (error) {
        alert(error.message);
    }
}

// ۸. بررسی وضعیت ورود
auth.onAuthStateChanged(user => {
    if (user) {
        loginSection.classList.remove('active');
        notesSection.classList.add('active');
        loadNotes(user.uid);
    } else {
        loginSection.classList.add('active');
        notesSection.classList.remove('active');
    }
});
