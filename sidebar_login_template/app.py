from flask import Flask, render_template
from flask_simplelogin import SimpleLogin, login_required


app = Flask(__name__)
app.config['SECRET_KEY'] = 'something-secret'
app.config['SIMPLELOGIN_USERNAME'] = 'chuck'
app.config['SIMPLELOGIN_PASSWORD'] = 'norris'

SimpleLogin(app)


def index():
    return render_template('index.html')

ii = login_required(index)
app.add_url_rule('/', 'flask_backend_route', ii, methods=['GET', 'POST'])

if __name__ == '__main__':
    app.run(debug =True)
