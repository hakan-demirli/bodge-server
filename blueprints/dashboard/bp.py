from flask import Blueprint, render_template, request, jsonify, redirect, make_response
from flask_simplelogin import login_required
from pathlib import Path
import json, os

class MyBlueprint():
    bp = Blueprint( name='Dashboard',
                import_name=__name__,
                url_prefix='/dashboard',
                template_folder='templates',
                static_folder='static')
    user_data_file_name = 'dashboard.json'
    icon = 'fa-solid fa-border-all'
    page = 1
    card = 0

    def __init__(self,user_data_folder_path,socketio):
        self.user_data_folder_path = user_data_folder_path
        self.user_data_file_path = user_data_folder_path / self.user_data_file_name
        self.__init_user_data()
        self.bp.route('/')(login_required(self.dashboard))
        self.bp.route('/backend', methods=["POST"])(login_required(self.dashboard_backend))

    def __init_user_data(self):
        if(not os.path.isfile(self.user_data_file_path)):
            dummy_json = {}
            with open(self.user_data_file_path, 'w') as outfile:
                json.dump(dummy_json, outfile, indent=4)

    def dashboard(self):
        return render_template('dashboard/dashboard.html')

    def dashboard_backend(self):
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