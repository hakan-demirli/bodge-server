from flask import Blueprint, render_template
from flask_simplelogin import login_required


bp = Blueprint( name='dashboard',
                import_name=__name__,
                url_prefix='/dashboard',
                template_folder='templates',
                static_folder='static')

@bp.route('/')
@login_required
def dashboard():
    return render_template('dashboard/dashboard.html')

