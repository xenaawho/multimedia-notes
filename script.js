let mediaBlob = null;
let mediaType = null;
let mediaRecorder;
let audioChunks = [];

// Elemen DOM
const recordBtn = document.getElementById('recordBtn');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const noteText = document.getElementById('noteText');
const notesList = document.getElementById('notesList');

// --- 1. LOAD DATA SAAT APLIKASI DIBUKA ---
window.onload = () => {
    const savedNotes = JSON.parse(localStorage.getItem('myMultimediaNotes')) || [];
    // Urutkan dari yang terbaru (berdasarkan ID/timestamp)
    savedNotes.forEach(note => addNoteToUI(note));
};

// --- 2. LOGIKA REKAM SUARA ---
recordBtn.onclick = async () => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.onstop = () => {
                const blob = new Blob(audioChunks, { type: 'audio/mp3' });
                // Konversi Blob ke Base64 agar bisa disimpan di LocalStorage
                const reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onloadend = () => {
                    mediaBlob = reader.result; // Data Base64
                    mediaType = 'audio';
                    previewArea.innerHTML = "✅ Rekaman suara siap disimpan";
                };
                audioChunks = [];
            };
            mediaRecorder.start();
            recordBtn.innerText = "🛑 Berhenti Rekam";
            recordBtn.style.background = "#ff5252";
        } catch (err) {
            alert("Gagal mengakses mikrofon: " + err);
        }
    } else {
        mediaRecorder.stop();
        recordBtn.innerText = "🎤 Rekam Suara";
        recordBtn.style.background = "#e0e0e0";
    }
};

// --- 3. LOGIKA INPUT FILE (GAMBAR/VIDEO) ---
fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            mediaBlob = reader.result; // Data Base64
            mediaType = file.type.split('/')[0];
            previewArea.innerHTML = `📎 File terpilih: <strong>${file.name}</strong>`;
        };
    }
};

// --- 4. FUNGSI SIMPAN CATATAN ---
function saveNote() {
    const text = noteText.value;
    if (!text && !mediaBlob) return alert("Isi catatan atau media!");

    const note = {
        id: Date.now(),
        text: text,
        media: mediaBlob, // Sekarang berisi string Base64
        type: mediaType
    };

    // Ambil data lama, tambah yang baru, simpan kembali
    const savedNotes = JSON.parse(localStorage.getItem('myMultimediaNotes')) || [];
    savedNotes.push(note);
    localStorage.setItem('myMultimediaNotes', JSON.stringify(savedNotes));

    addNoteToUI(note);
    resetForm();
}

// --- 5. MENAMPILKAN KE UI ---
function addNoteToUI(note) {
    const div = document.createElement('div');
    div.className = 'note-card';
    div.setAttribute('data-id', note.id);
    
    let mediaHTML = '';
    if (note.media) {
        if (note.type === 'image') {
            mediaHTML = `<img src="${note.media}">`;
        } else if (note.type === 'video') {
            mediaHTML = `<video src="${note.media}" controls></video>`;
        } else if (note.type === 'audio') {
            mediaHTML = `<audio src="${note.media}" controls></audio>`;
        }
    }

    div.innerHTML = `
        <button class="btn-delete" onclick="deleteNote(${note.id})">×</button>
        <p>${note.text.replace(/\n/g, '<br>')}</p>
        ${mediaHTML}
        <small style="color: #999; display: block; margin-top: 10px;">
            ${new Date(note.id).toLocaleString()}
        </small>
    `;

    notesList.prepend(div);
}

// --- 6. FUNGSI HAPUS ---
function deleteNote(id) {
    // Hapus dari UI
    const element = document.querySelector(`[data-id="${id}"]`);
    element.remove();

    // Hapus dari LocalStorage
    let savedNotes = JSON.parse(localStorage.getItem('myMultimediaNotes')) || [];
    savedNotes = savedNotes.filter(note => note.id !== id);
    localStorage.setItem('myMultimediaNotes', JSON.stringify(savedNotes));
}

function resetForm() {
    noteText.value = "";
    previewArea.innerHTML = "";
    fileInput.value = "";
    mediaBlob = null;
    mediaType = null;
}