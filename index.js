const express = require('express');
const bodyParser = require('body-parser');

// Global variable to store total budget and envelopes
let totalBudget = 1800;
let envelopes = [];
let nextId = 1; // To keep track of the next ID to assign

const app = express();
app.use(bodyParser.json());

const port = 3000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*'); // allow requests from any origin
    res.header(
        'Access-Control-Allow-Methods', 
        'GET, POST, PUT, DELETE' // Specify allowed methods
    );
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    next();
});



// POST endpoint to create an envelope
app.post('/envelopes/envelope', (req, res) => {
    const { title, budget } = req.body;

    if (!title || budget === undefined) {
        return res.status(400).send('Title and budget are required');
    }
    if (budget < 0) {
        return res.status(400).send('Budget cannot be negative');
    }

    const newEnvelope = { id: nextId++, title, budget };
    envelopes.push(newEnvelope);
    res.status(201).send(`Envelope '${title}' created with budget $${budget}`);
});

// GET endpoint to retrieve all envelopes
app.get('/envelopes', (req, res) => {
    res.status(200).json(envelopes);
});

// GET endpoint to retrieve a specific envelope by ID
app.get('/envelopes/envelope/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const envelope = envelopes.find(env => env.id === id);

    if (!envelope) {
        return res.status(404).send('Envelope not found');
    }

    res.status(200).json(envelope);
});

// PUT endpoint to update a specific envelope by ID
app.put('/envelopes/envelope/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { budget, title } = req.body;

    const envelopeIndex = envelopes.findIndex(env => env.id === id);
    if (envelopeIndex === -1) {
        return res.status(404).send('Envelope not found');
    }

    if (budget !== undefined && budget < 0) {
        return res.status(400).send('Budget cannot be negative');
    }

    if (title !== undefined) envelopes[envelopeIndex].title = title;
    if (budget !== undefined) envelopes[envelopeIndex].budget = budget;

    res.status(200).json(envelopes[envelopeIndex]);
});

// DELETE endpoint to delete a specific envelope by ID
app.delete('/envelopes/envelope/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const envelopeExists = envelopes.some(env => env.id === id);
    if (!envelopeExists) {
        return res.status(404).send('Envelope not found');
    }

    envelopes = envelopes.filter(env => env.id !== id);

    res.status(200).send(`Envelope with ID ${id} deleted successfully.`);
});

// POST endpoint to transfer value between envelopes
app.post('/envelopes/transfer/:from/:to', (req, res) => {
    const fromId = parseInt(req.params.from);
    const toId = parseInt(req.params.to);
    const { amount } = req.body;

    const fromEnvelope = envelopes.find(env => env.id === fromId);
    const toEnvelope = envelopes.find(env => env.id === toId);

    if (!fromEnvelope || !toEnvelope) {
        return res.status(404).send('One or both envelopes not found');
    }
    if (amount <= 0) {
        return res.status(400).send('Transfer amount must be positive');
    }
    if (fromEnvelope.budget < amount) {
        return res.status(400).send('Insufficient funds in the source envelope');
    }

    fromEnvelope.budget -= amount;
    toEnvelope.budget += amount;

    res.status(200).json({ from: fromEnvelope, to: toEnvelope });
});

// Listen on the port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
