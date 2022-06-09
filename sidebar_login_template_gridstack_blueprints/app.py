from flask import Flask, request, jsonify, redirect, make_response
from flask_simplelogin import SimpleLogin, login_required
from importlib import import_module
from pathlib import Path
from os.path import isfile
import queue, json, re


class MyFlaskServer():
    root_path = Path(__file__).parent
    blueprints_path = root_path / "blueprints"
    user_data_file_path = root_path / 'my_data.json'
    user_data_json = {}
    bps = {}
    app = Flask(__name__)

    def __init__(self):
        self.app.config['SECRET_KEY'] = 'something-secret'
        self.app.config['SIMPLELOGIN_USERNAME'] = 'chuck'
        self.app.config['SIMPLELOGIN_PASSWORD'] = 'norris'
        SimpleLogin(self.app)
        self.__registerAllBlueprints()
        self.__initUserData()

    def __initUserData(self):
        if(not isfile(self.user_data_file_path)):
            self.user_data_json = {"sidebar": {"order":[]}, "navbar": {}, "settings":{}}
            for key,val in self.bps.items():
                self.user_data_json["sidebar"]["order"].append({"name":(val.name)})
                self.user_data_json["sidebar"]["order"].append({"url":(val.url_prefix)})
            with open(self.user_data_file_path, 'w') as outfile:
                json.dump(self.user_data_json, outfile, indent=4)

    def __registerAllBlueprints(self):
        for index, path in enumerate(self.blueprints_path.rglob('bp.py')):
            bp_module_name = str(path.relative_to(self.root_path).with_suffix('')).replace('\\','.')
            bp_module = import_module(bp_module_name)
            bp_bp = bp_module.bp
            self.app.register_blueprint(bp_bp)
            self.bps[bp_module_name] = bp_bp

    @app.route('/sidebar')
    @login_required
    def sidebar_route(self):
        req = request.get_json()
        match req['command']:
            case 'READ':
                return make_response(jsonify(self.user_data_json['sidebar']), 200)
            case 'WRITE':
                self.user_data_json['sidebar'] = req['sidebar']
                with open(self.user_data_file_path) as json_file:
                    json.dump(self.user_data_json, json_file, indent=4)
                return make_response(jsonify({}), 200)
            case _:
                return make_response(jsonify({}), 404)

    @app.route('/navbar')
    @login_required
    def navbar_route(self):
        req = request.get_json()
        match req['command']:
            case 'READ':
                return make_response(jsonify(self.user_data_json['navbar']), 200)
            case 'WRITE':
                self.user_data_json['navbar'] = req['navbar']
                with open(self.user_data_file_path) as json_file:
                    json.dump(self.user_data_json, json_file, indent=4)
                return make_response(jsonify({}), 200)
            case _:
                return make_response(jsonify({}), 404)

    @app.route('/settings')
    @login_required
    def settings_route(self):
        req = request.get_json()
        match req['command']:
            case 'READ':
                return make_response(jsonify(self.user_data_json['settings']), 200)
            case 'WRITE':
                self.user_data_json['settings'] = req['settings']
                with open(self.user_data_file_path) as json_file:
                    json.dump(self.user_data_json, json_file, indent=4)
                return make_response(jsonify({}), 200)
            case _:
                return make_response(jsonify({}), 404)


if __name__ == "__main__":
    mfs = MyFlaskServer()
    mfs.app.run(host='0.0.0.0')
