function updateTime() {
  var clock = new Date();
  var hours = clock.getHours();
  var minutes = clock.getMinutes();
  var timeof;

  if (hours < 12 && hours >= 0) {
    timeof = "morning";
  } else if (hours < 18 && hours >= 12) {
    timeof = "afternoon";
  } else if (hours >= 18 && hours <= 23) {
    timeof = "evening";
  }

  var asknameInput = document.getElementById("askname-input");
  var greeting = document.getElementById("greet");
  var name = localStorage.getItem("name");

  if (name) {
    greeting.innerHTML = "Good " + timeof + ", " + name + "!";
  } else {
    greeting.innerHTML = "Good " + timeof + "!";
    asknameInput.style.top = "3.5%";
  }

  asknameInput.addEventListener("change", function () {
    name = asknameInput.value;
    localStorage.setItem("name", name);
    greeting.innerHTML = `Good ${timeof}, ${name}!`;
  });

  if (hours == 0) {
    hours = 12;
  } else if (hours > 12) {
    hours = hours % 12;
  }

  hours = hours < 10 ? "0" + hours : hours;
  minutes = minutes < 10 ? "0" + minutes : minutes;

  var options = {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  var date = clock.toLocaleDateString("en-US", options);

  var TimeString = hours + ":" + minutes;
  var DateString = date;
  document.getElementById("time").innerHTML = TimeString;
  document.getElementById("date").innerHTML = DateString;
}

setInterval(updateTime, 1000);

function loadRandomBackground() {
  var images = [
    "local-images/1.jpg",
    "local-images/2.jpg",
    "local-images/3.jpg",
    "local-images/4.jpg",
    "local-images/5.jpg",
    "local-images/6.jpg",
    "local-images/7.jpg",
    "local-images/8.jpg",
  ];
  var randomIndex = Math.floor(Math.random() * images.length);
  var randomImage = images[randomIndex];
  document.body.style.background =
    "url('" + randomImage + "') no-repeat center";
}

function checkInternetConnectivity() {
  var imageAddr = "https://source.unsplash.com/user/marekpiwnicki/1920x1080";
  var downloadImage = new Image();
  downloadImage.onload = function () {
    document.body.style.background =
      "url('" + imageAddr + "')  no-repeat center";
  };
  downloadImage.onerror = function () {
    loadRandomBackground();
  };
  downloadImage.src = imageAddr + "?n=" + Math.random();
}

checkInternetConnectivity();

function quoteGen() {
  const quote = document.getElementById("mainquote");
  const author = document.getElementById("author");

  fetch("http://api.quotable.io/random?maxLength=50")
    .then((res) => res.json())
    .then((data) => {
      mainquote.innerHTML = `“${data.content}”`;
      mainauthor.innerHTML = `- ${data.author}`;
    });
}

quoteGen();

let weather = {
  apiKey: "f13b50734a9037f193248d4330b2360c",
  defaultCity: "Delhi",
  defaultUnit: localStorage.getItem("unit") || "metric",
  fetchWeather: function (city, unit) {
    if (!city) {
      city = this.defaultCity;
    }
    if (!unit) {
      unit = this.defaultUnit;
    }
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&units=" +
        unit +
        "&appid=" +
        this.apiKey
    )
      .then((response) => response.json())
      .then((data) => this.displayWeather(data, unit));
  },

  displayWeather: function (data, unit) {
    const { name } = data;
    const { description } = data.weather[0];
    const { temp } = data.main;
    const roundedTemp = Math.floor(temp);
    const cityName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    document.getElementById("city").innerText = cityName;
    document.getElementById("description").innerText = description;
    if (unit === "metric") {
      document.getElementById("temp").innerText = roundedTemp + "°C";
    } else {
      document.getElementById("temp").innerText = roundedTemp + "°F";
    }
  },

  setUnit: function (unit) {
    if (unit === "metric") {
      this.defaultUnit = "metric";
      document.getElementById("celcius").classList.add("active");
      document.getElementById("fahrenhiet").classList.remove("active");
    } else if (unit === "imperial") {
      this.defaultUnit = "imperial";
      document.getElementById("fahrenhiet").classList.add("active");
      document.getElementById("celcius").classList.remove("active");
    }
    const savedCity = localStorage.getItem("city");
    this.fetchWeather(savedCity, this.defaultUnit);

    localStorage.setItem("unit", this.defaultUnit);
    this.fetchWeather(savedCity, this.defaultUnit);
  },
};

document.addEventListener("DOMContentLoaded", function () {
  const city = document.getElementById("city");
  const searchBox = document.getElementById("searchbox-input");
  const searchInput = document.getElementById("searchbox-input");
  const tempClick = document.getElementById("temp");
  const unitsButton = document.getElementById("unitclick");
  const celciusBtn = document.getElementById("celcius");
  const fahrenhietBtn = document.getElementById("fahrenhiet");
  const nameInput = document.getElementById("askname-input");
  var greeting = document.getElementById("greet");

  const savedCity = localStorage.getItem("city");
  if (savedCity) {
    weather.fetchWeather(savedCity, weather.defaultUnit);
  } else {
    weather.fetchWeather(weather.defaultCity, weather.defaultUnit);
  }

  searchInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      const city = searchInput.value;
      weather.fetchWeather(city, weather.defaultUnit);
      localStorage.setItem("city", city);
      document.getElementById("city").innerText = city;
      searchBox.style.top = "-10%";
    }
  });

  city.addEventListener("click", function () {
    if (searchBox.style.top === "3.5%") {
      searchBox.style.top = "-10%";
    } else {
      searchBox.style.top = "3.5%";
    }
  });

  nameInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      nameInput.style.top = "-10%";
    }
  });

  greeting.addEventListener("click", function () {
    if (nameInput.style.top === "3.5%") {
      nameInput.style.top = "-10%";
    } else {
      nameInput.style.top = "3.5%";
    }
  });

  tempClick.addEventListener("click", function () {
    if (unitsButton.style.top === "3.5%") {
      unitsButton.style.top = "-10%";
    } else {
      unitsButton.style.top = "3.5%";
    }
  });

  celciusBtn.addEventListener("click", function () {
    weather.setUnit("metric");
    unitclick.style.top = "-10%";
  });

  fahrenhietBtn.addEventListener("click", function () {
    weather.setUnit("imperial");
    unitclick.style.top = "-10%";
  });
});
