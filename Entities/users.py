from Entities.artists import Artists
from Entities.entity import Entity
from Entities.tracks import Tracks


class MatchCalculator:

    def __init__(self, common_weight=0.8, common_terms_weight=0.1, common_position_weight=0.1, artist_weight=0.8, track_weight=0.2):
        self.common_weight = common_weight
        self.common_terms_weight = common_terms_weight
        self.common_position_weight = common_position_weight
        self.artist_weight = artist_weight
        self.track_weight = track_weight
    
    def calculate_denominator(self, obj_list_x, obj_list_y):
        return max(len(obj_list_x), len(obj_list_y))

    def calculate_track_or_artist_value(self, common_objs, common_positions, common_terms, denominator):
        return (common_objs / denominator) * self.common_weight + \
                      (common_positions / denominator) * self.common_position_weight + \
                      (common_terms / denominator) * self.common_terms_weight if denominator > 0 else 0

    def calculate_total_match(self, track_value, artist_value):
        return (track_value * self.track_weight + artist_value * self.artist_weight) * 100

    @staticmethod
    def count_common(user_objs, common_objs):
        common_obj_count = 0
        common_positions = 0
        common_terms = 0
        index = 0
        copy_user_objs = user_objs.copy()
        copy_common_objs = common_objs.copy()

        while len(copy_user_objs) > 0:
            chosen_obj = copy_user_objs.pop(index)
            similar_objs = [chosen_obj]
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
                common_obj_count += min(len(similar_objs), len(chosen_common_objs))
                for obj in similar_objs:
                    for common_obj in chosen_common_objs:
                        if obj.term == common_obj.term:
                            common_terms += 1
                        if obj.pos == common_obj.pos:
                            common_positions += 1

        return common_obj_count, common_positions, common_terms


class Users(Entity):
    match_value = 0
    threshold = 1
    calculator = MatchCalculator()

    def __init__(self, spotify_id, access_token, tw_profile, inst_profile):
        super(Users, self).__init__()
        self.spotify_id = spotify_id
        self.access_token = access_token
        self.tw_profile = tw_profile
        self.inst_profile = inst_profile
        if not tw_profile and not inst_profile:
            profile = self.get_profile()
            self.tw_profile = profile['tw_profile']
            self.inst_profile = profile['inst_profile']

    def create_user(self):
        cursor = self.get_cursor()
        query = 'INSERT INTO users (spotify_id, access_token, tw_profile, inst_profile) VALUES (%s,%s,%s, %s)'
        cursor.execute(query, (self.spotify_id, self.access_token, self.tw_profile, self.inst_profile))
        self.commit()

    def get_profile(self):
        cursor = self.get_cursor()
        query = 'SELECT tw_profile, inst_profile from users where spotify_id = %s'
        cursor.execute(query, (self.spotify_id,))
        try:
            return cursor.fetchall()[0]
        except IndexError:
            return {'tw_profile': '', 'inst_profile': ''}

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

    def calculate_match(self, common_user):
        all_user_tracks = self.get_user_top_tracks()
        all_user_artists = self.get_user_top_artists()

        all_common_user_tracks = common_user.get_user_top_tracks()
        all_common_user_artists = common_user.get_user_top_artists()

        common_tracks, common_tracks_position, common_tracks_terms = self.calculator.count_common(all_user_tracks, all_common_user_tracks)
        common_artists, common_artists_position, common_artists_term = self.calculator.count_common(all_user_artists, all_common_user_artists)

        denominator_tracks = self.calculator.calculate_denominator(all_user_tracks, all_common_user_tracks)
        track_value = self.calculator.calculate_track_or_artist_value(common_tracks, common_tracks_position, common_tracks_terms, denominator_tracks)

        denominator_artists = self.calculator.calculate_denominator(all_user_artists, all_common_user_artists)
        artists_value = self.calculator.calculate_track_or_artist_value(common_artists, common_artists_position, common_artists_term, denominator_artists)

        match_value = self.calculator.calculate_total_match(track_value, artists_value)

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
