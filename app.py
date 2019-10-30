from flask import Flask, request
from flask_cors import CORS

from Handlers.users_handler import UserHandler

app = Flask(__name__)

CORS = CORS(app)


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/register', methods=['POST'])
def register():
    return UserHandler().create_user(request.json)


@app.route('/users/match', methods=['POST'])
def match():
    return UserHandler().get_matches(request.json)


if __name__ == '__main__':
    app.run()
