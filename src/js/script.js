async function getWeatherData(city){
    //getting the data from the server-side endpoint
    const response = await fetch(`http://localhost:3000/weather?city=${city}`);
    if (response.status === 404) {
        return { error: 'City not found' };
    }
    if (!response.ok) {
        return { error: 'Network error occurred' };
    }
    const data = await response.json();
    return data;
}

const cityInputForm = document.getElementById('weatherForm');
cityInputForm.addEventListener('submit', async function(event){
    event.preventDefault();
    const cityName = document.getElementById('cityInput').value.trim();
    const result = document.querySelector('.current-weather');
    result.style.display = 'block';

    if (!cityName){
        result.innerHTML = 'Please Enter City Name ...';
        document.querySelector('.weather-forecast').style.display = 'none';
        document.querySelector('.hourly-forecast').style.display = 'none';
        return;
    }
    try{
        const weatherData = await  getWeatherData(cityName);
    
        if (weatherData.error){
            result.innerHTML = weatherData.error ;
            document.getElementById('cityInput').value = "";
            document.querySelector('.weather-forecast').style.display = 'none';
            document.querySelector('.hourly-forecast').style.display = 'none';
            return ;
        }
        result.innerHTML = 'Loading...';
        displayWeather(weatherData);
        displayForecast(weatherData);
    }
    catch (err){
        console.error('Unexpected error:', err);
        resultElement.innerHTML = 'An unexpected error occurred.';
    }
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
    const current = getNextFiveDaysWithNames();
    const cityDiv = document.createElement('div');
    cityDiv.classList.add('city-div');
    cityDiv.innerHTML = `<p>${currentWeatherRes.name} , ${currentWeatherRes.sys.country}</p><p id='today-date'>${current[0]}</p>`;
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
    tempDiv.innerHTML=`<p id='temp'>${currentWeatherRes.main.temp} °C</p><p>${currentWeatherRes.weather[0].main}</p>`;
    temperatureDiv.appendChild(tempDiv);

    //description details
    const weatherDesc = document.createElement('div');
    weatherDesc.classList.add('desc-div');
    weatherDesc.innerHTML=`<p id='desc'>${capitalize(currentWeatherRes.weather[0].description)}</p><p>Feels Like ${currentWeatherRes.main.feels_like} °C</p>`;
    temperatureDiv.appendChild(weatherDesc);

    currentWeatherDiv.appendChild(temperatureDiv);

    //remaining info such as humidity , pressure ...
    const otherInfoDiv = document.createElement('div');
    otherInfoDiv.classList.add('other-info');

    const pressure = document.createElement('div');
    pressure.innerHTML = `<p class='info-titles'>Pressure</p><p>${currentWeatherRes.main.pressure} hPa</p>`;
    otherInfoDiv.appendChild(pressure);

    const humidity = document.createElement('div');
    humidity.innerHTML = `<p class='info-titles'>Humidity</p><p>${currentWeatherRes.main.humidity} %</p>`;
    otherInfoDiv.appendChild(humidity);

    const visibility = document.createElement('div');
    visibility.innerHTML = `<p class='info-titles'>Visibility</p><p>${(currentWeatherRes.visibility/1000).toFixed(2)} km</p>`;
    otherInfoDiv.appendChild(visibility);

    const windSpeed = document.createElement('div');
    windSpeed.innerHTML = `<p class='info-titles'>Wind Speed</p><p>${currentWeatherRes.wind.speed} m/s</p>`;
    otherInfoDiv.appendChild(windSpeed);

    currentWeatherDiv.appendChild(otherInfoDiv);
}

function displayForecast(weatherData){
    //get the forecast div
    const weatherForecastDiv = document.querySelector('.weather-forecast');
    weatherForecastDiv.innerHTML = '';

    //get the hourly forecast-div
    const mainDiv = document.querySelector('.hourly-forecast');
    mainDiv.innerHTML = '';

    weatherForecastDiv.style.display = 'block';

    //get the forecast result and get the list of weather details
    let forecastRes = weatherData.forecast;
    let forecastList = forecastRes.list;

    //getting the bundled arrays for each day
    const bundledArray = getBundledData(forecastList);

    //getting the days in the format Tues, 26 Nov
    const daysWithNames = getNextFiveDaysWithNames(); 

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
                                <p>${fiveDaysData[0].main.temp} °C</p>
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
            showHourlyWeather(bundledArray[0] , daysWithNames[0] , mainDiv);
        });
    }
    fiveDaysDiv.appendChild(nextWeatherDiv);

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
                showHourlyWeather(bundledArray[i], daysWithNames[i] , mainDiv);
            });
        }
        fiveDaysDiv.appendChild(nextDaysDiv);
    }
    weatherForecastDiv.appendChild(fiveDaysDiv);
}

