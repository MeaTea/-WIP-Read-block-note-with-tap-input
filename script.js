// file: script.js

// Memastikan seluruh halaman HTML sudah siap dibaca oleh browser
document.addEventListener('DOMContentLoaded', () => {
    
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Pengaturan Ukuran & Posisi Jalur (Lane)
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 400;
    const LANE_TOP_Y = 120;    
    const LANE_BOTTOM_Y = 280; 
    const MEASURE_DURATION = 4000; // 4 detik per halaman

    // Mengambil Elemen UI HTML
    const comboUI = document.getElementById('combo');
    const accuracyUI = document.getElementById('accuracy');
    const startBtn = document.getElementById('startBtn');

    // Status Game
    let currentMap = []; 
    let isPlaying = false;
    let startTime = 0;

    // Sistem Skor & Akurasi
    let combo = 0;
    let totalAccuracyScore = 0; 
    let totalNotesProcessed = 0; 

    // Fungsi Reset Data Sebelum Game Dimulai
    function initGame() {
        // Menyalin data dari beatmap.js agar data asli tidak rusak saat diulang
        currentMap = JSON.parse(JSON.stringify(levelSatu)); 
        currentMap.forEach(note => {
            note.isHit = false;   
            note.isMissed = false;
        });
        
        combo = 0;
        totalAccuracyScore = 0;
        totalNotesProcessed = 0;
        updateUI();
    }

    // Fungsi Memperbarui Teks UI Skor di Atas Layar
    function updateUI() {
        if (comboUI) comboUI.innerText = combo;
        if (accuracyUI) {
            if (totalNotesProcessed === 0) {
                accuracyUI.innerText = "0";
            } else {
                let acc = (totalAccuracyScore / totalNotesProcessed).toFixed(2);
                accuracyUI.innerText = acc;
            }
        }
    }

    // Fungsi Menggambar Garis Paranada (Staff Line)
    function drawStaff(y) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.strokeStyle = "#7f8c8d"; 
        ctx.lineWidth = 3;
        ctx.stroke();
    }

    // Fungsi Menggambar Not dengan Sistem Halaman (Paging)
    function drawNotes(elapsedTime) {
        let currentMeasure = Math.floor(elapsedTime / MEASURE_DURATION);
        let measureStartTime = currentMeasure * MEASURE_DURATION;
        let measureEndTime = measureStartTime + MEASURE_DURATION;

        currentMap.forEach(note => {
            if (note.isHit || note.isMissed) return;

            if (note.time >= measureStartTime && note.time < measureEndTime) {
                const timeInMeasure = note.time % MEASURE_DURATION;
                const x = (timeInMeasure / MEASURE_DURATION) * CANVAS_WIDTH;
                const y = note.lane === 0 ? LANE_TOP_Y : LANE_BOTTOM_Y;

                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2);
                ctx.fillStyle = "#2c3e50";
                ctx.fill();
            }
        });
    }

    // Fungsi Menggambar Garis Pembaca (Scanline)
    function drawScanline(elapsedTime) {
        let currentX = (elapsedTime / MEASURE_DURATION) * CANVAS_WIDTH;
        currentX = currentX % CANVAS_WIDTH; 

        ctx.beginPath();
        ctx.moveTo(currentX, 0);
        ctx.lineTo(currentX, CANVAS_HEIGHT);
        ctx.strokeStyle = "#e74c3c"; 
        ctx.lineWidth = 4;
        ctx.stroke();
    }

    // DETEKSI INPUT KEYBOARD BEBAS (Free Input)
    window.addEventListener('keydown', (e) => {
        if (!isPlaying || e.repeat) return; 

        let elapsedTime = Date.now() - startTime;
        let nearestNote = null;
        let minDiff = Infinity;

        // Kunci target hanya pada halaman yang sedang aktif saat ini
        let currentMeasure = Math.floor(elapsedTime / MEASURE_DURATION);
        let measureStartTime = currentMeasure * MEASURE_DURATION;
        let measureEndTime = measureStartTime + MEASURE_DURATION;

        currentMap.forEach(note => {
            if (!note.isHit && !note.isMissed) {
                if (note.time >= measureStartTime && note.time < measureEndTime) {
                    let diff = Math.abs(note.time - elapsedTime);
                    if (diff < minDiff) {
                        minDiff = diff;
                        nearestNote = note;
                    }
                }
            }
        });

        // Penilaian Akurasi Berdasarkan Jarak Milidetik
        if (nearestNote) {
            if (minDiff <= 50) { // PERFECT
                nearestNote.isHit = true;
                combo++;
                totalAccuracyScore += 100;
                totalNotesProcessed++;
            } 
            else if (minDiff <= 120) { // GOOD
                nearestNote.isHit = true;
                combo++;
                totalAccuracyScore += 50;
                totalNotesProcessed++;
            }
            else { // Spam Penalty jika mencet asal-asalan
                combo = 0;
            }
        }
        updateUI();
    });

    // SIKLUS UTAMA GAME (ANIMASI & LOGIKA LOOP)
    function gameLoop() {
        if (!isPlaying) return;

        let elapsedTime = Date.now() - startTime;

        // ==========================================
        // * BARU DI LANGKAH 6: DETEKSI GAME SELESAI *
        // ==========================================
        if (currentMap.length > 0) {
            let lastNote = currentMap[currentMap.length - 1];
            // Jika waktu berjalan sudah melewati not terakhir + bonus jeda 1.5 detik
            if (elapsedTime > lastNote.time + 1500) {
                isPlaying = false; // Stop pergerakan game
                
                // Menggambar Layar Hasil (Result Screen) langsung di atas Kanvas
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                ctx.fillStyle = "#2c3e50";
                ctx.font = "bold 40px Arial";
                ctx.textAlign = "center";
                ctx.fillText("GAME SELESAI!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
                
                // Tampilkan akurasi akhir
                let finalAcc = totalNotesProcessed === 0 ? "0.00" : (totalAccuracyScore / totalNotesProcessed).toFixed(2);
                ctx.font = "24px Arial";
                ctx.fillText("Akurasi Akhir: " + finalAcc + "%", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
                ctx.fillText("Total Kombo Tertinggi: " + combo, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);
                
                // Munculkan kembali tombol start dengan teks baru untuk rematch
                if (startBtn) {
                    startBtn.style.display = 'inline-block';
                    startBtn.innerText = 'Main Lagi';
                }
                return; // Keluar dari loop total
            }
        }

        // Logika Auto Miss
        currentMap.forEach(note => {
            if (!note.isHit && !note.isMissed) {
                if (elapsedTime - note.time > 120) {
                    note.isMissed = true;
                    combo = 0; 
                    totalAccuracyScore += 0;
                    totalNotesProcessed++;
                    updateUI();
                }
            }
        });

        // Bersihkan layar dan gambar ulang setiap frame
        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawStaff(LANE_TOP_Y);
        drawStaff(LANE_BOTTOM_Y);
        drawNotes(elapsedTime);
        drawScanline(elapsedTime); 

        requestAnimationFrame(gameLoop);
    }

    // Menghubungkan Fungsi ke Tombol Start HTML
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (!isPlaying) {
                initGame(); 
                isPlaying = true;
                startTime = Date.now(); 
                gameLoop(); 
                startBtn.style.display = 'none'; 
            }
        });
    }
});