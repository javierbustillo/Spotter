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
    print('This is json:')
    print(request.json)
    print('\n\n\n\n\nThis is form[0]')
    print(request.form[0])
    return UserHandler().create_user(request.form[0])


if __name__ == '__main__':
    app.run()
