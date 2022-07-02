from flask import Flask, request, jsonify, redirect, make_response, redirect
from flask_simplelogin import SimpleLogin, login_required
from importlib import import_module
from pathlib import Path
from blueprints.BpBoilerplate import BpBoilerplate
from os.path import isfile
import queue, json, re, time


class MyFlaskServer(BpBoilerplate):
    my_q = queue.Queue()
    root_path = Path(__file__).parent
    blueprints_path = root_path / "blueprints"
    user_data_file_path = root_path / 'my_data.json'
    user_data_json = {}
    blueprints = {}
    app = Flask(__name__)

    def __init__(self):
        BpBoilerplate.__init__(self)
        self.app.config['SECRET_KEY'] = 'something-secret'
        self.app.config['SIMPLELOGIN_USERNAME'] = 'chuck'
        self.app.config['SIMPLELOGIN_PASSWORD'] = 'norris'
        SimpleLogin(self.app)
        self.__registerAllBlueprints()
        if(not isfile(self.user_data_file_path)):
            self.__initUserData()
        self.app.add_url_rule('/backend', 'backend', login_required(self.__baseBackend), methods=["POST"])
        self.app.add_url_rule('/', 'root', login_required(self.__rootRoute), methods=["GET"])
        self.__startAllBlueprints()

    def regular_task(self):
        time.sleep(1)

    def queue_task(self,jsn):
        return

    def __startAllBlueprints(self):
        for key in self.blueprints:
            self.blueprints[key]['instance'].daemon = True
            self.blueprints[key]['instance'].start()

    def __initUserData(self):
        self.user_data_json = {"sidebar": [], "navbar": {}, "settings":{}, "cards":[]}
        for key in self.blueprints:
            bp_inst = self.blueprints[key]['instance']
            if bp_inst.page:
                self.user_data_json["sidebar"].append({"name":(bp_inst.bp.name),"url":(bp_inst.bp.url_prefix),"icon":bp_inst.icon})
            if bp_inst.card:
                self.user_data_json["cards"].append({"name":(bp_inst.bp.name),"url":(bp_inst.bp.url_prefix+'/card'),"icon":bp_inst.icon})
        with open(self.user_data_file_path, 'w') as outfile:
            json.dump(self.user_data_json, outfile, indent=4)

    def __registerAllBlueprints(self):
        for index, path in enumerate(self.blueprints_path.rglob('bp.py')):
            bp_module_name = str(path.relative_to(self.root_path).with_suffix('')).replace('\\','.')
            bp_module = import_module(bp_module_name)
            tmp = bp_module.MyBlueprint()
            self.app.register_blueprint(tmp.bp)
            print('bp name: ', tmp.bp.name)
            self.blueprints[tmp.bp.name] = {'module':bp_module,'instance':tmp}
            self.all_q[tmp.bp.name] = tmp.my_q

        self.all_q['server'] = self.my_q

        for key in self.blueprints:
            self.blueprints[key]['instance'].all_q = self.all_q


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
    mfs.daemon = True
    mfs.start()
    mfs.app.run(host='0.0.0.0',debug=False)
