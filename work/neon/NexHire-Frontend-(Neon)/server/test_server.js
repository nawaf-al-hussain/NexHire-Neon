const express = require('express');
const app = express();
const PORT = 5002;

app.get('/', (req, res) => res.send('OK'));

app.listen(PORT, () => {
    console.log(`Test server on ${PORT}`);
    // Keep it alive
});
