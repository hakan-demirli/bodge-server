from flask import Flask, request, jsonify, redirect, make_response, redirect
from flask_simplelogin import SimpleLogin, login_required
from importlib import import_module
from pathlib import Path
from os.path import isfile
from flask_socketio import SocketIO
import json


class MyFlaskServer():
    socketio = SocketIO()
    my_name = 'server'
    root_path = Path(__file__).parent
    blueprints_path = root_path / "blueprints"
    user_data_folder_path = root_path / 'data'
    user_data_file_name = 'base.json'
    user_data_file_path = user_data_folder_path / user_data_file_name
    user_data_json = {}
    blueprints = {}
    app = Flask(__name__)
    app.config['SECRET_KEY'] = 'something-secret'
    app.config['SIMPLELOGIN_USERNAME'] = 'chuck'
    app.config['SIMPLELOGIN_PASSWORD'] = 'norris'

    def __init__(self):
        SimpleLogin(self.app)
        try: # __registerAllBlueprints imports the modules which use the user_data_folder_path
            Path(self.user_data_folder_path).mkdir(parents=True)
        except FileExistsError:
            pass
        self.__registerAllBlueprints()
        if(not isfile(self.user_data_file_path)):
            self.__initUserData()
        self.app.add_url_rule('/backend', 'backend', login_required(self.__baseBackend), methods=["POST"])
        self.app.add_url_rule('/', 'root', login_required(self.__rootRoute), methods=["GET"])
        self.socketio.init_app(self.app)

    def __initUserData(self):
        self.user_data_json = {"sidebar": [], "navbar": {}, "settings":{}, "cards":[]}
        for key in self.blueprints:
            bp_inst = self.blueprints[key]
            if bp_inst.page:
                self.user_data_json["sidebar"].append({"name":(bp_inst.bp.name),"url":(bp_inst.bp.url_prefix),"icon":bp_inst.icon})
            if bp_inst.card:
                self.user_data_json["cards"].append({"name":(bp_inst.bp.name),"url":(bp_inst.bp.url_prefix+'/card'),"icon":bp_inst.icon})
        with open(self.user_data_file_path, 'w') as outfile:
            json.dump(self.user_data_json, outfile, indent=4)

    def __registerAllBlueprints(self):
        for index, path in enumerate(self.blueprints_path.rglob('bp.py')):
            bp_module_name = str(path.relative_to(self.root_path).with_suffix('')).replace('\\','.') # windows path
            bp_module_name = bp_module_name.replace('/','.') # linux path
            bp_module = import_module(bp_module_name)
            tmp = bp_module.MyBlueprint(self.user_data_folder_path,self.socketio)
            self.app.register_blueprint(tmp.bp)
            self.blueprints[tmp.bp.name] = tmp

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
                    jsn_res = {}
        return make_response(jsonify(jsn_res), 200)

    def __rootRoute(self):
        return redirect("/dashboard", code=302)

    def run(self):
        self.socketio.run(self.app,debug=True,host='0.0.0.0')

if __name__ == "__main__":
    mfs = MyFlaskServer()
    mfs.run()
