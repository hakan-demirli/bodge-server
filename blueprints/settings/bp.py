from flask import Blueprint, render_template, request, jsonify, redirect, make_response
from flask_simplelogin import login_required
from pathlib import Path
import json, os, threading

class MyBlueprint():
    bp = Blueprint( name='Settings',
                import_name=__name__,
                url_prefix='/settings',
                template_folder='templates',
                static_folder='static')
    user_data_path = Path(__file__).parent / 'settings.json'
    icon = 'fa-solid fa-table-columns'
    page = 1
    card = 0
    lock = threading.Lock()

    def __init__(self):
        self.__init_user_data()
        self.bp.route('/')(login_required(self.settings))
        self.bp.route('/backend', methods=["POST"])(login_required(self.settings_backend))

    def __init_user_data(self):
        if(not os.path.isfile(self.user_data_path)):
            dummy_json = {"selected": {'root': '','branch': '','leaf': ''},
                            "selected_old": {'root': '','branch': '','leaf': ''},
                            "projects": {},
                            "projects_accesable":  {'root': {},'branch': {},'leaf': {},'todo':{},'prog':{},'done':{}},
                            'projects_selected':{}}
            with open(self.user_data_path, 'w') as outfile:
                json.dump(dummy_json, outfile, indent=4)

    def settings(self):
        return render_template('settings/settings.html')

    def settings_backend(self):
        with self.lock:
            req = request.get_json()
            jsn_res = {}
            match req['command']:
                case 'READ':
                    with open(self.user_data_path) as json_file:
                        jsn_res = json.load(json_file)
                case 'WRITE':
                    with open(self.user_data_path, 'w') as outfile:
                        json.dump(req, outfile, indent=4)
            return make_response(jsonify(jsn_res), 200)