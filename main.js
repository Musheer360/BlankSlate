document.addEventListener("DOMContentLoaded", function () {
  var chooseLocalBtn = document.getElementById("chooselocal");
  var chooseUnsplashBtn = document.getElementById("chooseUnsplash");

  chooseLocalBtn.addEventListener("click", function () {
    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.addEventListener("change", function () {
      var file = fileInput.files[0];

      if (file.type.startsWith("image/") && file.size <= 4 * 1024 * 1024) {
        var reader = new FileReader();

        reader.addEventListener("load", function () {
          var imageDataURL = reader.result;
          localStorage.setItem("imageData", imageDataURL);
          localStorage.setItem("isLocalImageSelected", "true");
          localStorage.removeItem("lastUpdate");
          setBackgroundImage();
        });

        reader.readAsDataURL(file);
      } else {
        console.error("Please select a valid image file (4 MB or below).");
      }
    });

    fileInput.click();
  });

  let isButtonClickAllowed = true;

  chooseUnsplashBtn.addEventListener("click", function () {
    if (isButtonClickAllowed) {
      isButtonClickAllowed = false;

      fetchUnsplashImage();

      setTimeout(function () {
        isButtonClickAllowed = true;
      }, 2000);
    }
  });

  setBackgroundImage();
});

function setBackgroundImage() {
  var imageDataURL = localStorage.getItem("imageData");
  var isLocalImageSelected = localStorage.getItem("isLocalImageSelected");
  var today = new Date();
  var lastUpdate = new Date(localStorage.getItem("lastUpdate"));

  if (isLocalImageSelected === "true" && imageDataURL) {
    document.body.style.background =
      "url(" + imageDataURL + ") no-repeat center / cover";
    return;
  }

  if (
    !navigator.onLine ||
    !lastUpdate ||
    lastUpdate.getDate() !== today.getDate()
  ) {
    if (isLocalImageSelected === "true") {
      document.body.style.background =
        "url(" + imageDataURL + ") no-repeat center / cover";
    } else {
      fetchUnsplashImage();
    }
  } else if (imageDataURL) {
    document.body.style.background =
      "url(" + imageDataURL + ") no-repeat center / cover";
  }
}

function fetchUnsplashImage() {
  const overlay = document.querySelector(".overlay");
  const originalAlpha = getComputedStyle(overlay)
    .getPropertyValue("background-color")
    .split(", ")[3]
    .replace(")", "");

  overlay.classList.add("fade-in-out");

  fetch("https://source.unsplash.com/1920x1080/?wallpapers")
    .then(function (response) {
      return response.url;
    })
    .then(function (imageURL) {
      localStorage.setItem("imageData", imageURL);
      localStorage.setItem("lastUpdate", new Date());
      localStorage.setItem("isLocalImageSelected", "false");

      overlay.style.backgroundColor = "rgba(0, 0, 0, 1)";
      setTimeout(function () {
        document.body.style.background =
          "url(" + imageURL + ") no-repeat center / cover";
        overlay.style.backgroundColor = `rgba(0, 0, 0, ${originalAlpha})`;
      }, 350);
    })
    .catch(function (error) {
      console.error("Failed to fetch background image:", error);
      loadRandomLocalImage();
    })
    .finally(function () {
      setTimeout(function () {
        overlay.classList.remove("fade-in-out");
      }, 1000);
    });
}

function loadRandomLocalImage() {
  var imageIndex = Math.floor(Math.random() * 5) + 1;
  var imageURL = "local-images/" + imageIndex + ".webp";
  document.body.style.background =
    "url(" + imageURL + ") no-repeat center / cover";
}

function toggleMenu() {
  const menuButton = document.getElementById("settingsMenu");
  menuButton.classList.toggle("opened");
  menuButton.setAttribute(
    "aria-expanded",
    menuButton.classList.contains("opened")
  );
}

