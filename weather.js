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
    //console.log(apiKey);
    const city = req.query.city;
    //console.log(city);

    //url to get geocode data for a city - longitude and latitude
    const geoCodeURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;

    try{
        //fetch geocode data to get latitude and longitude
        const geoResponse = await axios.get(geoCodeURL);
        const { lon, lat } = geoResponse.data.coord;

        //fetch current weather and forecast using the coordinates
        const [currentWeatherResponse, forecastResponse] = await Promise.all([
            axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`),
            axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}`)
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
        res.status(500).json({ error: 'Failed to fetch weather data' });
    }
});

//start the server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
