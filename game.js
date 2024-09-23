const socket = io();
socket.on('connect', () => {
  console.log('Connected to server');
});

// Ambil elemen HTML
const wordDisplay = document.getElementById('word-display');
const inputField = document.getElementById('input-field');
const progressDisplay = document.getElementById('progress');
const opponentProgressDisplay = document.getElementById('opponent-progress');
const muteButton = document.getElementById('mute-button');

// Audio Elements
const correctSound = new Audio('/sounds/correct.mp3');
const finishSound = new Audio('/sounds/finish.mp3');
const backgroundMusic = new Audio('/sounds/background.mp3');

backgroundMusic.loop = true; // Musik akan diputar terus-menerus
backgroundMusic.volume = 0.5; // Setel volume awal

let isMuted = false;
let isMuteButtonActive = true; // Menghindari banyak klik

muteButton.addEventListener('click', () => {
  if (isMuteButtonActive) {
    isMuteButtonActive = false; // Menonaktifkan tombol sementara
    if (isMuted) {
      backgroundMusic.play().catch((error) => {
        console.log('Error playing background music:', error);
      });
      muteButton.innerText = 'Mute';
    } else {
      backgroundMusic.pause();
      muteButton.innerText = 'Unmute';
    }
    isMuted = !isMuted;
    setTimeout(() => {
      isMuteButtonActive = true; // Mengaktifkan kembali tombol setelah 200ms
    }, 200);
  }
});

let words = [];
let currentWordIndex = 0;
const totalWords = 15; // Batas kata hanya 15

// Ambil daftar kata dari file JSON
fetch('/words.json')
  .then(response => response.json())
  .then(data => {
    words = data;
    wordDisplay.innerText = getRandomWord(); // Tampilkan kata pertama yang acak
  })
  .catch(error => {
    console.error('Error loading words:', error);
  });

function getRandomWord() {
  return words[Math.floor(Math.random() * words.length)];
}

inputField.addEventListener('input', () => {
  const typedWord = inputField.value.trim();

  if (typedWord === wordDisplay.innerText) { // Periksa kata yang sedang ditampilkan
    currentWordIndex++;
    inputField.value = ''; // Kosongkan input

    correctSound.play().catch((error) => {
      console.log('Error playing correct sound:', error);
    });

    if (currentWordIndex < totalWords) {
      wordDisplay.innerText = getRandomWord(); // Tampilkan kata baru
    } else {
      finishGame();
    }

    const progress = Math.floor((currentWordIndex / totalWords) * 100);
    progressDisplay.innerText = `Your progress: ${progress}%`;
    socket.emit('typingProgress', progress);
  }
});

function finishGame() {
  wordDisplay.innerText = 'Finished!'; // Tampilkan pesan selesai
  finishSound.play().catch((error) => {
    console.log('Error playing finish sound:', error);
  });
  backgroundMusic.pause(); // Hentikan musik saat game selesai
  inputField.disabled = true; // Menonaktifkan input field
}

socket.on('opponentProgress', (progress) => {
  opponentProgressDisplay.innerText = `Opponent progress: ${progress}%`;
});

// Pause musik ketika tab tidak aktif
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    backgroundMusic.pause();
  } else {
    if (!isMuted) {
      backgroundMusic.play().catch((error) => {
        console.log('Error playing background music:', error);
      });
    }
  }
});

// Memulai musik latar setelah interaksi pengguna
document.addEventListener('click', () => {
  backgroundMusic.play().catch((error) => {
    console.log('Error playing background music:', error);
  });
});
