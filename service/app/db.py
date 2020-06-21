import json

from flask import current_app
from app.models import Measure
from app import sql

from pymongo import MongoClient
from bson.json_util import dumps

database_set = current_app.config["USE_DATABASE"]

class DatabaseHelper(object):
    def __init__(self, client):
        self.client = client
    
    @staticmethod
    def to_json(data):
        pass
    
    def get_all_measures(self, user_id=None):
        pass

    def create_measure(self, data):
        pass

class PyMongoHelper(DatabaseHelper):
    @staticmethod
    def to_json(data):
        return dumps(data)
    
    def get_all_measures(self, user_id=None):
        db = self.client["mymap"]
        measures = db["measures"]

        measures_found = measures.find({"user_id": user_id})
        return PyMongoHelper.to_json(measures_found)
    
    def create_measure(self, data):
        db = self.client["mymap"]
        measures = db["measures"]

        mongo_id = measures.insert(data)
        data["_id"] = mongo_id

        return PyMongoHelper.to_json(data)

class SQLAlchemyHelper(DatabaseHelper):
    @staticmethod
    def to_json(data):
        objs = []
        if type(data) is list or data is None:
            for d in data:
                objs.append(d.as_dict())
            
            return json.dumps(objs)
        else:
            return json.dumps(data.as_dict())
    
    def get_all_measures(self, user_id=None):
        return SQLAlchemyHelper.to_json(Measure.query.filter_by(user_id=int(user_id)).all())
    
    def create_measure(self, data):
        measure = Measure(
            latitude=data["latitude"],
            longitude=data["longitude"],
            message=data["message"]
        )

        measure.user_id = data["user_id"] if data["user_id"] is not None else None

        self.client.session.add(measure)
        self.client.session.commit()

        return SQLAlchemyHelper.to_json(measure)

def get_client(database_set):
    client = MongoClient("mongodb://mongodb:27017/")

    clients = {
        "pymongo": PyMongoHelper(client),
        "sqlalchemy": SQLAlchemyHelper(sql)
    }

    return clients.get(database_set)

client = get_client(database_set)

def get_all_measures(user_id):
    return client.get_all_measures(user_id)

def insert_measure(measure):
    return client.create_measure(measure)