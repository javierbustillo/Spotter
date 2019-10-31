from Models.model import Model


class Artists(Model):
    spotify_id = None
    term = None
    pos = None
    user_id = None

    def __init__(self, spotify_id, term, pos, user_id):
        super(Artists, self).__init__()
        self.spotify_id = spotify_id
        self.term = term
        self.pos = pos
        self.user_id = user_id

    def create(self):
        cursor = self.get_cursor()
        query = 'INSERT INTO Artists (spotify_id, term, pos, user_id) values (%s,%s,%s,%s) returning aid'
        cursor.execute(query, (self.spotify_id, self.term, self.pos, self.user_id))
        self.commit()
        self.conn.close()

    def __repr__(self):
        return 'Artist Spotify_id: %s term: %s position: %s user_id: %s' % (self.spotify_id, self.term, self.pos, self.user_id)

    def __eq__(self, other):
        return self.spotify_id == other.spotify_id
