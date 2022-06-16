from flask import Blueprint, render_template, request, jsonify, redirect, make_response
from flask_simplelogin import login_required
from pathlib import Path
from ..Plugin import Plugin
import time, json, os

class MyPlugin(Plugin):
    bp = Blueprint( name='Kanban',
                import_name=__name__,
                url_prefix='/kanban',
                template_folder='templates',
                static_folder='static')
    user_data_path = Path(__file__).parent / 'kanban.json'
    icon = 'fa-solid fa-table-columns'
    page = 1
    card = 0

    def __init__(self,all_q,my_q):
        Plugin.__init__(self,all_q,my_q)
        self.__init_user_data()
        self.bp.route('/')(login_required(self.kanban))
        self.bp.route('/menu')(login_required(self.kanban_menu))
        self.bp.route('/backend', methods=["POST"])(login_required(self.kanban_backend))

    def __init_user_data(self):
        if(not os.path.isfile(self.user_data_path)):
            dummy_json = {"selected": {'root': '','branch': '','leaf': ''},
                            "selected_old": {'root': '','branch': '','leaf': ''},
                            "projects": {},
                            "projects_accesable":  {'root': {},'branch': {},'leaf': {},'todo':{},'prog':{},'done':{}},
                            'projects_selected':{}}
            with open(self.user_data_path, 'w') as outfile:
                json.dump(dummy_json, outfile, indent=4)

    def regular_task(self):
        time.sleep(1)
        #print("this is a regular task")

    def queue_task(self,jsn):
        print("queue task from: " + self.__class__.__name__)

    def kanban(self):
        return render_template('kanban/kanban.html')

    def kanban_menu(self):
        return render_template('kanban/kanban_menu.html')

    def kanban_backend(self):
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