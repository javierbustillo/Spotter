from Models.model import Model


class Artists(Model):
    spotify_id = None
    term = None
    pos = None

    def __init__(self, spotify_id, term, pos):
        super(Artists, self).__init__()
        self.spotify_id = spotify_id
        self.term = term
        self.pos = pos

    def create(self, user_id):
        cursor = self.get_cursor()
        query = 'INSERT INTO Artists (spotify_id, term, pos) values (%s,%s,%s) returning aid'
        cursor.execute(query, (self.spotify_id, self.term, self.pos))
        results = cursor.fetchall()[0]
        tid = results['aid']
        self.commit()
        query = 'INSERT INTO user_artists (user_id, artist_id) values (%s, %s)'
        cursor.execute(query, (user_id, tid))
        self.commit()
        self.conn.close()

