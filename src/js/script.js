async function getWeatherData(city) {
    try{
        //fetch data from the server-side endpoint
        const response = await fetch(`http://localhost:3000/weather?city=${city}`);
      
        if (!response.ok){
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
      
        console.log('Current Weather:', data.currentWeather);
        console.log('Forecast:', data.forecast);
    } 
    catch (error){
        console.error('Error fetching weather data:', error);
    }
}
  
getWeatherData('New York');
  