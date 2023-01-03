//global variables for search button and cities array for localStorage
var searchBtn = $("#search");
var cities = [];

//on document load, render past cities searched
$(document).ready(renderCity());

//user searches for a city, upon click of spyglass use AJAX to query that city from weather API, city saves in localStorage, findWeather function runs
//upon refresh, any cities in localStorage persist/append to unordered list (id: past-cities), need to create <li class="list-group-item"> for each
$(searchBtn).on("click", (event) => {
  event.preventDefault();
  $("#current-weather-card").empty();
  $("#forecast-future").empty();
  var cityInput = $("#search-city").val();
  if (cityInput === "") {
    return;
  }
  storeCity(cityInput);
  findWeather(cityInput);
  futureWeather(cityInput);
  renderCity();
  $("#search-city").val("");
});

//function to set cityInput to localStorage, adding it to the cities array
function storeCity(cityInput) {
  cities.push(cityInput);
  localStorage.setItem("cities", JSON.stringify([...cities]));
}

//function to render past cities searched
function renderCity() {
  var cityDiv = $("#past-cities");
  $(cityDiv).empty();
  $.each(JSON.parse(localStorage.getItem("cities")), function (i, city) {
    var newCity = $("<li>" + city + "</li>");
    newCity.addClass("list-group-item").appendTo(cityDiv);
  });
}

//today's forecast populates to the forecast-today div (card), 5-day forecast populates to the forecast-future(cards)
//defining global variable apiKey
var apiKey = "f208f3c155c74e66a18454aaa1a88a86";

//function to get current weather info
function findWeather(cityInput) {
  var queryUrl =
    "https://api.openweathermap.org/data/2.5/weather?q=" +
    cityInput +
    "&APPID=" +
    apiKey;
  $.ajax({
    url: queryUrl,
    method: "GET",
  }).then(function (response) {
    console.log(response);
    continueFindingWeather(response);
  });
}

function continueFindingWeather(response) {
  var queryUrl2 =
    "https://api.openweathermap.org/data/2.5/onecall?lat=" +
    response.coord.lat +
    "&lon=" +
    response.coord.lon +
    "&APPID=" +
    apiKey +
    "&units=imperial";
  $.ajax({
    url: queryUrl2,
    method: "GET",
  }).then(function (response2) {
    renderWeather(response2, response.name);
  });
}

function renderWeather(response2, cityInput) {
  var currentDate = $(
    "<h2>" + cityInput + " (" + moment().format("M/D/YYYY") + ")" + "<h2>"
  );
  var currentTemp = $(
    "<div>" + "Temperature: " + response2.current.temp + " &deg;F" + "</div>"
  );
  var currentHumidity = $(
    "<div>" + "Humidity: " + response2.current.humidity + "%" + "</div>"
  );
  var currentWind = $(
    "<div>" + "Wind Speed: " + response2.current.wind_speed + " mph" + "</div>"
  );
  var currentUvi = $(
    "<div>" +
      "UV Index: " +
      "<span>" +
      response2.current.uvi +
      "</span>" +
      "</div>"
  );
  var currentIcon = response2.current.weather[0].icon;
  var weatherIcon = $("<img>").attr(
    "src",
    "https://openweathermap.org/img/wn/" + currentIcon + "@2x.png"
  );
  $("#forecast-today").removeClass("d-none");
  $(currentDate).addClass("card-title").appendTo("#current-weather-card");
  $(weatherIcon).appendTo("#current-weather-card");
  $(currentTemp).addClass("card-text").appendTo("#current-weather-card");
  $(currentHumidity).addClass("card-text").appendTo("#current-weather-card");
  $(currentWind).addClass("card-text").appendTo("#current-weather-card");
  $(currentUvi).addClass("card-text").appendTo("#current-weather-card");
  if (response2.current.uvi < 4) {
    $("span").addClass("badge badge-success");
  }
  if (response2.current.uvi >= 4 && response2.current.uvi < 7) {
    $("span").addClass("badge badge-warning");
  }
  if (response2.current.uvi > 7) {
    $("span").addClass("badge badge-danger");
  }
}

//function to get future weather info

function futureWeather(cityInput) {
  var queryUrl =
    "https://api.openweathermap.org/data/2.5/forecast?q=" +
    cityInput +
    "&APPID=" +
    apiKey +
    "&units=imperial";
  $.ajax({
    url: queryUrl,
    method: "GET",
  }).then(function (response) {
    for (i = 7; i < response.list.length; i += 8) {
      var futureDate = $(
        "<h5>" + moment.unix(response.list[i].dt).format("M/D/YYYY") + "</h5>"
      );
      var futureTemp = $(
        "<div>" + "Temp: " + response.list[i].main.temp + " &deg;F" + "</div>"
      );
      var futureHumidity = $(
        "<div>" + "Humidity: " + response.list[i].main.humidity + "%" + "</div>"
      );
      var futureIcon = response.list[i].weather[0].icon;
      var futureWeatherIcon = $("<img>").attr(
        "src",
        "https://openweathermap.org/img/wn/" + futureIcon + "@2x.png"
      );
      var newCard = $("<div>").addClass("card").appendTo("#forecast-future");
      var newCardBody = $("<div>").addClass("card-body").appendTo(newCard);
      $(futureDate).addClass("card-title").appendTo(newCardBody);
      $(futureWeatherIcon).appendTo(newCardBody);
      $(futureTemp).addClass("card-text").appendTo(newCardBody);
      $(futureHumidity).addClass("card-text").appendTo(newCardBody);
    }
  });
}

//onclick function so that when user clicks a past-searched city, that current and future forecasts appear
$(document).on("click", ".list-group-item", function (event) {
  $("#current-weather-card").empty();
  $("#forecast-future").empty();
  findWeather(event.target.innerHTML);
  futureWeather(event.target.innerHTML);
});

//upon refresh, last searched city's forecast-today and forecast-future persists
$(document).ready(function () {
  var cities = JSON.parse(localStorage.getItem("cities"));
  var lastCity = cities[cities.length - 1];
  findWeather(lastCity);
  futureWeather(lastCity);
});
