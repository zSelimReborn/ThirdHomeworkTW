import requests
import json

class ApiException(Exception):
    pass

class LoginException(Exception):
    pass

class Client(object):
    API_URL =  "https://api.uniparthenope.it"
    AUTH_ENDPOINT   = "auth/v1/login"
    LOGIN_ENDPOINT  = "UniparthenopeApp/v1/login"

    @staticmethod
    def build_url(endpoint):
        return ("%s/%s" % (Client.API_URL, endpoint))

    @staticmethod
    def auth(token):
        url = Client.build_url(Client.AUTH_ENDPOINT)

        headers = {"Authorization": "Basic: " + token}
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            response_json = response.json()
            if "message" in response_json:
                raise LoginException(response_json["message"])
            raise LoginException(response_json["errMsg"])

        if "status" not in response.json():
            raise LoginException(response["message"])

        return True

    @staticmethod
    def login(token):
        url = Client.build_url(Client.LOGIN_ENDPOINT)

        headers = {"Authorization": "Basic: " + token}
        response = requests.get(url, headers=headers)

        if response.status_code != 200:
            response_json = response.json()
            raise LoginException(response["message"])

        response_json = response.json()
        return True, response_json["user"]["id"]



