document.addEventListener('DOMContentLoaded', function() {
    fetchEnvelopes();
    document.getElementById('create-form').addEventListener('submit', function(event) {
        event.preventDefault();
        createEnvelope();
    });
    document.getElementById('update-form').addEventListener('submit', function(event) {
        event.preventDefault();
        updateEnvelopeBalance();
    });
    document.getElementById('delete-form').addEventListener('submit', function(event) {
        event.preventDefault();
        deleteEnvelope();
    });
});

function fetchEnvelopes() {
    fetch('http://localhost:3000/envelopes')
        .then(response => response.json())
        .then(envelopes => {
            const tableBody = document.querySelector('#envelope-table tbody');
            tableBody.innerHTML = ''; // Clear existing rows
            envelopes.forEach(envelope => {
                const row = tableBody.insertRow();
                row.insertCell(0).textContent = envelope.id;
                row.insertCell(1).textContent = envelope.title;
                row.insertCell(2).textContent = `$${envelope.budget}`;
            });
        })
        .catch(error => console.error('Error:', error));
}

function createEnvelope() {
    const title = document.getElementById('create-title').value;
    const budget = document.getElementById('create-budget').value;

    fetch('http://localhost:3000/envelopes/envelope', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, budget })
    })
    .then(response => {
        if (!response.ok) {
            // If the response is not OK, throw an error
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Check if the response is JSON
        if (response.headers.get("content-type").includes("application/json")) {
            return response.json();
        } else {
            // If not JSON, return the text response
            return response.text();
        }
    })
    .then(data => {
        if (typeof data === 'string') {
            // If the data is a string, log it as a message
            console.log('Message:', data);
        } else {
            // If the data is an object, it's the created envelope
            console.log('Created envelope:', data);
        }
        fetchEnvelopes(); // Refresh the envelope list
    })
    .catch(error => {
        console.error('Error creating envelope:', error);
    });
}



function updateEnvelopeBalance() {
    const id = document.getElementById('envelope-id').value;
    const newBalance = document.getElementById('new-balance').value;

    fetch(`http://localhost:3000/envelopes/envelope/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ budget: newBalance })
    })
    .then(response => response.json())
    .then(updatedEnvelope => {
        console.log('Updated envelope:', updatedEnvelope);
        fetchEnvelopes();
    })
    .catch(error => console.error('Error:', error));
}

function deleteEnvelope() {
    const id = document.getElementById('delete-id').value;

    fetch(`http://localhost:3000/envelopes/envelope/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            console.log(`Deleted envelope with ID: ${id}`);
            fetchEnvelopes();
        } else {
            console.error('Error deleting envelope:', response.statusText);
        }
    })
    .catch(error => console.error('Error:', error));
}
