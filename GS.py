import os
import json

# Directory where the songs are stored
songs_dir = 'assets/'

# Get the list of songs
songs = [f for f in os.listdir(songs_dir) if f.endswith(('.mp3', '.wav'))]

# Create a dictionary with song names and paths
songs_data = [{'name': song, 'path': songs_dir + song} for song in songs]

# Write the dictionary to a JSON file
with open('songs.json', 'w') as json_file:
    json.dump(songs_data, json_file, indent=4)

print("songs.json file has been created.")