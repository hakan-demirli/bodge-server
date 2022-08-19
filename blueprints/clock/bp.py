from flask import Blueprint, render_template, request, jsonify, redirect, make_response
from flask_simplelogin import login_required
from pathlib import Path
import json, os

class MyBlueprint():
    bp = Blueprint( name='Clock',
                import_name=__name__,
                url_prefix='/clock',
                template_folder='templates',
                static_folder='static')
    user_data_file_name = 'clock.json'
    icon = 'fa-regular fa-clock'
    page = 0
    card = 1

    def __init__(self,user_data_folder_path,socketio):
        self.user_data_folder_path = user_data_folder_path
        self.user_data_file_path = user_data_folder_path / self.user_data_file_name
        if(not os.path.isfile(self.user_data_file_path)):
           self.__init_user_data()
        self.bp.route('/card')(login_required(self.clock_card))
        self.bp.route('/backend', methods=["POST"])(login_required(self.clock_backend))

    def __init_user_data(self):
        dummy_json = {"countdown_list":[]}
        with open(self.user_data_file_path, 'w') as outfile:
            json.dump(dummy_json, outfile, indent=4)

    def clock_card(self):
        return render_template('clock/clock_card.html')

    def clock_backend(self):
        req = request.get_json()
        jsn_res = {}
        if(not os.path.isfile(self.user_data_file_path)):
           self.__init_user_data()

        match req['command']:
            case 'READ':
                with open(self.user_data_file_path) as json_file:
                    jsn_res = json.load(json_file)
            case 'WRITE':
                with open(self.user_data_file_path, 'w') as outfile:
                    json.dump(req, outfile, indent=4)
        return make_response(jsonify(jsn_res), 200)