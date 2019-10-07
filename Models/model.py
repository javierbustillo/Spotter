import os
import psycopg2
import psycopg2.extras


class Model:

    def __init__(self):
        self.conn = psycopg2.connect(os.getenv('DATABASE_URL'))

    def get_cursor(self):
        return self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def commit(self):
        self.conn.commit()
