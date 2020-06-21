import os

class Config(object):
    SECRET_KEY = "mega_super_secret_key"

    MONGODB_DB = 'db'
    MONGODB_HOST = "mongodb"
    MONGODB_PORT = 27017

    FLASK_DEBUG = True
    PROPAGATE_EXCEPTIONS = True
    JSONIFY_PRETTYPRINT_REGULAR = True

    USE_DATABASE = "sqlalchemy"
    SQLALCHEMY_DATABASE_URI = 'sqlite:///mymap.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False