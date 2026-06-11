
document.addEventListener('DOMContentLoaded', () => {
    
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 400;
    const LANE_TOP_Y = 120;    
    const LANE_BOTTOM_Y = 280; 
    const MEASURE_DURATION = 4000;
    
    const comboUI = document.getElementById('combo');
    const accuracyUI = document.getElementById('accuracy');
    const startBtn = document.getElementById('startBtn');

    let currentMap = []; 
    let isPlaying = false;
    let startTime = 0;

    let combo = 0;
    let totalAccuracyScore = 0; 
    let totalNotesProcessed = 0; 

    function initGame() {
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

    function drawStaff(y) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.strokeStyle = "#7f8c8d"; 
        ctx.lineWidth = 3;
        ctx.stroke();
    }

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

    window.addEventListener('keydown', (e) => {
        if (!isPlaying || e.repeat) return; 

        let elapsedTime = Date.now() - startTime;
        let nearestNote = null;
        let minDiff = Infinity;

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
            else {
                combo = 0;
            }
        }
        updateUI();
    });

    function gameLoop() {
        if (!isPlaying) return;

        let elapsedTime = Date.now() - startTime;

        if (currentMap.length > 0) {
            let lastNote = currentMap[currentMap.length - 1];
            if (elapsedTime > lastNote.time + 1500) {
                isPlaying = false;
                
                ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
                ctx.fillStyle = "#2c3e50";
                ctx.font = "bold 40px Arial";
                ctx.textAlign = "center";
                ctx.fillText("GAME SELESAI!", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 30);
                
                let finalAcc = totalNotesProcessed === 0 ? "0.00" : (totalAccuracyScore / totalNotesProcessed).toFixed(2);
                ctx.font = "24px Arial";
                ctx.fillText("Akurasi Akhir: " + finalAcc + "%", CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 20);
                ctx.fillText("Total Kombo Tertinggi: " + combo, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 60);

                if (startBtn) {
                    startBtn.style.display = 'inline-block';
                    startBtn.innerText = 'Main Lagi';
                }
                return;
            }
        }

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

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawStaff(LANE_TOP_Y);
        drawStaff(LANE_BOTTOM_Y);
        drawNotes(elapsedTime);
        drawScanline(elapsedTime); 

        requestAnimationFrame(gameLoop);
    }

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
