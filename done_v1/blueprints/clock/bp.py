from flask import Blueprint, render_template, request, jsonify, redirect, make_response
from flask_simplelogin import login_required
from pathlib import Path
from ..Plugin import Plugin
import time, json, os

class MyPlugin(Plugin):
    bp = Blueprint( name='Clock',
                import_name=__name__,
                url_prefix='/clock',
                template_folder='templates',
                static_folder='static')
    user_data_path = Path(__file__).parent / 'clock.json'
    icon = 'fa-solid fa-table-columns'
    page = 0
    card = 1

    def __init__(self,all_q,my_q):
        Plugin.__init__(self,all_q,my_q)
        if(not os.path.isfile(self.user_data_path)):
           self.__init_user_data()
        self.bp.route('/card')(login_required(self.clock_card))
        self.bp.route('/backend', methods=["POST"])(login_required(self.clock_backend))

    def __init_user_data(self):
        dummy_json = {"countdown_list":[]}
        with open(self.user_data_path, 'w') as outfile:
            json.dump(dummy_json, outfile, indent=4)

    def regular_task(self):
        time.sleep(1)
        #print("this is a regular task")

    def queue_task(self,jsn):
        print("queue task from: " + self.__class__.__name__)

    def clock_card(self):
        return render_template('clock/clock_card.html')

    def clock_backend(self):
        req = request.get_json()
        jsn_res = {}
        if(not os.path.isfile(self.user_data_path)):
           self.__init_user_data()

        match req['command']:
            case 'READ':
                with open(self.user_data_path) as json_file:
                    jsn_res = json.load(json_file)
            case 'WRITE':
                with open(self.user_data_path, 'w') as outfile:
                    json.dump(req, outfile, indent=4)
        return make_response(jsonify(jsn_res), 200)