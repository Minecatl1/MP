1. Update the JavaScript File
We'll add functions to enable shuffling and looping the playlist in scripts.js.

scripts.js:
javascript

Copy
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
2. Update the HTML File
Add buttons for shuffle and loop functionalities in the index.html file.

index.html:
html

Copy
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Music Player</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Music Player</h1>
        <select id="song-selector"></select>
        <div class="controls">
            <button id="play-btn">Play</button>
            <button id="stop-btn">Stop</button>
            <button id="next-btn">Next</button>
            <button id="shuffle-btn">Shuffle Off</button>
            <button id="loop-btn">Loop Off</button>
        </div>
        <img id="album-art" src="" alt="Album Art">
    </div>
    <script src="scripts.js"></script>
</body>
</html>
3. Update the CSS File
Make sure the new buttons are styled consistently in styles.css.

styles.css:
css

Copy
/* styles.css */

body {
    font-family: Arial, sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background: linear-gradient(to right, #6a11cb, #2575fc);
    margin: 0;
}

.container {
    background-color: rgba(255, 255, 255, 0.9);
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    text-align: center;
    width: 300px;
}

input[type="file"], select {
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    box-sizing: border-box;
}

button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin: 5px;
}

button:hover {
    background-color: #45a049;
}

img {
    width: 200px;
    height: 200px;
    object-fit: cover;
    margin-top: 20px;
}

h1, h2 {
    color: #ffffff;
}

select, input {
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 5px;
}

button {
    background: #6a11cb;
    background: -webkit-linear-gradient(to right, #6a11cb, #2575fc);
    background: linear-gradient(to right, #6a11cb, #2575fc);
}

button:hover {
    background-color: #5a10bb;
}

li {
    padding: 5px;
    color: #333;
}
This enhanced music player now includes shuffle and loop functionality, allowing users to play songs in a random order or continuously loop through the playlist.

Feel free to customize further or let me know if there's anything specific you want to add