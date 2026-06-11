// file: beatmap.js

/**
 * DATA BEATMAP (LEVEL 1)
 * time : posisi ketukan dalam milidetik (ms). 1000 ms = 1 detik.
 * lane : jalur not. 0 = Baris Atas, 1 = Baris Bawah.
 * * Di tempo 120 BPM, jarak antar 1 ketuk penuh (not 1/4) adalah 500ms.
 */
const levelSatu = [
    // --- HALAMAN 1 (0ms - 4000ms) ---
    { time: 1000, lane: 0 }, // Detik ke-1 (Atas)
    { time: 1500, lane: 0 }, // Detik ke-1.5 (Atas)
    { time: 2000, lane: 1 }, // Detik ke-2 (Bawah)
    { time: 2500, lane: 1 }, // Detik ke-2.5 (Bawah)
    { time: 3000, lane: 0 }, // Detik ke-3 (Atas)
    { time: 3250, lane: 0 }, // Detik ke-3.25 (Atas - Not 1/8 Cepat)
    { time: 3500, lane: 1 }, // Detik ke-3.5 (Bawah)

    // --- HALAMAN 2 (4000ms - 8000ms) ---
    { time: 4500, lane: 0 }, // Detik ke-4.5 (Atas)
    { time: 5000, lane: 0 }, // Detik ke-5 (Atas - Barengan)
    { time: 5000, lane: 1 }, // Detik ke-5 (Bawah - Barengan)
    { time: 6000, lane: 1 }  // Detik ke-6 (Bawah)
];// JavaScript source code
