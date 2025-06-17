from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Route for the main page
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/game-start')
def game_start():
    return render_template('game-start.html')

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