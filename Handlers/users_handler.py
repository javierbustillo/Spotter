from flask import jsonify

from Handlers.Handler import Handler
from Models.users import Users


class UserHandler(Handler):
    model = Users

    def create_user(self, json_dict):
        access_token = json_dict['access_token']
        refresh_token = json_dict['refresh_token']
        spotify_id = self.SpotifyAPI.get_user_info(access_token)['id']
        user = Users(spotify_id, access_token, refresh_token)
        try:
            user.create_user()
        except:
            return jsonify(msg='user already exists'), 400
        tops = self.SpotifyAPI.get_user_top_tracks_artists(access_token)
        for top in tops:
            top.create()
        return jsonify(msg='Created')

    def update_user_tracks_artists(self, json_dict):
        access_token = json_dict['access_token']
        refresh_token = json_dict['refresh_token']
        spotify_id = self.SpotifyAPI.get_user_info(access_token)['id']
        user = Users(spotify_id, access_token, refresh_token)

    def get_matches(self, dict):
        # First get the list of users that match
        access_token = dict['access_token']
        spotify_id = self.SpotifyAPI.get_user_info(access_token)['id']
        user = Users(spotify_id, None, None)
        users_common = user.get_users_common()

        # Calculate the match value for each match
        matches = []
        for common_user in users_common:
            # TODO: Updated the return of calculate_match
            user.calculate_match(common_user)
            if common_user.match_value > 0:
                matches.append(common_user)

        matches.sort(key=lambda x: x.match_value, reverse=True)
        dict_match = []
        # TODO: Move this into application layer
        for match in matches:
            match_dict = match.__dict__
            match_dict.pop('conn')
            match_dict.pop('URL')
            user_info = self.SpotifyAPI.get_user_by_id(access_token, match.spotify_id)
            match_dict['display_name'] = user_info['display_name']
            match_dict['profile_picture'] = user_info['images']
            dict_match.append(match_dict)
        return jsonify(dict_match)
