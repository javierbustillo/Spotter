from flask import Flask, request, jsonify
from flask_cors import CORS

from Handlers.users_handler import UserHandler
from SpotifyAPI import SpotifyAPI

app = Flask(__name__)

CORS = CORS(app)


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/register', methods=['POST', 'PUT'])
def register():
    access_token = request.json['access_token']
    if request.method == 'POST':
        tw_profile = request.json['tw_profile']
        inst_profile = request.json['inst_profile']
        UserHandler().create_user(access_token, tw_profile, inst_profile)
        return jsonify(msg='Created user')
    else:
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
def match_list():
    access_token = request.json['access_token']
    matches = UserHandler().get_matches(access_token)
    dict_match = []
    for match in matches:
        match_dict = match.__dict__
        match_dict.pop('conn')
        match_dict.pop('URL')
        user_info = SpotifyAPI().get_user_by_id(access_token, match.spotify_id)
        match_dict['display_name'] = user_info['display_name']
        match_dict['profile_picture'] = user_info['images']
        dict_match.append(match_dict)
    return jsonify(dict_match)


@app.route('/users/compare', methods=['GET', 'POST'])
def compare_users():
    if request.method == 'POST':
        access_token = request.json['access_token']
        tmp_id = UserHandler().create_tmp_id(access_token)
        response = jsonify(tmp_id=tmp_id)
    else:
        access_token = request.args["access_token"]
        tmp_id = request.args['tmp']
        match = UserHandler().get_match(tmp_id, access_token)
        match_dict = match.__dict__
        match_dict.pop('conn')
        match_dict.pop('URL')
        user_info = SpotifyAPI().get_user_by_id(access_token, match.spotify_id)
        match_dict['display_name'] = user_info['display_name']
        match_dict['profile_picture'] = user_info['images']
        response = jsonify(match_dict)
    return response


if __name__ == '__main__':
    app.run()