function closeMenu(event) {
  const clickedElement = event.target;
  const isClickInsideMenu = clickedElement.closest("#settingsMenu");
  const isClickInsideSelectorMenu = clickedElement.closest("#selectormenu");
  const isClickInsideBlurBox = clickedElement.closest("#blurbox");
  const isClickInsideTintBox = clickedElement.closest("#tintbox");
  const isClickInsideImageBox = clickedElement.closest("#imagebox");

  if (
    !isClickInsideMenu &&
    !isClickInsideSelectorMenu &&
    !isClickInsideBlurBox &&
    !isClickInsideTintBox &&
    !isClickInsideImageBox
  ) {
    const menuButton = document.getElementById("settingsMenu");
    menuButton.classList.remove("opened");
    menuButton.setAttribute("aria-expanded", false);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const menuButton = document.getElementById("settingsMenu");
  menuButton.addEventListener("click", toggleMenu);
  document.body.addEventListener("click", closeMenu);
});

let isImageRotationAllowed = true;

function rotateImage(image) {
  if (isImageRotationAllowed) {
    isImageRotationAllowed = false;

    if (!image.classList.contains("rotated")) {
      image.classList.add("rotated");
      image.addEventListener(
        "animationend",
        () => {
          image.classList.remove("rotated");
        },
        { once: true }
      );
    }

    setTimeout(function () {
      isImageRotationAllowed = true;
    }, 2000);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const reloadIcon = document.getElementById("reloadIcon");
  reloadIcon.addEventListener("click", function () {
    rotateImage(reloadIcon);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  var asknameInput = document.getElementById("askname-input");
  var greeting = document.getElementById("greet");
  var timeEl = document.getElementById("time");
  var dateEl = document.getElementById("date");

  asknameInput.addEventListener("change", function () {
    localStorage.setItem("name", asknameInput.value);
    var name = asknameInput.value;
    var timeof = getTimeOfDay();
    greeting.textContent = `Good ${timeof}, ${name}!`;
  });

  function getTimeOfDay() {
    var clock = new Date();
    var hours = clock.getHours();
    if (hours < 12) {
      return "morning";
    } else if (hours < 18) {
      return "afternoon";
    } else {
      return "evening";
    }
  }

  function updateTime() {
    var clock = new Date();
    var hours = clock.getHours();
    var minutes = clock.getMinutes();
    var timeof = getTimeOfDay();

    var name = localStorage.getItem("name");

    if (name) {
      greeting.textContent = "Good " + timeof + ", " + name;
    } else {
      greeting.textContent = "Good " + timeof + "!";
      asknameInput.style.top = "3.5%";
      asknameInput.focus();
    }

    hours = hours % 12 || 12;
    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    var options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    var date = new Intl.DateTimeFormat("en-US", options).format(clock);

    var TimeString = hours + ":" + minutes;
    var DateString = date;
    if (timeEl.textContent !== TimeString) timeEl.textContent = TimeString;
    if (dateEl.textContent !== DateString) dateEl.textContent = DateString;
  }

  updateTime();
  var intervalId = setInterval(updateTime, 1000);

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      clearInterval(intervalId);
    } else {
      intervalId = setInterval(updateTime, 1000);
    }
  });
});

