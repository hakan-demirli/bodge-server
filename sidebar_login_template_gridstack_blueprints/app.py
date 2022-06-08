from flask import Flask, render_template
from flask_simplelogin import SimpleLogin, login_required


app = Flask(__name__)
app.config['SECRET_KEY'] = 'something-secret'
app.config['SIMPLELOGIN_USERNAME'] = 'chuck'
app.config['SIMPLELOGIN_PASSWORD'] = 'norris'

SimpleLogin(app)

from blueprints.dashboard.dash import example_blueprint

app.register_blueprint(example_blueprint)


def another():
    return render_template('another.html')

iii = login_required(another)
app.add_url_rule('/another', 'sdfasdf', iii, methods=['GET', 'POST'])
if __name__ == '__main__':
    app.run(debug =True)
