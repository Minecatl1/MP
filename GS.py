import os
import json

# Directory where the songs are stored
songs_dir = 'assets/'

# Get the list of songs
songs = [f for f in os.listdir(songs_dir) if f.endswith(('.mp3', '.wav'))]

# Create a dictionary with song names and paths
songs_data = []
for song in songs:
    try:
        name, author = song.replace('.mp3', '').replace('.wav', '').split(' - ')
        songs_data.append({
            'name': name,
            'author': author,
            'path': songs_dir + song
        })
    except ValueError:
        print(f"Skipping file with unexpected format: {song}")

# Write the dictionary to a JSON file
with open('songs.json', 'w') as json_file, open('skipped_songs.txt', 'w') as skipped_file:
    json.dump(songs_data, json_file, indent=4)
    print("songs.json file has been created.")
    for song in songs:
        if song not in [item['path'].replace(songs_dir, '') for item in songs_data]:
            skipped_file.write(f"Skipped: {song}\n")
    print("List of skipped files has been created in skipped_songs.txt")
