const express = require('express');
require('dotenv').config({path: '../.env'});

const app = express();
const PORT = 8000;

//serves the HTML and js files
app.use(express.static('public'));


//fetch the API
app.get('/status', async (req, res) => {
    
    try {
        const health_res = await fetch('http://two-ms-api:3000/health');
        //checkes if the api returns an error, if does, throws the code to the catch.
        if (!health_res.ok) {
            throw new Error (`api health check failed, status: ${health_res.status}`);
        }
        const health_data = await health_res.json();
    
        const data_res = await fetch('http://two-ms-api:3000/data');
        if (!data_res.ok) {
            throw new Error (`api data fetch failed, status: ${data_res.status}`);
        }
        const data_data = await data_res.json();

        res.json({
            status: health_data.status,
            build: health_data.build,
            commit: health_data.commit,
            message: data_data.message
        });
    } catch (error) {
        console.log('error, could not get the data from the API');
        res.status(500).json({ error: error.message})
    }
});

app.get('/random', async (req, res) => {
    const {min, max} = req.query;
    try {
        const api_res = await fetch(`http://two-ms-api:3000/random?min=${min}&max=${max}`);

        if (!api_res.ok) {
            const errorData = await api_res.json();
            return res.status(api_res.status).json(errorData);
        }

        const data = await api_res.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'could not reach api'});
    }
})

app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        build: process.env.WEB_BUILDNUM || 'local',
        commit: process.env.WEB_COMMNUM || 'unknown'
    });
});

if(require.main === module) {
    app.listen (PORT, () => {
        console.log(`front is running on port: ${PORT}`);
    });
}

module.exports = {app};