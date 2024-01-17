// Require Express
const express = require('express');
const bodyParser = require('body-parser');

// Global variable to store total budget and envelopes
const totalBudget = 1800;
let envelopes = [];
let nextId = 1; // To keep track of the next ID to assign

// Create an Express application
const app = express();

// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// Define a port
const port = 3000;

// POST endpoint to create an envelope
app.post('/envelopes/envelope', (req, res) => {
    const { title, budget } = req.body;

    // Validation
    if (!title || !budget) {
        return res.status(400).send('Both title and budget are required');
    }
    if (budget < 0) {
        return res.status(400).send('Budget cannot be negative');
    }

    // Create envelope
    const newEnvelope = { id: nextId++, title, budget };
    envelopes.push(newEnvelope);
    res.status(201).send(`Envelope '${title}' created with budget $${budget}`);
});

// GET endpoint to retrieve all envelopes
app.get('/envelopes', (req, res) => {
    if (envelopes.length === 0) {
        return res.status(404).send('No envelopes found');
    }
    res.status(200).json(envelopes);
});

// GET endpoint to retrieve a specific envelope
app.get('/envelopes/envelope/:id', (req, res) => {
    const envelope = envelopes.find(env => env.id === parseInt(req.params.id));
    if (!envelope) {
        return res.status(404).send('Envelope not found');
    }
    res.status(200).json(envelope);
});

// Listen on the port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
