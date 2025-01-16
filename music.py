import pygame
from mutagen.mp3 import MP3
from PIL import Image, ImageTk
import tkinter as tk
from tkinter import filedialog
import os

# Initialize Pygame
pygame.mixer.init()

# Initialize Tkinter
root = tk.Tk()
root.title("Music Player")
root.geometry("600x400")

# Define Playlist and Current Song Index
playlist = []
current_song_index = 0

# Function to Add Songs to Queue
def add_songs_to_queue():
    songs = filedialog.askopenfilenames(filetypes=(("Audio Files", "*.mp3;*.wav"),))
    for song in songs:
        playlist.append(song)
    update_playlist_display()

# Update Playlist Display
def update_playlist_display():
    playlist_box.delete(0, tk.END)
    for song in playlist:
        playlist_box.insert(tk.END, os.path.basename(song))

# Load and Play a Song
def load_song():
    global song
    song = playlist[current_song_index]
    if song.endswith('.mp3'):
        audio = MP3(song)
        song_length = audio.info.length
    else:
        song_length = pygame.mixer.Sound(song).get_length()
    pygame.mixer.music.load(song)
    play_song()

# Play Song
def play_song():
    if playlist:
        pygame.mixer.music.play()
        load_album_art()
        pygame.mixer.music.set_endevent(pygame.USEREVENT)
    else:
        print("No songs in the playlist.")

# Stop Song
def stop_song():
    pygame.mixer.music.stop()

# Next Song
def next_song():
    global current_song_index
    current_song_index = (current_song_index + 1) % len(playlist)
    load_song()

# Load and Display Album Art
def load_album_art():
    global img
    # For simplicity, assume the image is in the same directory as the song
    album_art_path = song.replace('.mp3', '.jpg')  # or any specific logic to find the image
    img = Image.open(album_art_path)
    img = img.resize((200, 200), Image.ANTIALIAS)
    img = ImageTk.PhotoImage(img)
    album_art_label.config(image=img)
    album_art_label.image = img

# Check for Next Song Event
def check_for_next_song(event):
    if event.type == pygame.USEREVENT:
        next_song()

# Bind Event for Song End
root.bind('<space>', check_for_next_song)

# Add Menu Bar
menu_bar = tk.Menu(root)
root.config(menu=menu_bar)
add_song_menu = tk.Menu(menu_bar, tearoff=0)
menu_bar.add_cascade(label="Add Songs", menu=add_song_menu)
add_song_menu.add_command(label="Add Songs to Queue", command=add_songs_to_queue)

# Create Playlist Box
playlist_box = tk.Listbox(root, width=50)
playlist_box.pack(pady=20)

# Create Album Art Label
album_art_label = tk.Label(root)
album_art_label.pack(pady=20)

# Create Buttons
load_button = tk.Button(root, text="Load Song", command=load_song)
load_button.pack(pady=10)
play_button = tk.Button(root, text="Play Song", command=play_song)
play_button.pack(pady=10)
stop_button = tk.Button(root, text="Stop Song", command=stop_song)
stop_button.pack(pady=10)
next_button = tk.Button(root, text="Next Song", command=next_song)
next_button.pack(pady=10)

# Run the Tkinter Main Loop
root.mainloop()
