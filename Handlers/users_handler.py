from flask import jsonify

from Handlers.Handler import Handler
from Models.tracks import Tracks
from Models.users import Users


class UserHandler(Handler):

    model = Users()

    def create_user(self, json_dict):
        access_token = json_dict['access_token']
        refresh_token = json_dict['refresh_token']

        spotify_id = self.SpotifyAPI.get_user(access_token)['id']
        self.model.create_user(spotify_id, access_token, refresh_token)

        tops = self.SpotifyAPI.get_user_top(access_token)
        for top in tops:
            top.create(spotify_id)
        return jsonify(msg='Created')
