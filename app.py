from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# Route for the main page
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/game-start')
def option1():
    return render_template('game-start.html')

# Route for handling dropdown selections
@app.route('/dropdown', methods=['POST'])
def dropdown():
    selected_option = request.form['option']
    return jsonify({'message': f"You selected: {selected_option}"})

if __name__ == "__main__":
    app.run(debug=True)

