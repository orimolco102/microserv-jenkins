const express = require('express');
require('dotenv').config({ path: '../.env' });
const app = express();
const cors = require('cors');

const allowedcors = [
    'http://127.0.0.1:5500',
    'http://127.0.0.1:3000'
]

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedcors.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("origin not allowed"));
        }
    }
}))

app.get('/api/data', (req, res) => {
    res.json('The api and front end are talking!!!');

})

app.get('/health', (req, res) => {
    res.json({status: "ok", build: process.env.BUILDNUM, commit: process.env.COMMNUM});
})

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
});