function quoteGen() {
  const quote = document.getElementById("mainquote");
  const author = document.getElementById("mainauthor");

  const cachedQuote = localStorage.getItem("quote");
  if (cachedQuote) {
    const cachedData = JSON.parse(cachedQuote);
    const cachedDate = new Date(cachedData.timestamp).toLocaleDateString();
    const now = new Date().toLocaleDateString();
    if (cachedDate === now) {
      quote.innerHTML = `“${cachedData.content}”`;
      author.innerHTML = `- ${cachedData.author}`;
      return;
    }
  }

  fetch("https://api.quotable.io/random?maxLength=50")
    .then((res) => res.json())
    .then((data) => {
      quote.innerHTML = `“${data.content}”`;
      author.innerHTML = `- ${data.author}`;
      data.timestamp = new Date().toISOString();
      localStorage.setItem("quote", JSON.stringify(data));
    })
    .catch((error) => {
      console.log(error);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  quoteGen();

  const shareButton = document.getElementById("shareButton");
  shareButton.addEventListener("click", shareOnTwitter);
});

function shareOnTwitter() {
  const quote = document.getElementById("mainquote").textContent;
  const author = document.getElementById("mainauthor").textContent;

  const tweetText = `${quote}\n${author} via @BlankSlateWeb`;
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    tweetText
  )}`;

  window.open(tweetUrl, "_blank");
}

let cursorTimer;

function hideCursor() {
  document.addEventListener("mousemove", () => {
    clearTimeout(cursorTimer);
    document.documentElement.style.cursor = "default";
    cursorTimer = setTimeout(() => {
      document.documentElement.style.cursor = "none";
    }, 4000);
  });
}

hideCursor();

let weather = {
  defaultUnit: localStorage.getItem("unit") || "metric",
  fetchWeather: function (city, unit) {
    const apiKey = this.apiKey;
    if (!city) {
      this.getCityByIP()
        .then((ipCity) => {
          if (!ipCity) {
            city = " New Delhi";
          } else {
            city = ipCity;
          }
          this.fetchWeatherData(city, unit, apiKey);
        })
        .catch((error) => {
          console.error("Error fetching IP-based city: ", error);
          city = "Delhi";
          this.fetchWeatherData(city, unit, apiKey);
        });
    } else {
      this.fetchWeatherData(city, unit, apiKey);
    }
  },

  fetchWeatherData: function (city, unit, apiKey) {
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&units=" +
        unit +
        "&appid=" +
        apiKey
    )
      .then((response) => response.json())
      .then((data) => {
        this.displayWeather(data, unit);
        localStorage.setItem("weatherData", JSON.stringify(data));
      })
      .catch((error) => {
        console.error("Error fetching weather data: ", error);
      });
  },

  getCityByIP: function () {
    return new Promise((resolve, reject) => {
      fetch("http://ip-api.com/json/?fields=city")
        .then((response) => response.json())
        .then((data) => {
          resolve(data.city);
        })
        .catch((error) => {
          reject(error);
        });
    });
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

    localStorage.setItem("unit", this.defaultUnit);
    const savedCity = localStorage.getItem("city");
    this.fetchWeather(savedCity, this.defaultUnit);
  },
};

Object.defineProperty(weather, "apiKey", {
  value: "f13b50734a9037f193248d4330b2360c",
  enumerable: false,
  writable: false,
  configurable: false,
});

document.addEventListener("DOMContentLoaded", function () {
  const city = document.getElementById("city");
  const searchBox = document.getElementById("searchbox-input");
  const searchInput = document.getElementById("searchbox-input");
  const tempClick = document.getElementById("temp");
  const unitsButton = document.getElementById("unitclick");
  const celciusBtn = document.getElementById("celcius");
  const fahrenhietBtn = document.getElementById("fahrenhiet");
  const nameInput = document.getElementById("askname-input");
  const menuButton = document.getElementById("menubtn");
  const selectorMenu = document.getElementById("selectormenu");
  const blurSlider = document.getElementById("blurSlider");
  const blurBox = document.getElementById("blurbox");
  const tintBox = document.getElementById("tintbox");
  const imageBox = document.getElementById("imagebox");
  const storedBlurValue = localStorage.getItem("blurValue");
  var alphaValue = localStorage.getItem("alphaValue");
  var alphaSlider = document.getElementById("alphaSlider");
  var overlay = document.getElementById("tint");
  const body = document.body;
  var greeting = document.getElementById("greet");

  const cachedData = localStorage.getItem("weatherData");
  if (cachedData) {
    const data = JSON.parse(cachedData);
    weather.displayWeather(data, weather.defaultUnit);
  } else {
    const savedCity = localStorage.getItem("city");
    if (savedCity) {
      weather.fetchWeather(savedCity, weather.defaultUnit);
    } else {
      weather.fetchWeather(weather.defaultCity, weather.defaultUnit);
    }
  }

  setTimeout(function () {
    const savedCity = localStorage.getItem("city");
    weather.fetchWeather(savedCity, weather.defaultUnit);

    setInterval(function () {
      const savedCity = localStorage.getItem("city");
      weather.fetchWeather(savedCity, weather.defaultUnit);
    }, 30 * 60 * 1000);
  }, 0);

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
      searchBox.focus();
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
      nameInput.focus();
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

  menuButton.addEventListener("click", function () {
    if (
      selectorMenu.style.left === "2.5%" &&
      blurBox.style.left === "2.5%" &&
      tintBox.style.left === "2.5%" &&
      imageBox.style.left === "2.5%"
    ) {
      selectorMenu.style.left = "-20%";
      selectorMenu.style.opacity = "0";
      blurBox.style.left = "-20%";
      blurBox.style.opacity = "0";
      tintBox.style.left = "-20%";
      tintBox.style.opacity = "0";
      imageBox.style.left = "-20%";
      imageBox.style.opacity = "0";
    } else {
      selectorMenu.style.left = "2.5%";
      selectorMenu.style.opacity = "0.65";
      blurBox.style.left = "2.5%";
      blurBox.style.opacity = "0.65";
      tintBox.style.left = "2.5%";
      tintBox.style.opacity = "0.65";
      imageBox.style.left = "2.5%";
      imageBox.style.opacity = "0.65";
    }
  });

  document.addEventListener("click", function (event) {
    const target = event.target;

    const isMenuElement =
      target === menuButton ||
      target === selectorMenu ||
      target === blurBox ||
      target === tintBox ||
      target === imageBox ||
      menuButton.contains(target) ||
      selectorMenu.contains(target) ||
      blurBox.contains(target) ||
      tintBox.contains(target) ||
      imageBox.contains(target);

    const isCityInputElement =
      target === city ||
      target === searchBox ||
      city.contains(target) ||
      searchBox.contains(target);

    const isUnitsInputElement =
      target === tempClick ||
      target === unitsButton ||
      tempClick.contains(target) ||
      unitsButton.contains(target);

    const isNameInputElement =
      target === greeting ||
      target === nameInput ||
      greeting.contains(target) ||
      nameInput.contains(target);

    if (!isMenuElement) {
      menuButton.classList.remove("opened");
      menuButton.setAttribute("aria-expanded", false);

      selectorMenu.style.left = "-20%";
      selectorMenu.style.opacity = "0";
      blurBox.style.left = "-20%";
      blurBox.style.opacity = "0";
      tintBox.style.left = "-20%";
      tintBox.style.opacity = "0";
      imageBox.style.left = "-20%";
      imageBox.style.opacity = "0";
    }

    if (!isCityInputElement) {
      searchBox.style.top = "-10%";
    }

    if (!isUnitsInputElement) {
      unitsButton.style.top = "-10%";
    }

    if (!isNameInputElement) {
      nameInput.style.top = "-10%";
    }
  });

  if (storedBlurValue) {
    body.style.webkitBackdropFilter = `blur(${storedBlurValue}px)`;
    body.style.backdropFilter = `blur(${storedBlurValue}px)`;
    blurSlider.value = storedBlurValue;
  }

  blurSlider.addEventListener("input", function () {
    const blurValue = this.value;
    body.style.webkitBackdropFilter = `blur(${blurValue}px)`;
    body.style.backdropFilter = `blur(${blurValue}px)`;

    localStorage.setItem("blurValue", blurValue);
  });

  if (alphaValue === null) {
    alphaValue = 50;
  } else {
    alphaValue = parseInt(alphaValue);
  }

  overlay.style.backgroundColor = `rgba(0, 0, 0, ${alphaValue / 100})`;

  alphaSlider.value = alphaValue;
  alphaSlider.addEventListener("input", function () {
    alphaValue = parseInt(this.value);
    overlay.style.backgroundColor = `rgba(0, 0, 0, ${alphaValue / 100})`;
  });

  alphaSlider.addEventListener("change", function () {
    localStorage.setItem("alphaValue", alphaValue);
  });
});

document.addEventListener(
  "contextmenu",
  function (event) {
    event.preventDefault();
  },
  false
);
