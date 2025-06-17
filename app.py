from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Route for the main page
@app.route('/')
def home():
    return render_template('index.html')

# Game routes for each era
@app.route('/pacman')
def pacman():
    return render_template('pacman.html')

@app.route('/space-invaders')
def space_invaders():
    return render_template('space-invaders.html')

@app.route('/super-mario')
def super_mario():
    return render_template('super-mario.html')

@app.route('/artists-statement')
def artists_statement():
    return render_template('artists-statement.html')

# Route for handling dropdown selections (keeping for backward compatibility)
@app.route('/dropdown', methods=['POST'])
def dropdown():
    selected_option = request.form['option']
    return jsonify({'message': f"You selected: {selected_option}"})

if __name__ == "__main__":
    app.run(debug=True)