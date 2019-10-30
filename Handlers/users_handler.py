from flask import jsonify

from Handlers.Handler import Handler
from Models.users import Users


class UserHandler(Handler):
    model = Users

    def create_user(self, json_dict):
        access_token = json_dict['access_token']
        refresh_token = json_dict['refresh_token']

        spotify_id = self.SpotifyAPI.get_user(access_token)['id']
        user = Users(spotify_id, access_token, refresh_token)
        user.create_user()

        tops = self.SpotifyAPI.get_user_top(access_token)
        for top in tops:
            top.create()
        return jsonify(msg='Created')

    def get_matches(self, dict):
        # First get the list of users that match
        access_token = dict['access_token']
        spotify_id = self.SpotifyAPI.get_user(access_token)['id']
        user = Users(spotify_id, None, None)
        users_common = user.get_users_common()

        # Calculate and store the match for each, maybe discard if value is less than threshold
        matches = []
        for common_user in users_common:
            common_user.match_value = user.calculate_match(common_user)
            matches.append(common_user)

        matches.sort(key=lambda x: x.match_value, reverse=True)
        dict_match = []
        for match in matches:
            match_dict = match.__dict__
            match_dict.pop('conn')
            match_dict.pop('URL')
            dict_match.append(match_dict)
        return jsonify(dict_match)
