from flask import Flask, current_app, request, session
from .config import Config
from flask_restplus import Api, Resource, cors
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS

import json

from .university import Client, LoginException

api = Api()
sql = SQLAlchemy()
migrate = Migrate()
cors = CORS()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)


    api.init_app(app)
    sql.init_app(app)
    migrate.init_app(app, sql)

    cors.init_app(app, resources={r'/*': {'origins': '*'}})

    with app.app_context():
        from .db import get_all_measures, insert_measure

    @api.route('/measures')
    class Measures(Resource):
        def get(self):
            user_id = None
            if "token" in request.headers:
                try:
                    token = request.headers.get("token")
                    success, user_id = Client.login(token)
                except LoginException as e:
                    return json.dumps({"success": False, "message": str(e)})

            return get_all_measures(user_id)
        
        def post(self):
            if "token" in request.json:
                try:
                    token = request.json["token"]
                    success, user_id = Client.login(token)
                except LoginException as e:
                    return json.dumps({"success": False, "message": str(e)})
            else:
                user_id = None

            if "latitude" not in request.json or "longitude" not in request.json:
                return json.dumps({"success": False, "message": "Coordinate obbligatorie"})

            measure = {
                "latitude": request.json["latitude"],
                "longitude": request.json["longitude"],
                "message": request.json["message"],
                "user_id": user_id
            }

            return insert_measure(measure)    
    
    @api.route("/login")
    class UserLogin(Resource):
        def post(self):
            if "token" not in request.json:
                return json.dumps({"success": False, "message": "Token mancante"})
            
            token = request.json["token"]
            try:
                Client.auth(token)

                success, user_id = Client.login(token)
                return json.dumps({"success": True, "message": "Login effettuato!", "user_id": user_id})
            except LoginException as e:
                session["auth_token"] = None
                return json.dumps({"success": False, "message": str(e)})
    

    return app


if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, use_debugger=True)
