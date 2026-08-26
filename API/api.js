const express = require('express');
require('dotenv').config({ path: '../.env' });
const app = express();


app.get('/data', (req, res) => {
    res.json({message: 'The api and front end are talking!!!'});

})

app.get('/health', (req, res) => {
    res.json({
        status: "ok",
        build: process.env.API_BUILDNUM || 'local', 
        commit: process.env.API_COMMNUM || 'unknown'
    });
})

app.get('/random', (req, res) => {
    const min = parseInt( req.query.min, 10);
    const max = parseInt( req.query.max, 10);

    if (isNaN(min) || isNaN(max)) {
        return res.status(400).json({ error: 'min and max must be valid numbers' });
    }

    if (min > max) {
        return res.status(400).json({ error: 'min cannot be greater than max' });
    }

    const result = Math.floor(Math.random() * (max - min + 1)) + min;

    res.json({ result });

})

const PORT = 3000;


if (require.main === module) {
    app.listen(PORT, () => {
      console.log(`api is running on port ${PORT}`);
    });
}

module.exports = {app};
