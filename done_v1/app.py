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
    plugins = []
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
            for val in self.plugins:
                self.user_data_json["sidebar"]["order"].append({"name":(val.bp.name),"url":(val.bp.url_prefix)})
            with open(self.user_data_file_path, 'w') as outfile:
                json.dump(self.user_data_json, outfile, indent=4)

    def __registerAllBlueprints(self):
        for index, path in enumerate(self.blueprints_path.rglob('bp.py')):
            bp_module_name = str(path.relative_to(self.root_path).with_suffix('')).replace('\\','.')
            bp_module = import_module(bp_module_name)
            tmp = bp_module.MyPlugin(queue.Queue(),queue.Queue())
            self.app.register_blueprint(tmp.bp)
            self.plugins.append(tmp)

    def base_backend(self):
        req = request.get_json()
        jsn_res = {}
        match req['command']:
            case 'READ':
                with open(self.user_data_file_path) as json_file:
                    jsn_res = json.load(json_file)
            case 'WRITE':
                with open(self.user_data_file_path, 'w') as outfile:
                    json.dump(req, outfile, indent=4)
        return make_response(jsonify(jsn_res), 200)

if __name__ == "__main__":
    mfs = MyFlaskServer()
    mfs.app.add_url_rule('/backend', 'backend', mfs.base_backend, methods=["POST"])
    mfs.app.run(host='0.0.0.0',debug=True)
