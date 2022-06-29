from flask import Flask, request, jsonify, redirect, make_response, redirect
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
        if(not isfile(self.user_data_file_path)):
            self.__initUserData()
        self.app.add_url_rule('/backend', 'backend', login_required(self.__baseBackend), methods=["POST"])
        self.app.add_url_rule('/', 'root', login_required(self.__rootRoute), methods=["GET"])

    def __initUserData(self):
        self.user_data_json = {"sidebar": [], "navbar": {}, "settings":{}, "cards":[]}
        for val in self.plugins:
            if val.page:
                self.user_data_json["sidebar"].append({"name":(val.bp.name),"url":(val.bp.url_prefix),"icon":val.icon})
            if val.card:
                self.user_data_json["cards"].append({"name":(val.bp.name),"url":(val.bp.url_prefix+'/card'),"icon":val.icon})
        with open(self.user_data_file_path, 'w') as outfile:
            json.dump(self.user_data_json, outfile, indent=4)

    def __registerAllBlueprints(self):
        for index, path in enumerate(self.blueprints_path.rglob('bp.py')):
            bp_module_name = str(path.relative_to(self.root_path).with_suffix('')).replace('\\','.')
            bp_module = import_module(bp_module_name)
            tmp = bp_module.MyPlugin(queue.Queue(),queue.Queue())
            self.app.register_blueprint(tmp.bp)
            print('bp name: ', tmp.bp.name)
            self.plugins.append(tmp)

    def __baseBackend(self):
        req = request.get_json()
        jsn_res = {}
        if(not isfile(self.user_data_file_path)):
            self.__initUserData()
        match req['command']:
            case 'READ':
                with open(self.user_data_file_path) as json_file:
                    jsn_res = json.load(json_file)
            case 'WRITE':
                with open(self.user_data_file_path, 'w') as outfile:
                    json.dump(req, outfile, indent=4)
        return make_response(jsonify(jsn_res), 200)

    def __rootRoute(self):
        return redirect("/dashboard", code=302)

if __name__ == "__main__":
    mfs = MyFlaskServer()
    mfs.app.run(host='0.0.0.0',debug=True)
