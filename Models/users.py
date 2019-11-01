from Models.artists import Artists
from Models.model import Model
from Models.tracks import Tracks


class Users(Model):
    match_value = 0
    threshold = 1

    def __init__(self, spotify_id, access_token, refresh_token):
        super(Users, self).__init__()
        self.spotify_id = spotify_id
        self.access_token = access_token
        self.refresh_token = refresh_token

    def create_user(self):
        cursor = self.get_cursor()
        query = 'INSERT INTO users (spotify_id, access_token, refresh_token) VALUES (%s,%s,%s)'
        cursor.execute(query, (self.spotify_id, self.access_token, self.refresh_token))
        self.commit()

    def get_users_common(self):
        cursor = self.get_cursor()
        query = 'WITH user_songs AS (SELECT spotify_id FROM tracks WHERE user_id = %s), ' \
                'user_artists AS (SELECT spotify_id FROM artists WHERE user_id = %s), ' \
                'common_tracks AS (SELECT user_id FROM tracks WHERE spotify_id IN (SELECT spotify_id FROM user_songs) and user_id != %s), ' \
                'common_artists AS (SELECT user_id FROM artists WHERE spotify_id in (SELECT spotify_id FROM user_artists) and user_id != %s) ' \
                'SELECT coalesce(common_tracks.user_id, common_artists.user_id) as user_id from common_tracks full outer join common_artists on common_tracks.user_id = common_artists.user_id group by common_tracks.user_id, common_artists.user_id' \

        cursor.execute(query, (self.spotify_id, self.spotify_id, self.spotify_id, self.spotify_id))
        users = []
        for user in cursor.fetchall():
            users.append(Users(user['user_id'], None, None))
        return users

    def get_user_tracks(self):
        cursor = self.get_cursor()
        query = 'SELECT * FROM tracks WHERE user_id = %s'
        cursor.execute(query, (self.spotify_id,))
        tracks = []
        for track_dict in cursor.fetchall():
            tracks.append(
                Tracks(track_dict['spotify_id'], track_dict['term'], track_dict['pos'], track_dict['user_id']))
        return tracks

    def get_user_artists(self):
        cursor = self.get_cursor()
        query = 'SELECT * FROM artists WHERE user_id = %s'
        cursor.execute(query, (self.spotify_id,))
        artists = []
        for artist_dict in cursor.fetchall():
            artists.append(
                Artists(artist_dict['spotify_id'], artist_dict['term'], artist_dict['pos'], artist_dict['user_id']))
        return artists

    @staticmethod
    def _count_common(user_objs, common_objs):
        common_obj_count = 0
        common_positions = 0
        common_terms = 0

        for obj in user_objs:
            if obj in common_objs:
                common_obj_count += 1
                for common_obj in common_objs:
                    if common_obj == obj:
                        if common_obj.pos == obj.pos:
                            common_positions += 1
                        if common_obj.term == obj.term:
                            common_terms += 1
        return common_obj_count, common_positions, common_terms

    def calculate_match(self, common_user):
        all_user_tracks = self.get_user_tracks()
        all_user_artists = self.get_user_artists()

        all_common_user_tracks = common_user.get_user_tracks()
        all_common_user_artists = common_user.get_user_artists()

        common_tracks, common_tracks_position, common_tracks_terms = self._count_common(all_user_tracks,
                                                                                        all_common_user_tracks)
        common_artists, common_artists_position, common_artists_term = self._count_common(all_user_artists,
                                                                                          all_common_user_artists)

        denominator_tracks = min(len(all_user_tracks), len(all_common_user_tracks))
        track_value = (common_tracks / denominator_tracks) * 0.8 + (
                common_tracks_position / denominator_tracks) * 0.1 + (common_tracks_terms / denominator_tracks) * 0.1 if denominator_tracks > 0 else 0

        denominator_artists = min(len(all_user_artists), len(all_common_user_artists))
        artists_value = (common_artists / denominator_artists) * 0.8 + \
                        (common_artists_position / denominator_artists) * 0.1 + (
                                    common_artists_term / denominator_artists) * 0.1 if denominator_artists > 0 else 0

        match_value = (track_value * 0.5 + artists_value * 0.5) * 100

        if self.__is_match(match_value):
            common_user.match_value = match_value
        else:
            common_user.match_value = 0

    def __is_match(self, value):
        return value > self.threshold
