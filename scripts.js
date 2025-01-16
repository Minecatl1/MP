const fileInput = document.getElementById('file-input');
const playlistElement = document.getElementById('playlist');
const playButton = document.getElementById('play-btn');
const stopButton = document.getElementById('stop-btn');
const nextButton = document.getElementById('next-btn');
const albumArt = document.getElementById('album-art');

let playlist = [];
let currentSongIndex = 0;
let audio = new Audio();

fileInput.addEventListener('change', (event) => {
    const files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        playlist.push(files[i]);
        const listItem = document.createElement('li');
        listItem.textContent = files[i].name;
        listItem.addEventListener('click', () => {
            currentSongIndex = i;
            loadSong();
        });
        playlistElement.appendChild(listItem);
    }
});

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
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong();
});

audio.addEventListener('ended', () => {
    currentSongIndex = (currentSongIndex + 1) % playlist.length;
    loadSong();
});

function loadSong() {
    const song = playlist[currentSongIndex];
    audio.src = URL.createObjectURL(song);
    audio.play();
    updateAlbumArt(song);
}

function updateAlbumArt(song) {
    const albumArtPath = song.name.replace('.mp3', '.jpg');
    albumArt.src = albumArtPath;
}