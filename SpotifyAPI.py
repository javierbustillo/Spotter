import requests
import json

from Models.artists import Artists
from Models.tracks import Tracks


class SpotifyAPI:

    base_url = 'https://api.spotify.com/v1'

    def request_data(self, url, token=None):
        header = {'Authorization': 'Bearer ' + token} if token else None
        response = requests.get(self.base_url + url, headers=header)
        return json.loads(response.text)

    def get_user(self, access_token):
        user_info = self.request_data('/me', access_token)
        return user_info

    def get_user_top(self, token, type_of_top=None):
        enumerated = enumerate
        user_id = self.get_user(token)['id']
        ranges = ['long_term', 'medium_term', 'short_term']
        users_tops = []
        types = [type_of_top] if type_of_top is not None else ['artists', 'tracks']
        for type_top in types:
            for term in ranges:
                tops = self.request_data('/me/top/%s?time_range=%s&limit=50' % (type_top, term), token)['items']
                for position, top in enumerated(tops):
                    spotify_id = top['id']
                    if term == 'short_term':
                        term_int = 0
                    elif term == 'medium_term':
                        term_int = 1
                    else:
                        term_int = 2
                    obj = Artists if type_top == 'artists' else Tracks
                    top_obj = obj(spotify_id, term_int, position, user_id)
                    users_tops.append(top_obj)
        return users_tops

    def get_user_tracks(self, token):
        return self.get_user_top(token, 'tracks')

    def get_user_artists(self, token):
        return self.get_user_top(token, 'artists')

