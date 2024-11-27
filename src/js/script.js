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

    const weatherData = await  getWeatherData(cityName);
    
    displayWeather(weatherData);
    displayForecast(weatherData);

});

function displayWeather(weatherData){
    //get the div
    const currentWeatherDiv = document.querySelector('.current-weather');
    currentWeatherDiv.innerHTML='';
    //currentWeatherDiv.classList.remove('hidden');
    currentWeatherDiv.style.display = 'block';

    //shortcut for current weather response
    let currentWeatherRes = weatherData.currentWeather ;

    //city name , country code , Date 
    const current = getCurrentTime();
    const cityDiv = document.createElement('div');
    cityDiv.classList.add('city-div');
    cityDiv.innerHTML = `<p>${currentWeatherRes.name} , ${currentWeatherRes.sys.country} <span id='today-date'>${current.date}</span></p>`;
    currentWeatherDiv.appendChild(cityDiv);

    //temperature and weather description details
    const temperatureDiv = document.createElement('div');
    temperatureDiv.classList.add('temperature-div');

    //weather icon
    const weatherIcon = document.createElement('img');
    weatherIcon.src=`https://openweathermap.org/img/wn/${currentWeatherRes.weather[0].icon}.png`;
    weatherIcon.alt=`${currentWeatherRes.weather[0].main}-weather-icon`;
    temperatureDiv.appendChild(weatherIcon);

    //temperature details
    const tempDiv = document.createElement('div');
    tempDiv.classList.add('temp-div');
    tempDiv.innerHTML=`<p>${currentWeatherRes.main.temp}°C</p><p>${currentWeatherRes.weather[0].main}</p>`;
    temperatureDiv.appendChild(tempDiv);

    //description details
    const weatherDesc = document.createElement('div');
    weatherDesc.classList.add('desc-div');
    weatherDesc.innerHTML=`<p>${currentWeatherRes.weather[0].description}</p><p>Feels Like ${currentWeatherRes.main.feels_like}°C</p>`;
    temperatureDiv.appendChild(weatherDesc);

    currentWeatherDiv.appendChild(temperatureDiv);

    //remaining info such as humidity , pressure ...
    const otherInfoDiv = document.createElement('div');
    otherInfoDiv.classList.add('other-info');

    const pressure = document.createElement('div');
    pressure.innerHTML = `<p>Pressure</p><p>${currentWeatherRes.main.pressure} hPa</p>`;
    otherInfoDiv.appendChild(pressure);

    const humidity = document.createElement('div');
    humidity.innerHTML = `<p>Humidity</p><p>${currentWeatherRes.main.humidity} %</p>`;
    otherInfoDiv.appendChild(humidity);

    const visibility = document.createElement('div');
    visibility.innerHTML = `<p>Visibility</p><p>${currentWeatherRes.visibility} m</p>`;
    otherInfoDiv.appendChild(visibility);

    const windSpeed = document.createElement('div');
    windSpeed.innerHTML = `<p>Wind Speed</p><p>${currentWeatherRes.wind.speed} m/s</p>`;
    otherInfoDiv.appendChild(windSpeed);

    currentWeatherDiv.appendChild(otherInfoDiv);
}

