from Models.model import Model


class Tracks(Model):

    spotify_id = None
    term = None
    pos = None
    user_id = None

    def __init__(self, spotify_id, term, pos, user_id):
        super(Tracks, self).__init__()
        self.spotify_id = spotify_id
        self.term = term
        self.pos = pos
        self.user_id = user_id

    def create(self):
        cursor = self.get_cursor()
        query = 'INSERT INTO Tracks (spotify_id, term, pos, user_id) values (%s,%s,%s,%s)'
        cursor.execute(query, (self.spotify_id, self.term, self.pos, self.user_id))
        self.commit()
        self.conn.close()
