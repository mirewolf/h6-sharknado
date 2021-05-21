$(document).ready(function() {
  // converts string from localstorage back to an array
  var cities = JSON.parse(localStorage.getItem("cities")) || [];

  for (var i = 0; i < cities.length; i++){
    var cityName = $("<li>").text(cities[i]);
    $(".history").prepend(cityName);
  }

  // attach event listener to id
  $("#search-button").on("click", function() {
    // create variable for city value
    var city = $("#city").val();
    // excludes empty and repeated values
    if (city != ""){
      // clear search box
      $("#city").val("");
      // check if new search is in city list, if not, push city
      if (!cities.includes(city)){
        cities.push(city);
        // storage saves key value pairs of array as a string
        localStorage.setItem("cities", JSON.stringify(cities));
        // made a new element (li) and appended city to history ul
        var cityName = $("<li>").text(city);
        $(".history").prepend(cityName);
      }
      // Display city
      getCurrentDate(city);
      getForecast(city);
    }
    else{
      alert("Invalid response");
    }
  });

  $("#delete-button").on("click", function() {
    localStorage.clear();
    $(".history").empty();
    cities = [];
  });

  function getCurrentDate(city){
    // create var for URL
    var queryURL = "http://api.openweathermap.org/data/2.5/weather?q=" + city + "&appid=f0e59b5f6d1f779e08e9cf5cfcf9307c&units=metric"

    // call information using AJAX
    $.ajax({
      type: "GET",
      url: queryURL,
      success: function(data){
        console.log(data);
        // create div to hold move, store the data, and create an element for the data to be displayed

        var currentDayContainer = $("<div>");
        var currentDate = new Date();
        var cityName = $("<h1>").text(data.name)
        currentDayContainer.append(cityName);

        var imgURL = "http://openweathermap.org/img/w/" + data.weather[0].icon + ".png"
        var imgIcon = $("<img>").attr("src", imgURL);
        currentDayContainer.append(imgIcon);

        // in this div we also added respective time and date of displayed weather
        var time = $("<h4>").text(currentDate.toDateString() + " at " + new Date().toLocaleTimeString());
        currentDayContainer.append(time);

        var temperature = data.main.temp;
        var pTemp = $("<h4>").text("Temperature: " + temperature + "°C");
        currentDayContainer.append(pTemp);

        var humidity = data.main.humidity;
        var pHumid = $("<h4>").text("Humidity: " + humidity + "%");
        currentDayContainer.append(pHumid);


        var windSpeed = data.wind.speed;
        var pwindSpeed = $("<h4>").text("Wind Speed: " + windSpeed + "KPH");
        currentDayContainer.append(pwindSpeed);

        // clearing the previous display
        $("#today").empty();
        $("#today").prepend(currentDayContainer);
      }
    });
  }

  // gets the forecast of 5 days
  function getForecast(city){
    var queryURL = "http://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=f0e59b5f6d1f779e08e9cf5cfcf9307c&units=metric"
    // call information using AJAX
    $.ajax({
      type: "GET",
      url: queryURL,
      success: function(data){
        console.log(data);
        var outerDivForecast = $("<div>");
        $("#forecast").empty();
        $("#forecast").prepend(outerDivForecast);

        // For loop number through 5 day forecast
        for (var i = 3; i < data.list.length; i+=8){

          var forecastCard = $("<div>");
          forecastCard.addClass("card-size");

          var p = $("<p>").text(data.list[i].dt_txt);
          forecastCard.append(p);
          outerDivForecast.append(forecastCard);

          var imgURL = "http://openweathermap.org/img/w/" + data.list[i].weather[0].icon + ".png"
          var imgIcon = $("<img>").attr("src", imgURL);
          forecastCard.append(imgIcon);

          if (data.list[i].weather[0].icon == "01d"){
            forecastCard.addClass("card-clear");
          }
          else if (data.list[i].weather[0].icon == "03d"){
            forecastCard.addClass("card-sc");
          }
          else if (data.list[i].weather[0].icon == "10d"){
            forecastCard.addClass("card-rain");
          }
          else if (data.list[i].weather[0].icon == "13d"){
            forecastCard.addClass("card-snow");
          }
          else {
            forecastCard.addClass("card-default");
          }

          var temperature = data.list[i].main.temp;
          var pTemp = $("<p>").text("Temperature: " + temperature + "°C");
          forecastCard.append(pTemp);

          var humidity = data.list[i].main.humidity;
          var pHumid = $("<p>").text("Humidity: " + humidity + "%");
          forecastCard.append(pHumid);
        }

      }
    });
  }
});
