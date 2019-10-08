from flask import jsonify

from Handlers.Handler import Handler
from Models.tracks import Tracks
from Models.users import Users


class UserHandler(Handler):

    model = Users()

    def create_user(self, json_dict):
        access_token = json_dict['access_token']
        refresh_token = json_dict['refresh_token']
        print(access_token)
        print(refresh_token)
        print(json_dict)

        spotify_id = self.SpotifyAPI.get_user(access_token)['id']
        self.model.create_user(spotify_id, access_token, refresh_token)

        tracks = self.SpotifyAPI.get_user_tracks(access_token)
        for track in tracks:
            track_id = track[0]
            term = track[1]
            pos = track[2]
            Tracks().create_track(track_id, spotify_id, term, pos)


        return jsonify()
