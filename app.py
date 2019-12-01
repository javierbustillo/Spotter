from flask import Flask, request, jsonify
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


@app.route('/users/profile', methods=['PUT'])
def update_user():
    json_dict = request.json
    access_token = json_dict['access_token']
    tw_profile = json_dict['tw_profile']
    inst_profile = json_dict['inst_profile']
    UserHandler().update_profile(access_token, tw_profile, inst_profile)
    return jsonify(msg='Updated profile')


@app.route('/users/match', methods=['POST'])
def match():
    return UserHandler().get_matches(request.json)


if __name__ == '__main__':
    app.run()
