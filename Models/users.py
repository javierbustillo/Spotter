from Models.model import Model


class Users(Model):

    def __init__(self):
        super(Users, self).__init__()

    def create_user(self, spotify_id, access_token, refresh_token):
        cursor = self.get_cursor()
        query = 'INSERT INTO users (spotify_id, access_token, refresh_token) VALUES (%s,%s,%s)'
        cursor.execute(query, (spotify_id, access_token, refresh_token))
        self.commit()
