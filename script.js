$(document).ready(function() {
  var prevSearches;

  // Functions
  function indexOfCaseInsensitive(array, text) {
    var index = -1;

    if (array != null) {
      for(let i = 0; i < array.length; i++) {
        if (array[i].toLowerCase() === text.toLowerCase().trim()) {
          index = i;
          break;
        }
      }
    }

    return index;
  }

  function addCity(text) {
    var index = indexOfCaseInsensitive(prevSearches, text);
    if (index > -1) {
      prevSearches.splice(index, 1);
    }

    prevSearches.unshift(text.trim());
    localStorage.setItem('prevSearches', JSON.stringify(prevSearches));
  }

  function repaintSearchHistory() {
    var searchHistory = $('#search-history');
    searchHistory.empty();

    for (let i = 0; i < prevSearches.length; i++)
    {
      let newSearch = $('<li>');
      newSearch.addClass('list-group-item list-group-item-action');
      newSearch.text(prevSearches[i]);

      searchHistory.append(newSearch);
    }


  }

  function getUvIndex(lattitude, longitude) {
    var uvIndex;

    var apiKey = '4f52a049b01e8f2b31bd78273fe21e1f';
    var queryURL = 'https://api.openweathermap.org/data/2.5/uvi?appid=' + apiKey + '&lat=' + lattitude + '&lon=' + longitude;

    $.ajax({
      url: queryURL,
      method: 'GET',
      async: false
    })
    .done(function(response) {

      uvIndex = $('<p>')
      uvIndex.text('UV Index: ');

      var uvIndexValue = $('<span>');
      uvIndexValue.addClass('btn btn-sm');
      uvIndexValue.text(response.value);

      if (response.value < 3) {
        uvIndexValue.addClass("btn-success");
      }
      else if (response.value < 7) {
        uvIndexValue.addClass("btn-warning");
      }
      else {
        uvIndexValue.addClass("btn-danger");
      }

      uvIndex.append(uvIndexValue);

    })
    .fail(function(response) {
      // Handle failed call here, do nothing for now
    });

    return uvIndex;
  }

  function displayCurrentWeather(apiResponse) {
    // Clear the current weather
    var currentWeather = $('#current-weather');
    currentWeather.empty();

    // create html content for current weather
    var currentImage = $('<img>');
    currentImage.attr('src', 'https://openweathermap.org/img/w/' + apiResponse.weather[0].icon + '.png');

    var title = $('<h3>');
    title.addClass('card-title');
    title.text(apiResponse.name + ' (' + new Date().toLocaleDateString() + ')');
    title.append(currentImage);

    var temperature = $('<p>');
    temperature.addClass('card-text');
    temperature.text('Temperature: ' + apiResponse.main.temp + ' °F');

    var humidity = $('<p>');
    humidity.addClass('card-text')
    humidity.text('Humidity: ' + apiResponse.main.humidity + '%');

    var windSpeed = $('<p>');
    windSpeed.addClass('card-text');
    windSpeed.text('Wind Speed: ' + apiResponse.wind.speed + ' MPH');

    var uvIndex = getUvIndex(apiResponse.coord.lat, apiResponse.coord.lon);

    // add to page
    var cardBody = $('<div>')
    cardBody.addClass('card-body');
    cardBody.append(title, temperature, humidity, windSpeed, uvIndex);

    var card = $('<div>');
    card.addClass('card');
    card.append(cardBody);
    currentWeather.append(card);
  }

  function getCurrentWeather(cityName, isNewSearch = false) {
    var apiKey = '4f52a049b01e8f2b31bd78273fe21e1f';
    var queryURL = 'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=' + apiKey + '&units=imperial';

    $.ajax({
      url: queryURL,
      method: 'GET'
    })
    .done(function(response) {
      if (isNewSearch) {
        addCity(cityName);
        repaintSearchHistory();
      }

      displayCurrentWeather(response);

    })
    .fail(function(response) {
      // Handle failed call here, do nothing for now
    });
  }

  function getSingleDayForecast(forecastIncrement) {
    var day = $('<div>')
    day.addClass('col-md-2');

    var card = $('<div>')
    card.addClass('card bg-primary text-white');

    var cardBody = $('<div>')
    cardBody.addClass('card-body p-2');

    var cardTitle = $('<h5>')
    cardTitle.addClass('card-title');
    cardTitle.text(new Date(forecastIncrement.dt_txt).toLocaleDateString());

    var image = $('<img>');
    image.attr('src', 'https://openweathermap.org/img/w/' + forecastIncrement.weather[0].icon + '.png');

    var temp = $('<p>');
    temp.addClass('card-text');
    temp.text('Temp: ' + forecastIncrement.main.temp_max + ' °F');

    var humidity = $('<p>');
    humidity.addClass('card-text');
    humidity.text('Humidity: ' + forecastIncrement.main.humidity + '%');

    cardBody.append(cardTitle, image, temp, humidity);
    card.append(cardBody);
    day.append(card);

    return day;
  }

  function displayForecast(apiResponse) {
    // Clear the current forecast
    var forecastWeather = $('#forecast-weather');
    forecastWeather.empty();

    var title = $('<h4>');
    title.addClass('mt-3');
    title.text('5-Day Forecast:');

    var days = $('<div>');
    days.addClass('row');

    // The response has a list of forecasts in 3 hour increments
    for (let i = 0; i < apiResponse.list.length; i++) {
      var forecastIncrement = apiResponse.list[i];

      if (forecastIncrement.dt_txt.includes('15:00:00')) {
        var day = getSingleDayForecast(forecastIncrement);
        days.append(day);
      }
    }

    forecastWeather.append(title, days);
  }

  function getForecast(cityName) {
    var apiKey = '4f52a049b01e8f2b31bd78273fe21e1f';
    var queryURL = 'https://api.openweathermap.org/data/2.5/forecast?q=' + cityName + '&appid=' + apiKey + '&units=imperial';

    $.ajax({
      url: queryURL,
      method: 'GET',
    })
    .done(function(response) {

      displayForecast(response);

    })
    .fail(function(response) {
      // Handle failed call here, do nothing for now
    });
  }

  function getCityWeather(cityName, isNewSearch = false) {
    getCurrentWeather(cityName, isNewSearch);
    getForecast(cityName);

  }

  function getCityName() {
    var searchInputEl = $('#search-input');
    var cityName = searchInputEl.val();
    searchInputEl.val(''); // clear textbox after search

    return cityName;
  }

  function loadSearchHistory() {
    prevSearches = JSON.parse(localStorage.getItem('prevSearches'));

    if (prevSearches == null) {
      prevSearches = [];
    } else if (prevSearches.length > 0) {
      repaintSearchHistory();
      getCityWeather(prevSearches[0]);
    }
  }

  // Event Listener for clicking the Search Button
  $('#search-button').click(function() {
    getCityWeather(getCityName(), true);
  });

  // Event Listener for pressing Enter in the Search text box
  $('#search-input').keypress(function(event) {
    var keycode = (event.keyCode ? event.keyCode : event.which);
    if(keycode == '13') {
      getCityWeather(getCityName(), true);
    }
  });

  // Event Listener for clicking an item in the search history
  $('#search-history').on('click', 'li', function() {
    var cityName = $(this).text();
    getCityWeather(cityName);
  });


  loadSearchHistory();

});