function displayForecast(weatherData){
    //get the forecast result and get the list of weather details
    let forecastRes = weatherData.forecast;
    let forecastList = forecastRes.list;

    //get the forecast div
    const weatherForecastDiv = document.querySelector('.weather-forecast');
    weatherForecastDiv.innerHTML = '';
    weatherForecastDiv.style.display = 'block';

    //div for storing 5 days weather ( not in detail)
    const fiveDaysDiv = document.createElement('div');
    fiveDaysDiv.classList.add('five-days-div');

    /*array to store 5 days forecast data -> first element is always stored 
    followed by the remaining days forecast data of first hour xx-xx-xx 00:00:00 */
    let fiveDaysData = [forecastList[0]];
    let i=1;
    const nextDates = getNextFiveDays();
    forecastList.forEach(data => {
        if (data.dt_txt === `${nextDates[i]} 00:00:00`){
            fiveDaysData.push(data);
            i++;
        }
    });

    //creating a seperate div for today's info -> first element of the five days.
    const nextWeatherDiv = document.createElement('div');
    nextWeatherDiv.classList.add('next-hour-weather');
    nextWeatherDiv.innerHTML = `<div id='div1'>
                                <p>Later Today</p>
                                <img src="https://openweathermap.org/img/wn/${fiveDaysData[0].weather[0].icon}.png" alt="Weather Icon">
                                </div>
                                <div id='div2'>
                                <p>${fiveDaysData[0].main.temp}°C</p>
                                <p>${fiveDaysData[0].weather[0].main}</p>
                                </div>
                                `;
    //code to diplay today's hourly forecast
    const divOne = nextWeatherDiv.querySelector('#div1');
    if (divOne){
        const laterToday = divOne.querySelector('p'); 
        const originalText = laterToday.textContent;
        laterToday.addEventListener('mouseenter',() => {
            laterToday.style.textDecoration = 'underline';
            const moreIcon = document.createElement('span');
            moreIcon.id = 'more-icon';
            moreIcon.innerHTML = '<i class="fa fa-arrow-circle-right"></i>';
            const combinedText = originalText +' '+ moreIcon.outerHTML;
            laterToday.innerHTML = combinedText;
        });
        
        laterToday.addEventListener('mouseleave',() => {
            laterToday.style.textDecoration = 'none';
            laterToday.textContent = originalText;
        });
        laterToday.addEventListener('click', ()=>{
            showHourlyWeather(fiveDaysData[0].dt_txt);
        });
    }
    fiveDaysDiv.appendChild(nextWeatherDiv);
    //getting the days in the format Tues, 26 Nov
    const daysWithNames = getNextFiveDaysWithNames(); 

    //creating remaining divs for forecast data
    for (let i=1; i<5 ; i++) {
        const nextDaysDiv = document.createElement('div');
        nextDaysDiv.classList.add('next-day-div');
        nextDaysDiv.innerHTML=`<p>${daysWithNames[i]}</p>
                               <img src="https://openweathermap.org/img/wn/${fiveDaysData[i].weather[0].icon}.png" alt="Weather Icon">
                               <p>${fiveDaysData[i].main.temp}°C</p>
                               <p>${fiveDaysData[i].weather[0].main}</p>
                               `;
        //code to display hourly weather forecast
        let datePara = nextDaysDiv.querySelector('p');
        datePara.classList.add('date-para');
        if (datePara) {
            const originalText = datePara.textContent;
            datePara.addEventListener('mouseenter',() => {
                datePara.style.textDecoration = 'underline';
                const moreIcon = document.createElement('span');
                moreIcon.id = 'more-icon';
                moreIcon.innerHTML = '<i class="fa fa-arrow-circle-right"></i>';
                const combinedText = originalText +' '+ moreIcon.outerHTML;
                datePara.innerHTML = combinedText;
            });
            datePara.addEventListener('mouseleave',() => {
                datePara.style.textDecoration = 'none';
                datePara.textContent = originalText;
            });
            datePara.addEventListener('click', () => {
                showHourlyWeather(fiveDaysData[i].dt_txt);
            });
        }
        fiveDaysDiv.appendChild(nextDaysDiv);
    }
    weatherForecastDiv.appendChild(fiveDaysDiv);
}

const showHourlyWeather= (firstHourTime) => {
    const currHour = firstHourTime;
    console.log(`getting hourly data , ${currHour}`);
}

//utility functions
const getCurrentTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate(); 
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds(); 
    return {
        "date" : `${year}-${month}-${date}`,
        "time" : `${hours}:${minutes}:${seconds}`
    };
}

const getNextFiveDays = () => {
    const dates = [];
    const today = new Date();
  
    for (let i = 0; i <=5; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        dates.push(`${currentDate.toISOString().split('T')[0]}`);
    }

    return dates;
};

const getNextFiveDaysWithNames = () => {
    const days = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();

    for (let i = 0; i < 5; i++) {
        const currentDate = new Date(today);
        currentDate.setDate(today.getDate() + i);
        const dayName = dayNames[currentDate.getDay()]; 
        const date = currentDate.getDate(); 
        const monthName = monthNames[currentDate.getMonth()];
        days.push(`${dayName} ${date} ${monthName}`);
    }

    return days;
};

  
  