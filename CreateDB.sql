CREATE TABLE Users (
    spotify_id INTEGER PRIMARY KEY,
    access_token VARCHAR(500),
    refresh_token VARCHAR(500)
);

CREATE TABLE Tracks (
    tid SERIAL PRIMARY KEY,
    spotify_id INTEGER,
    term INTEGER,
    pos INTEGER
);

CREATE TABLE Artists(
spotify_id INTEGER PRIMARY KEY
);

CREATE TABLE User_tracks (
   user_id INTEGER REFERENCES Users (spotify_id),
   track_id INTEGER REFERENCES Tracks (tid)

);

CREATE TABLE User_artists (
   user_id INTEGER REFERENCES Users (spotify_id),
   artist_id INTEGER REFERENCES Artists (spotify_id),
   position INTEGER NOT NULL
);

