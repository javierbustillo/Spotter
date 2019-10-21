CREATE TABLE Users (
    spotify_id VARCHAR(500) PRIMARY KEY,
    access_token VARCHAR(500),
    refresh_token VARCHAR(500)
);

CREATE TABLE Tracks (
    tid SERIAL PRIMARY KEY,
    spotify_id VARCHAR(500),
    term INTEGER,
    pos INTEGER,
    user_id varchar(500) REFERENCES Users (spotify_id)

);

CREATE TABLE Artists(
    aid SERIAL PRIMARY KEY,
    spotify_id VARCHAR(500),
    term INTEGER,
    pos INTEGER,
    user_id varchar(500) REFERENCES Users (spotify_id)
    );
