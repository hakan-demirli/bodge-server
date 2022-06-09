from flask import Blueprint, render_template
from flask_simplelogin import login_required


bp = Blueprint('dashboard', __name__, template_folder='templates', static_folder='static',static_url_path='/static/dashboard')

@bp.route('/')
@login_required
def dashboard():
    return render_template('dashboard/dashboard.html')

