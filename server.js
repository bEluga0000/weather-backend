//requring the modules
const dotenv = require('dotenv');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

//loading the environment variables
dotenv.config();

const app = express();

app.use(cors());

const PORT = 3000;

//route to handle API calls
app.get('/weather', async (req, res) => {
    const apiKey = process.env.API_KEY;
    const city = req.query.city;
    const apiBase = "https://api.openweathermap.org/data/2.5/";

    try{
        //fetch current weather and forecast using the cityname
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            axios.get(`${apiBase}weather?q=${city}&units=metric&appid=${apiKey}`),
            axios.get(`${apiBase}forecast?q=${city}&units=metric&appid=${apiKey}`)
        ]);

        //combining responses
        const result = {
            currentWeather: currentWeatherResponse.data,
            forecast: forecastResponse.data,
        };

        res.json(result);
    } 
    catch (error) {
        console.error('Error fetching data:', error);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ error: 'City not found' });
        }
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

//start the server
// app.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });
module.exports = app;
module.exports.handler = require("@vercel/node").createServer(app);
