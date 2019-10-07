from flask import Flask, request

from Handlers.users_handler import UserHandler

app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/register')
def register():
    return UserHandler().create_user(request.json)


if __name__ == '__main__':
    app.run()
