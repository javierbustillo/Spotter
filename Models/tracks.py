from Models.model import Model


class Tracks(Model):

    def create_track(self, spotify_id, user_id, range, position):
        cursor = self.get_cursor()
        query = 'INSERT INTO Tracks (spotify_id, term, pos) values (%s,%s,%s) returning tid'
        cursor.execute(query, (spotify_id, range, position))
        results = cursor.fetchall()[0]
        tid = results['tid']
        self.commit()
        query = 'INSERT INTO user_tracks (user_id, track_id) values (%s, %s)'
        cursor.execute(query, (user_id, tid))
        self.commit()