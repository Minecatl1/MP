const songSelector = document.getElementById('song-selector');
const playButton = document.getElementById('play-btn');
const stopButton = document.getElementById('stop-btn');
const nextButton = document.getElementById('next-btn');
const shuffleButton = document.getElementById('shuffle-btn');
const loopButton = document.getElementById('loop-btn');
const albumArt = document.getElementById('album-art');

let playlist = [];
let currentSongIndex = 0;
let audio = new Audio();
let isShuffling = false;
let isLooping = false;

fetch('songs.json')
    .then(response => response.json())
    .then(data => {
        playlist = data;
        playlist.forEach((song, index) => {
            const option = document.createElement('option');
            option.value = song.path;
            option.text = song.name;
            songSelector.appendChild(option);
        });
        songSelector.addEventListener('change', (event) => {
            currentSongIndex = event.target.selectedIndex;
            loadSong();
        });
    })
    .catch(error => console.error('Error fetching song data:', error));

playButton.addEventListener('click', () => {
    if (audio.src) {
        audio.play();
    } else if (playlist.length > 0) {
        loadSong();
    }
});

stopButton.addEventListener('click', () => {
    audio.pause();
    audio.currentTime = 0;
});

nextButton.addEventListener('click', () => {
    nextSong();
});

shuffleButton.addEventListener('click', () => {
    isShuffling = !isShuffling;
    shuffleButton.textContent = isShuffling ? 'Shuffle On' : 'Shuffle Off';
});

loopButton.addEventListener('click', () => {
    isLooping = !isLooping;
    loopButton.textContent = isLooping ? 'Loop On' : 'Loop Off';
});

audio.addEventListener('ended', () => {
    nextSong();
});

function loadSong() {
    const song = playlist[currentSongIndex];
    audio.src = song.path;
    audio.play();
    updateAlbumArt(song);
}

function updateAlbumArt(song) {
    const albumArtPath = song.path.replace('.mp3', '.jpg').replace('.wav', '.jpg');
    albumArt.src = albumArtPath;
}

function nextSong() {
    if (isShuffling) {
        currentSongIndex = Math.floor(Math.random() * playlist.length);
    } else {
        currentSongIndex = (currentSongIndex + 1) % playlist.length;
    }
    loadSong();
    if (!isLooping && currentSongIndex === 0) {
        audio.pause();
    }
}