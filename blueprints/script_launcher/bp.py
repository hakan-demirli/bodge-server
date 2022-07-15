from flask import Blueprint, render_template, request, jsonify, redirect, make_response
from flask_simplelogin import login_required
from pathlib import Path
import json, os, subprocess, sys


class MyBlueprint():
    bp = Blueprint( name='Script Launcher',
                import_name=__name__,
                url_prefix='/script_launcher',
                template_folder='templates',
                static_folder='static')
    user_data_path = Path(__file__).parent / '../../data/script_launcher.json'
    icon = 'fa-solid fa-table-columns'
    page = 0
    card = 1
    scripts_path = Path(__file__).parent / "scripts/"
    scripts_files = {}
    scripts = {}

    def __init__(self):
        self.__find_scripts()
        self.__init_user_data()
        self.__update_scripts()
        self.bp.route('/card')(login_required(self.script_launcher_card))
        self.bp.route('/backend', methods=["POST"])(login_required(self.script_launcher_backend))

    def __init_user_data(self):
        dummy_json = {}
        if(not os.path.isfile(self.user_data_path)):
            for key,val in self.scripts_files.items():
                dummy_json[key] = "off"
            with open(self.user_data_path, 'w') as outfile:
                json.dump(dummy_json, outfile, indent=4)
        else:
            with open(self.user_data_path) as json_file:
                dummy_json = json.load(json_file)
                for key,val in self.scripts_files.items():
                    if (key not in dummy_json):
                        dummy_json[key] = "off"
            with open(self.user_data_path, 'w') as outfile:
                json.dump(dummy_json, outfile, indent=4)


    def __find_scripts(self):
        for index, path in enumerate(Path(self.scripts_path).rglob('*.py')):
            script_name = path.stem
            self.scripts_files[script_name] = path

    def __update_scripts(self):
        with open(self.user_data_path) as json_file:
            jsn_usr = json.load(json_file)
            for script_name, path in self.scripts_files.items():
                if ((script_name not in self.scripts) and (jsn_usr[script_name] == "on")):
                    self.scripts[script_name] = (subprocess.Popen([Path(sys.executable).name, path]))
                if ((script_name in self.scripts) and (jsn_usr[script_name] == "off")):
                    self.scripts[script_name].terminate()
                    self.scripts[script_name].wait()
                    del self.scripts[script_name]

    def script_launcher_card(self):
        return render_template('script_launcher/script_launcher_card.html')

    def script_launcher_backend(self):
        req = request.get_json()
        jsn_res = {}
        match req['command']:
            case 'READ':
                with open(self.user_data_path) as json_file:
                    jsn_res = json.load(json_file)
            case 'WRITE':
                with open(self.user_data_path, 'w') as outfile:
                    json.dump(req["script_list"], outfile, indent=4)
                self.__update_scripts()
        return make_response(jsonify(jsn_res), 200)

