const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

let totalBudget = 1800;
let envelopes = [];
let nextId = 1;

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = 3000;

// Helper function to calculate total envelope budget
function getTotalEnvelopeBudget() {
    return envelopes.reduce((total, envelope) => total + envelope.budget, 0);
}

// Get all envelopes
app.get('/envelopes', (req, res) => {
    res.status(200).send(envelopes);
});

// Create a new envelope
app.post('/envelopes/envelope', (req, res) => {
    const { title, budget } = req.body;
    if (!title || budget === undefined || isNaN(budget)) {
        return res.status(400).send('Invalid title or budget');
    }
    if (budget < 0) {
        return res.status(400).send('Budget cannot be negative');
    }
    if (budget + getTotalEnvelopeBudget() > totalBudget) {
        return res.status(400).send('Creating this envelope exceeds total funds');
    }
    const newEnvelope = { id: nextId++, title, budget };
    envelopes.push(newEnvelope);
    res.status(201).send(newEnvelope);
});

// Update an existing envelope
app.put('/envelopes/envelope/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { budget } = req.body;
    if (isNaN(budget) || budget < 0) {
        return res.status(400).send('Invalid budget');
    }
    const envelopeIndex = envelopes.findIndex(e => e.id === id);
    if (envelopeIndex === -1) {
        return res.status(404).send('Envelope not found');
    }
    const currentEnvelopeBudget = envelopes[envelopeIndex].budget;
    if (budget - currentEnvelopeBudget + getTotalEnvelopeBudget() > totalBudget) {
        return res.status(400).send('Updating this envelope exceeds total funds');
    }
    envelopes[envelopeIndex].budget = budget;
    res.status(200).send(envelopes[envelopeIndex]);
});

// Delete an envelope
app.delete('/envelopes/envelope/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const envelopeIndex = envelopes.findIndex(e => e.id === id);
    if (envelopeIndex === -1) {
        return res.status(404).send('Envelope not found');
    }
    envelopes.splice(envelopeIndex, 1);
    res.status(204).send();
});

// Transfer funds between envelopes
app.post('/envelopes/transfer', (req, res) => {
    const { fromId, toId, amount } = req.body;
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).send('Invalid transfer amount');
    }
    const fromIndex = envelopes.findIndex(e => e.id === fromId);
    const toIndex = envelopes.findIndex(e => e.id === toId);
    if (fromIndex === -1 || toIndex === -1) {
        return res.status(404).send('Envelope not found');
    }
    if (envelopes[fromIndex].budget < amount) {
        return res.status(400).send('Insufficient funds in the source envelope');
    }
    envelopes[fromIndex].budget -= amount;
    envelopes[toIndex].budget += amount;
    res.status(200).send({ from: envelopes[fromIndex], to: envelopes[toIndex] });
});

app.listen(port, () => console.log(`Server running on port ${port}`));
