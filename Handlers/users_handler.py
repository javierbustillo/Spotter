from flask import jsonify

from Handlers.Handler import Handler
from Entities.users import Users


class UserHandler(Handler):
    model = Users

    def _add_objs(self, access_token):
        tops = self.SpotifyAPI.get_user_top_tracks_artists(access_token)
        for top in tops:
            top.create()

    def create_user(self, access_token, tw_profile, inst_profile):
        spotify_id = self.SpotifyAPI.get_user_info(access_token)['id']
        user = Users(spotify_id, access_token, tw_profile, inst_profile)
        try:
            user.create_user()
        except:
            return jsonify(msg='user already exists'), 400
        self._add_objs(access_token)
        return user

    def create_tmp_id(self, access_token):
        spotify_id = self.SpotifyAPI.get_user_info(access_token)["id"]
        user = Users(spotify_id, access_token, None, None)
        return user.create_tmp_id()

    def get_user(self, access_token):
        spotify_id = self.SpotifyAPI.get_user_info(access_token)['id']
        user = Users(spotify_id, access_token, None, None)
        return user.get_profile()

    def update_user(self, access_token):
        spotify_id = self.SpotifyAPI.get_user_info(access_token)['id']
        user = Users(spotify_id, access_token, None, None)
        user.delete_user_tracks_artists()
        self._add_objs(access_token)

    def update_profile(self, access_token, tw_profile, inst_profile):
        spotify_id = self.SpotifyAPI.get_user_info(access_token)['id']
        user = Users(spotify_id, access_token, tw_profile, inst_profile)
        user.update_profile()

    def get_matches(self, access_token):
        spotify_id = self.SpotifyAPI.get_user_info(access_token)['id']
        user = Users(spotify_id, None, None, None)
        users_common = user.get_users_common()

        matches = []
        for common_user in users_common:
            match_value = user.calculate_match(common_user)
            if match_value > 0:
                common_user.match_value = match_value
                matches.append(common_user)
                common_user.overlap_tracks = user.overlap_tracks(common_user)
                common_user.overlap_artists = user.overlap_artists(common_user)

        matches.sort(key=lambda x: x.match_value, reverse=True)
        return matches

    def get_match(self, tmp_id, access_token):
        spotify_id = self.SpotifyAPI.get_user_info(access_token)['id']
        user = Users(spotify_id, None, None, None)

        token_to_cmp = Users(None, None, None, None).get_token_by_tmp_id(tmp_id)
        spotify_id_cmp = self.SpotifyAPI.get_user_info(token_to_cmp)['id']
        user_cmp = Users(spotify_id_cmp, None, None, None)

        match_value = user.calculate_match(user_cmp)
        user_cmp.match_value = match_value
        user_cmp.overlap_artists = user.overlap_artists(user_cmp)
        user_cmp.overlap_tracks = user.overlap_tracks(user_cmp)

        return user_cmp
