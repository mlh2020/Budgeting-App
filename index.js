// Require Express
const express = require('express');

//Global variable to store total budget
const totalBudget = 1800;

// Create an Express application
const app = express();

// Define a port
const port = 3000;

// Create a route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Listen on the port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});


