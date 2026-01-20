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

// 1. Logika Rekam Suara
recordBtn.onclick = async () => {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            
            mediaRecorder.onstop = () => {
                mediaBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                mediaType = 'audio';
                previewArea.innerHTML = "✅ Rekaman suara siap disimpan";
                audioChunks = [];
            };

            mediaRecorder.start();
            recordBtn.innerText = "🛑 Berhenti Rekam";
            recordBtn.style.background = "#ff5252";
            recordBtn.style.color = "white";
        } catch (err) {
            alert("Gagal mengakses mikrofon: " + err);
        }
    } else {
        mediaRecorder.stop();
        recordBtn.innerText = "🎤 Rekam Suara";
        recordBtn.style.background = "#e0e0e0";
        recordBtn.style.color = "#333";
    }
};

// 2. Logika Input File (Gambar/Video)
fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        mediaBlob = file;
        mediaType = file.type.split('/')[0]; // Mendapatkan 'image' atau 'video'
        previewArea.innerHTML = `📎 File terpilih: <strong>${file.name}</strong>`;
    }
};

// 3. Fungsi Simpan Catatan
function saveNote() {
    const text = noteText.value;
    
    if (!text && !mediaBlob) {
        alert("Silakan tulis sesuatu atau tambahkan media!");
        return;
    }

    const note = {
        id: Date.now(),
        text: text,
        media: mediaBlob ? URL.createObjectURL(mediaBlob) : null,
        type: mediaType
    };

    addNoteToUI(note);
    resetForm();
}

// 4. Menampilkan Catatan ke Layar
function addNoteToUI(note) {
    const div = document.createElement('div');
    div.className = 'note-card';
    
    let mediaHTML = '';
    if (note.media) {
        if (note.type === 'image') {
            mediaHTML = `<img src="${note.media}" alt="Note Image">`;
        } else if (note.type === 'video') {
            mediaHTML = `<video src="${note.media}" controls></video>`;
        } else if (note.type === 'audio') {
            mediaHTML = `<audio src="${note.media}" controls></audio>`;
        }
    }

    div.innerHTML = `
        <button class="btn-delete" title="Hapus" onclick="this.parentElement.remove()">×</button>
        <p>${note.text.replace(/\n/g, '<br>')}</p>
        ${mediaHTML}
        <small style="color: #999; display: block; margin-top: 10px;">
            ${new Date(note.id).toLocaleString()}
        </small>
    `;

    notesList.prepend(div);
}

// 5. Reset Form Setelah Simpan
function resetForm() {
    noteText.value = "";
    previewArea.innerHTML = "";
    fileInput.value = "";
    mediaBlob = null;
    mediaType = null;
}