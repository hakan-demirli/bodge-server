from flask import Blueprint, render_template, request, jsonify, redirect, make_response
from flask_simplelogin import login_required
from pathlib import Path
import json, os, threading, subprocess, datetime, shutil

class MyBlueprint():
    bp = Blueprint( name='Settings',
                import_name=__name__,
                url_prefix='/settings',
                template_folder='templates',
                static_folder='static')
    user_data_file_name = 'settings.json'
    icon = 'fa-solid fa-gear'
    page = 1
    card = 0
    lock = threading.Lock()

    def __init__(self,user_data_folder_path,socketio):
        self.user_data_folder_path = user_data_folder_path
        self.user_data_file_path = user_data_folder_path / self.user_data_file_name
        self.__init_user_data()
        self.bp.route('/')(login_required(self.settings))
        self.bp.route('/backend', methods=["POST"])(login_required(self.settings_backend))

    def __init_user_data(self):
        if(not os.path.isfile(self.user_data_file_path)):
            dummy_json = {'git_repo_url': ""}
            with open(self.user_data_file_path, 'w') as outfile:
                json.dump(dummy_json, outfile, indent=4)

    def settings(self):
        return render_template('settings/settings.html')

    def settings_backend(self):
        with self.lock:
            req = request.get_json()
            jsn_res = {}
            match req['command']:
                case 'CHANGE_REMOTE':
                    info = subprocess.run(['git', 'ls-remote', req['git_repo_url']])
                    if(info.returncode != 0):
                        print("ERROR CANT FIND THE REPO")
                    else:
                        if(os.path.exists(self.user_data_folder_path)):
                            shutil.rmtree(self.user_data_folder_path)
                            Path(self.user_data_folder_path).mkdir(parents=True)
                            info = subprocess.run(['git', '-C', str(self.user_data_folder_path), 'clone', req['git_repo_url'], '.'])
                            with open(self.user_data_file_path, 'w') as outfile:
                                json.dump(req, outfile, indent=4)
                        else:
                            print("ERROR CANT FIND DATA FOLDER")
                case 'SYNC_REPO':
                    info = subprocess.run(['git', '-C', str(self.user_data_folder_path),'pull'])
                    print(info)
                    info = subprocess.run(['git', '-C', str(self.user_data_folder_path),'add','.'])
                    print(info)
                    info = subprocess.run(['git', '-C', str(self.user_data_folder_path),'commit','-m', str(datetime.datetime.now().strftime("%Y_%m_%d_%H_%M_%S"))])
                    print(info)
                    info = subprocess.run(['git', '-C', str(self.user_data_folder_path),'push'])
                    print(info)
                case 'READ':
                    with open(self.user_data_file_path) as json_file:
                        jsn_res = json.load(json_file)
                case default:
                    raise Exception("UNKNOWN COMMAND")
            return make_response(jsonify(jsn_res), 200)
