from flask import Flask
from flask_sqlalchemy import SQLAlchemy

from app import sql

class Measure(sql.Model):
    _id = sql.Column(sql.Integer, primary_key=True)
    latitude = sql.Column(sql.String(80), unique=True, nullable=False)
    longitude = sql.Column(sql.String(80), unique=True, nullable=False)
    message = sql.Column(sql.String(120), unique=True, nullable=False)
    user_id = sql.Column(sql.Integer)
    
    def as_dict(self):
        return {c.name: getattr(self, c.name) for c in self.__table__.columns}
