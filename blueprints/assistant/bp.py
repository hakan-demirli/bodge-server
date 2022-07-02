from flask import Blueprint, render_template, request, jsonify, redirect, make_response
from flask_simplelogin import login_required
from pathlib import Path
import json, os

class MyBlueprint():
    bp = Blueprint( name='Assistant',
                import_name=__name__,
                url_prefix='/assistant',
                template_folder='templates',
                static_folder='static')
    user_data_path = Path(__file__).parent / 'assistant.json'
    icon = 'fa-solid fa-border-all'
    page = 0
    card = 1

    def __init__(self):
        self.__init_user_data()
        self.bp.route('/card')(login_required(self.assistant_card))
        self.bp.route('/backend')(login_required(self.assistant_backend))

    def __init_user_data(self):
        if(not os.path.isfile(self.user_data_path)):
            dummy_json = {"assistant": []}
            with open(self.user_data_path, 'w') as outfile:
                json.dump(dummy_json, outfile, indent=4)

    def assistant_card(self):
        return render_template('assistant/assistant_card.html')

    def assistant_backend(self):
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