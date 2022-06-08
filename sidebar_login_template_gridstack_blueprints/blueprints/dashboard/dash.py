from flask import Blueprint, render_template
from flask_simplelogin import login_required

example_blueprint = Blueprint('example_blueprint', __name__,
    template_folder='templates',
    static_folder='static')

@example_blueprint.route('/')
@login_required
def index():
    return render_template('dashboard/index.html')

