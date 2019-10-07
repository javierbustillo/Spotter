import requests
import json


class SpotifyAPI:

    base_url = 'https://api.spotify.com/v1'

    def request_data(self, url, token=None):
        header = {'Authorization': 'Bearer ' + token} if token else None
        response = requests.get(self.base_url + url, headers=header)
        return json.loads(response.text)

    def get_user(self, access_token):
        user_info = self.request_data('/me', access_token)
        return user_info

    def get_user_tracks(self, token):
        # TODO: THIS
        ranges = ['long_term', 'medium_term', 'short_term']
        user_tracks = []
        for range in ranges:
            tracks = self.request_data('/me/top/tracks?time_range=%s&limit=50' % range, token)['items']
            for position, track in enumerate(tracks):
                spotify_id = track['id']
                if range == 'short_term':
                    range_int = 0
                elif range == 'medium_term':
                    range_int = 1
                else:
                    range_int = 2
                user_tracks.append((spotify_id, range_int, position))
        return user_tracks



    def get_user_artists(self, token):
        pass