const showHourlyWeather= (bundle , day , mainDiv) => {
    mainDiv.innerHTML = '';
    mainDiv.style.display = 'block';

    const subDiv = document.createElement('div');
    subDiv.classList.add('sub-div');

    //adding functionality to close the hourly div
    const hidePara = document.createElement('p');
    hidePara.classList.add('hide-div');
    hidePara.innerHTML = `<span><i class="fa fa-close"></i></span>`;
    
    //adding functionality to hide the cross button
    hidePara.querySelector('span').addEventListener('click',()=>{
        mainDiv.style.display='none';
    })
    mainDiv.appendChild(hidePara);

    //adding date
    const dayDate = document.createElement('p');
    dayDate.classList.add('day-date');
    dayDate.innerText = `${day}`;
    mainDiv.appendChild(dayDate);

    //getting divs for each data from bundle array
    bundle.forEach(data => {

        const hourDiv = document.createElement('div');
        hourDiv.classList.add('hour-div');
        
        const time = document.createElement('p');
        time.innerText = `${convertTimestamp(data.dt_txt)}`;
        hourDiv.appendChild(time);

        const iconImg = document.createElement('img');
        iconImg.src=`https://openweathermap.org/img/wn/${data.weather[0].icon}.png`;
        iconImg.alt=`${data.weather[0].main}-weather-icon`;
        hourDiv.appendChild(iconImg);

        const div1 = document.createElement('div');
        div1.classList.add('divOne');

        const temp = document.createElement('p');
        temp.innerText = `${data.main.temp} °C`;
        div1.appendChild(temp);

        const weatherTitle = document.createElement('p');
        weatherTitle.innerText = `${data.weather[0].main}`
        div1.appendChild(weatherTitle);

        hourDiv.appendChild(div1);

        const div2 = document.createElement('div');
        div2.classList.add('divTwo');

        const press = document.createElement('p');
        press.innerText = `${data.main.pressure} hPa`
        div2.appendChild(press);

        const humdt = document.createElement('p');
        humdt.innerText = `${data.main.humidity} %`
        div2.appendChild(humdt);

        hourDiv.appendChild(div2);

        const div3 = document.createElement('div');
        div3.classList.add('divThree');

        const windSpd= document.createElement('p');
        windSpd.innerText = `${data.wind.speed} m/s`
        div3.appendChild(windSpd);

        const vsblty = document.createElement('p');
        vsblty.innerText = `${(data.visibility/1000).toFixed(2)} km`
        div3.appendChild(vsblty);

        hourDiv.appendChild(div3);

        subDiv.appendChild(hourDiv);
    });

    mainDiv.appendChild(subDiv);
}

//utility functions

const capitalize = (str) => {
    if (typeof str !== 'string' || str.length === 0) {
      return str;
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
}


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

const getBundledData = (forecastList) => {
    const bundles = []; 
    let currentBundle = [];

    forecastList.forEach((data) => {
        currentBundle.push(data);

        if (data.dt_txt.endsWith("21:00:00")) {
            bundles.push([...currentBundle]);
            currentBundle = [];
        }
    });

    if (currentBundle.length > 0) {
        bundles.push(currentBundle);
    }

    return bundles;
}

const convertTimestamp = (timestamp) => {
    const [date, time] = timestamp.split(" ");
    const [hour, minute] = time.split(":");
    const hourInt = parseInt(hour, 10);
    const period = hourInt >= 12 ? "PM" : "AM";
    let adjustedHour = hourInt % 12 || 12;

    if (hourInt === 0) {
        adjustedHour = 0;
    }

    let formattedTime = `${adjustedHour.toString().padStart(2, '0')}:${minute} ${period}`;

    return formattedTime;
}

  