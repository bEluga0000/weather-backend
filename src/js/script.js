async function getWeatherData(city){
    try{
        //getting the data from the server-side endpoint
        const response = await fetch(`http://localhost:3000/weather?city=${city}`);
      
        if (!response.ok){
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } 
    catch (error){
        console.error('Error fetching weather data:', error);
    }
}

const cityInputForm = document.getElementById('weatherForm');
cityInputForm.addEventListener('submit', async function(event){

    event.preventDefault();
    
    const cityName = document.getElementById('cityInput').value.trim();
    //console.log(cityName);

    const weatherData = await  getWeatherData(cityName);
    //console.log(weatherData);
    
    displayWeather(weatherData);

});

function displayWeather(weatherData){
    
}