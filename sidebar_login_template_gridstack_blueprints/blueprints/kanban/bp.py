from flask import Blueprint, render_template
from flask_simplelogin import login_required


bp = Blueprint('kanban', __name__, template_folder='templates', static_folder='static',static_url_path='/static/kanban')

@bp.route('/kanban')
@login_required
def kanban():
    return render_template('kanban/kanban.html')

