from flask import Blueprint, render_template
from flask_simplelogin import login_required


bp = Blueprint( name='kanban',
                import_name=__name__,
                url_prefix='/kanban',
                template_folder='templates',
                static_folder='static')

@bp.route('/')
@login_required
def kanban():
    return render_template('kanban/kanban.html')

