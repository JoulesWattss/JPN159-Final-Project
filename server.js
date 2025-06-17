const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up static file serving
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/pixel_pioneers', express.static(path.join(__dirname, 'pixel_pioneers')));

// Set up view engine (using basic HTML serving instead of template engine)
app.set('views', path.join(__dirname, 'templates'));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'index.html'));
});

app.get('/pacman', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'pacman.html'));
});

app.get('/super-mario', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'super-mario.html'));
});

app.get('/space-invaders', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'space-invaders.html'));
});

app.get('/artists-statement', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'artists-statement.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});