from Models.artists import Artists
from Models.model import Model
from Models.tracks import Tracks


class Users(Model):

    match_value = 0

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
                'SELECT user_id from common_tracks natural join common_artists group by user_id' \

        cursor.execute(query, (self.spotify_id, self.spotify_id, self.spotify_id, self.spotify_id))
        users = []
        for user in cursor.fetchall():
            users.append(Users(user['user_id'], None, None))
        return users

    def get_user_tracks(self):
        # TODO: REFACTOR TRACKS AND ARTISTS TO HAVE FOREIGN KEY
        cursor = self.get_cursor()
        query = 'SELECT * FROM tracks WHERE user_id = %s'
        cursor.execute(query, (self.spotify_id, ))
        tracks = []
        for track_dict in cursor.fetchall():
            tracks.append(Tracks(track_dict['spotify_id'], track_dict['term'], track_dict['pos'], track_dict['user_id']))
        return tracks

    def get_user_artists(self):
        # TODO: REFACTOR TRACKS AND ARTISTS TO HAVE FOREIGN KEY
        cursor = self.get_cursor()
        query = 'SELECT * FROM artists WHERE user_id = %s'
        cursor.execute(query, (self.spotify_id, ))
        artists = []
        for artist_dict in cursor.fetchall():
            artists.append(Artists(artist_dict['spotify_id'], artist_dict['term'], artist_dict['pos'], artist_dict['user_id']))
        return artists

    @staticmethod
    def _divide_in_terms(objs):
        short_term = []
        medium_term = []
        long_term = []

        for obj in objs:
            if obj.term == 0:
                short_term.append(obj)
            elif obj.term == 1:
                medium_term.append(obj)
            else:
                long_term.append(obj)

        return short_term, medium_term, long_term

    @staticmethod
    def _count_common(user_objs, common_objs):
        common_obj_count = 0
        common_positions = 0
        for index in range(min(len(user_objs), len(common_objs))):
            if user_objs[index].spotify_id == common_objs[index].spotify_id:
                common_obj_count += 1
            if user_objs[index].pos == common_objs[index].pos:
                common_positions += 1
        return common_obj_count, common_positions

    def calculate_match(self, common_user):
        all_user_tracks = self.get_user_tracks()
        all_user_artists = self.get_user_artists()

        all_common_user_tracks = common_user.get_user_tracks()
        all_common_user_artists = common_user.get_user_artists()

        user_track_terms = self._divide_in_terms(all_user_tracks)
        user_artists_terms = self._divide_in_terms(all_user_artists)

        common_user_tracks_terms = self._divide_in_terms(all_common_user_tracks)
        common_user_artists_terms = self._divide_in_terms(all_common_user_artists)

        track_term_values = []
        artists_term_values = []
        for term in range(3):
            user_tracks = sorted(user_track_terms[term], key=lambda x: x.spotify_id, reverse=True)
            user_artists = sorted(user_artists_terms[term], key=lambda x: x.spotify_id, reverse=True)

            common_user_tracks = sorted(common_user_tracks_terms[term], key=lambda x: x.spotify_id, reverse=True)
            common_user_artists = sorted(common_user_artists_terms[term], key=lambda x: x.spotify_id, reverse=True)

            common_tracks, common_tracks_position = self._count_common(user_tracks, common_user_tracks)
            common_artists, common_artists_position = self._count_common(user_artists, common_user_artists)

            denominator_tracks = min(len(user_tracks), len(common_user_tracks))
            term_value_tracks = (common_tracks / denominator_tracks) * 0.8 + (
                    common_tracks_position / denominator_tracks) * 0.2

            denominator_artists = min(len(user_artists), len(common_user_artists))
            term_value_artists = (common_artists / denominator_artists) * 0.8 + \
                                 (common_artists_position / denominator_artists) * 0.2

            track_term_values.append(term_value_tracks)
            artists_term_values.append(term_value_artists)

        track_term_values.sort()
        artists_term_values.sort()
        track_value = track_term_values[0] * 0.6 + track_term_values[1] * 0.2 + track_term_values[2] * 0.2
        artists_value = artists_term_values[0] * 0.6 + artists_term_values[1] * 0.2 + artists_term_values[2] * 0.2

        match_value = (track_value * 0.5 + artists_value * 0.5)*100
        return match_value
