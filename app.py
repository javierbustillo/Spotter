from flask import Flask, request, jsonify
from flask_cors import CORS

from Handlers.users_handler import UserHandler

app = Flask(__name__)

CORS = CORS(app)


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/register', methods=['POST', 'PUT'])
def register():
    if request.method == 'POST':
        return UserHandler().create_user(request.json)
    else:
        json_dict = request.json
        access_token = json_dict['access_token']
        UserHandler().update_user(access_token)
        return jsonify(msg='Updated user')


@app.route('/users/profile', methods=['PUT', 'POST'])
def update_user():
    if request.method == 'PUT':
        json_dict = request.json
        access_token = json_dict['access_token']
        tw_profile = json_dict['tw_profile']
        inst_profile = json_dict['inst_profile']
        UserHandler().update_profile(access_token, tw_profile, inst_profile)
        return jsonify(msg='Updated profile')
    else:
        json_dict = request.json
        access_token = json_dict['access_token']
        user_profile = UserHandler().get_user(access_token)
        return jsonify(user_profile)

@app.route('/users/match', methods=['POST'])
def match():
    return UserHandler().get_matches(request.json)


if __name__ == '__main__':
    app.run()
