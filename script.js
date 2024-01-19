document.addEventListener('DOMContentLoaded', function() {
    fetchEnvelopes();
    document.getElementById('set-funds-form').addEventListener('submit', setTotalFunds);
    document.getElementById('create-form').addEventListener('submit', createEnvelope);
    document.getElementById('update-form').addEventListener('submit', updateEnvelope);
    document.getElementById('delete-form').addEventListener('submit', deleteEnvelope);
    document.getElementById('transfer-form').addEventListener('submit', transferFunds);
});

let totalFunds = 0;
let envelopes = [];

function fetchEnvelopes() {
    fetch('http://localhost:3000/envelopes')
        .then(response => response.json())
        .then(data => {
            envelopes = data;
            displayEnvelopes();
        })
        .catch(error => displayStatusMessage('Error fetching envelopes: ' + error));
}

function displayEnvelopes() {
    const tableBody = document.getElementById('envelope-table-body');
    tableBody.innerHTML = '';
    envelopes.forEach(envelope => {
        const row = tableBody.insertRow();
        row.insertCell(0).textContent = envelope.id;
        row.insertCell(1).textContent = envelope.title;
        row.insertCell(2).textContent = `$${envelope.budget}`;
    });
}

function setTotalFunds(event) {
    event.preventDefault();
    const totalFundsInput = document.getElementById('total-funds-input').value;
    totalFunds = parseInt(totalFundsInput, 10);
    displayStatusMessage('Total funds updated to $' + totalFunds);
}

function createEnvelope(event) {
    event.preventDefault();
    const title = document.getElementById('create-title').value;
    const budget = parseInt(document.getElementById('create-budget').value, 10);
    fetch('http://localhost:3000/envelopes/envelope', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, budget }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to create envelope: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        envelopes.push(data);
        displayEnvelopes();
        displayStatusMessage('Envelope created');
    })
    .catch(error => displayStatusMessage(error.message));
}

function updateEnvelope(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('update-id').value, 10);
    const budget = parseInt(document.getElementById('update-budget').value, 10);
    fetch(`http://localhost:3000/envelopes/envelope/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ budget }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update envelope: ' + response.statusText);
        }
        return response.json();
    })
    .then(updatedEnvelope => {
        const index = envelopes.findIndex(envelope => envelope.id === id);
        envelopes[index] = updatedEnvelope;
        displayEnvelopes();
        displayStatusMessage('Envelope updated');
    })
    .catch(error => displayStatusMessage(error.message));
}

function deleteEnvelope(event) {
    event.preventDefault();
    const id = parseInt(document.getElementById('delete-id').value, 10);
    fetch(`http://localhost:3000/envelopes/envelope/${id}`, { method: 'DELETE' })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to delete envelope: ' + response.statusText);
        }
        envelopes = envelopes.filter(envelope => envelope.id !== id);
        displayEnvelopes();
        displayStatusMessage('Envelope deleted');
    })
    .catch(error => displayStatusMessage(error.message));
}

function transferFunds(event) {
    event.preventDefault();
    const fromId = parseInt(document.getElementById('transfer-from-id').value, 10);
    const toId = parseInt(document.getElementById('transfer-to-id').value, 10);
    const amount = parseInt(document.getElementById('transfer-amount').value, 10);
    fetch(`http://localhost:3000/envelopes/transfer`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fromId, toId, amount }),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to transfer funds: ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        const fromIndex = envelopes.findIndex(envelope => envelope.id === fromId);
        const toIndex = envelopes.findIndex(envelope => envelope.id === toId);
        envelopes[fromIndex] = data.from;
        envelopes[toIndex] = data.to;
        displayEnvelopes();
        displayStatusMessage('Funds transferred');
    })
    .catch(error => displayStatusMessage(error.message));
}

function displayStatusMessage(message) {
    document.getElementById('status-message').textContent = message;
}
