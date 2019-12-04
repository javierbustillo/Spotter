import os
import psycopg2
import psycopg2.extras


class Entity:

    def __init__(self):
        self.URL = os.environ['DATABASE_URL']
        self.conn = None

    def get_cursor(self):
        self.conn = psycopg2.connect(self.URL)
        return self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)

    def commit(self):
        self.conn.commit()
