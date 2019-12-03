from Models.artists import Artists
from Models.model import Model
from Models.tracks import Tracks
from SpotifyAPI import SpotifyAPI


class MatchCalculator:

    def count_common(self, x, y):
        return 0, 0, 0

    def calculate_denominator(self, x, y):
        return 0

    def calculate_track_value(self, x, y, z, w):
        return 0

    def calculate_artists_value(self, x, y, z, w):
        return 0

    def calculate_total_match(self, x, y):
        return 0


class Users(Model):
    match_value = 0
    threshold = 1

    def __init__(self, spotify_id, access_token, tw_profile, inst_profile):
        super(Users, self).__init__()
        self.spotify_id = spotify_id
        self.access_token = access_token
        self.tw_profile = tw_profile
        self.inst_profile = inst_profile

    def create_user(self):
        cursor = self.get_cursor()
        query = 'INSERT INTO users (spotify_id, access_token, tw_profile, inst_profile) VALUES (%s,%s,%s, %s)'
        cursor.execute(query, (self.spotify_id, self.access_token, self.tw_profile, self.inst_profile))
        self.commit()

    def get_profile(self):
        cursor = self.get_cursor()
        query = 'SELECT tw_profile, inst_profile from users where spotify_id = %s'
        cursor.execute(query, (self.spotify_id,))
        return cursor.fetchall()[0]

    def delete_user_tracks_artists(self):
        cursor = self.get_cursor()
        query = 'DELETE FROM tracks WHERE user_id = %s'
        cursor.execute(query, (self.spotify_id,))
        query = 'DELETE FROM artists WHERE user_id = %s'
        cursor.execute(query, (self.spotify_id,))
        self.commit()

    def update_profile(self):
        cursor = self.get_cursor()
        query = 'UPDATE users SET tw_profile = %s, inst_profile = %s WHERE spotify_id = %s'
        cursor.execute(query, (self.tw_profile, self.inst_profile, self.spotify_id))
        self.commit()

    def get_users_common(self):
        cursor = self.get_cursor()
        query = 'WITH user_songs AS (SELECT spotify_id FROM tracks WHERE user_id = %s), ' \
                'user_artists AS (SELECT spotify_id FROM artists WHERE user_id = %s), ' \
                'common_tracks AS (SELECT user_id FROM tracks WHERE spotify_id IN (SELECT spotify_id FROM user_songs) and user_id != %s), ' \
                'common_artists AS (SELECT user_id FROM artists WHERE spotify_id in (SELECT spotify_id FROM user_artists) and user_id != %s) ' \
                'SELECT coalesce(common_tracks.user_id, common_artists.user_id) as user_id ' \
                'from common_tracks full outer join common_artists on common_tracks.user_id = common_artists.user_id ' \
                'group by common_tracks.user_id, common_artists.user_id'
        cursor.execute(query, (self.spotify_id, self.spotify_id, self.spotify_id, self.spotify_id))
        users = []
        for user in cursor.fetchall():
            users.append(Users(user['user_id'], None, '', ''))
        return users

    def get_user_top_tracks(self):
        cursor = self.get_cursor()
        query = 'SELECT * FROM tracks WHERE user_id = %s'
        cursor.execute(query, (self.spotify_id,))
        tracks = []
        for track_dict in cursor.fetchall():
            tracks.append(
                Tracks(track_dict['spotify_id'], track_dict['term'], track_dict['pos'], track_dict['user_id']))
        return tracks

    def get_user_top_artists(self):
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
        index = 0
        copy_user_objs = user_objs.copy()
        copy_common_objs = common_objs.copy()
        overlap_objs = []

        while index < len(copy_user_objs):
            if index < len(copy_user_objs) - 1:
                chosen_obj = copy_user_objs.pop(index)
                similar_objs = [chosen_obj]
                index -= 1
            j = index
            while j < len(copy_user_objs):
                if chosen_obj == copy_user_objs[j]:
                    similar_objs.append(copy_user_objs.pop(j))
                    j -= 1
                j += 1

            j = 0
            chosen_common_objs = []
            while j < len(copy_common_objs):
                if chosen_obj == copy_common_objs[j]:
                    chosen_common_objs.append(copy_common_objs.pop(j))
                    j -= 1
                j += 1
            if len(chosen_common_objs) > 0:
                overlap_objs.append(similar_objs[0].spotify_id)
                common_obj_count += min(len(similar_objs), len(chosen_common_objs))
                for obj in similar_objs:
                    for common_obj in chosen_common_objs:
                        if obj.term == common_obj.term:
                            common_terms += 1
                        if obj.pos == common_obj.pos:
                            common_positions += 1
            index += 1

        return common_obj_count, common_positions, common_terms, overlap_objs

    # TODO: Refactor _count_common into three different methods
    def calculate_match(self, common_user, common_weight=0.8, common_terms_weight=0.1, common_position_weight=0.1,
                        artist_weight=0.5, track_weight=0.5):
        all_user_tracks = self.get_user_top_tracks()
        all_user_artists = self.get_user_top_artists()

        all_common_user_tracks = common_user.get_user_top_tracks()
        all_common_user_artists = common_user.get_user_top_artists()

        common_tracks, common_tracks_position, common_tracks_terms, overlap_tracks = self._count_common(all_user_tracks, all_common_user_tracks)
        common_artists, common_artists_position, common_artists_term, overlap_artists = self._count_common(all_user_artists, all_common_user_artists)

        denominator_tracks = max(len(all_user_tracks), len(all_common_user_tracks))
        track_value = (common_tracks / denominator_tracks) * common_weight + \
                      (common_tracks_position / denominator_tracks) * common_position_weight + \
                      (common_tracks_terms / denominator_tracks) * common_terms_weight if denominator_tracks > 0 else 0

        denominator_artists = max(len(all_user_artists), len(all_common_user_artists))
        artists_value = (common_artists / denominator_artists) * common_weight + \
                        (common_artists_position / denominator_artists) * common_position_weight + \
                        (common_artists_term / denominator_artists) * common_terms_weight \
            if denominator_artists > 0 else 0

        match_value = (track_value * track_weight + artists_value * artist_weight) * 100

        return match_value if self.__is_match(match_value) else 0

    def overlap_tracks(self, common_user):
        return self.__overlap_objs(self.get_user_top_tracks(), common_user.get_user_top_tracks())

    def overlap_artists(self, common_user):
        return self.__overlap_objs(self.get_user_top_artists(), common_user.get_user_top_artists())

    def __overlap_objs(self, objs, common_objs):
        overlap_objs = []
        for obj in objs:
            if obj in common_objs:
                if obj.spotify_id not in overlap_objs:
                    overlap_objs.append(obj.spotify_id)
        return overlap_objs

    def __is_match(self, value):
        return value > self.threshold
