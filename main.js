document.addEventListener("DOMContentLoaded", function () {
  var chooseLocalBtn = document.getElementById("chooselocal");
  var refreshBackgroundButton = document.getElementById("refreshBackground");

  // Allow users to select a local image for personalization
  chooseLocalBtn.addEventListener("click", function () {
    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.addEventListener("change", function () {
      var file = fileInput.files[0];

      // Validate file type and size to ensure proper image loading and performance
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

  // Implement throttling to prevent excessive API calls and improve performance
  let isButtonClickAllowed = true;

  refreshBackgroundButton.addEventListener("click", function () {
    if (isButtonClickAllowed) {
      isButtonClickAllowed = false;

      fetchBackgroundImage();

      // Reset the throttle after 2 seconds
      setTimeout(function () {
        isButtonClickAllowed = true;
      }, 2000);
    }
  });

  setBackgroundImage();
});

// Set the background image based on local storage or fetch a new one
function setBackgroundImage() {
  var imageDataURL = localStorage.getItem("imageData");
  var isLocalImageSelected = localStorage.getItem("isLocalImageSelected");
  var today = new Date();
  var lastUpdate = new Date(localStorage.getItem("lastUpdate"));

  // Prioritize user-selected local image for personalization
  if (isLocalImageSelected === "true" && imageDataURL) {
    document.body.style.background =
      "url(" + imageDataURL + ") no-repeat center / cover";
    return;
  }

  // Fetch new image if offline, no last update, or it's a new day to keep content fresh
  if (
    !navigator.onLine ||
    !lastUpdate ||
    lastUpdate.getDate() !== today.getDate()
  ) {
    if (isLocalImageSelected === "true") {
      document.body.style.background =
        "url(" + imageDataURL + ") no-repeat center / cover";
    } else {
      fetchBackgroundImage();
    }
  } else if (imageDataURL) {
    document.body.style.background =
      "url(" + imageDataURL + ") no-repeat center / cover";
  }
}

// Fetch a new background image from the API
function fetchBackgroundImage() {
  const overlay = document.querySelector(".overlay");
  const originalAlpha = getComputedStyle(overlay)
    .getPropertyValue("background-color")
    .split(", ")[3]
    .replace(")", "");

  // Add fade effect for smooth transition
  overlay.classList.add("fade-in-out");

  fetch("https://bingw.jasonzeng.dev?index=random")
    .then(function (response) {
      return response.url;
    })
    .then(function (imageURL) {
      // Store the new image data for faster loading on subsequent visits
      localStorage.setItem("imageData", imageURL);
      localStorage.setItem("lastUpdate", new Date());
      localStorage.setItem("isLocalImageSelected", "false");

      // Implement smooth transition effect
      overlay.style.backgroundColor = "rgba(0, 0, 0, 1)";
      setTimeout(function () {
        document.body.style.background =
          "url(" + imageURL + ") no-repeat center / cover";
        overlay.style.backgroundColor = `rgba(0, 0, 0, ${originalAlpha})`;
      }, 350);
    })
    .catch(function (error) {
      console.error("Failed to fetch background image:", error);
      // Fallback to local image if API fetch fails
      loadRandomLocalImage();
    })
    .finally(function () {
      // Remove transition class after animation completes
      setTimeout(function () {
        overlay.classList.remove("fade-in-out");
      }, 1000);
    });
}

// Load a random local image as a fallback option
function loadRandomLocalImage() {
  var imageIndex = Math.floor(Math.random() * 5) + 1;
  var imageURL = "local-images/" + imageIndex + ".webp";
  document.body.style.background =
    "url(" + imageURL + ") no-repeat center / cover";
}

// Toggle the settings menu for user customization
function toggleMenu() {
  const menuButton = document.getElementById("settingsMenu");
  menuButton.classList.toggle("opened");
  menuButton.setAttribute(
    "aria-expanded",
    menuButton.classList.contains("opened"),
  );
}

// Close the menu when clicking outside for better UX
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

// Implement image rotation animation for visual feedback
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
        { once: true },
      );
    }

    // Prevent rapid successive rotations
    setTimeout(function () {
      isImageRotationAllowed = true;
    }, 2000);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const refreshBackgroundButton = document.getElementById("refreshBackground");
  const reloadIcon = document.getElementById("reloadIcon");

  refreshBackgroundButton.addEventListener("click", function () {
    rotateImage(reloadIcon);
  });
});

// Implement greeting and time functionality for a personalized experience
document.addEventListener("DOMContentLoaded", function () {
  var asknameInput = document.getElementById("askname-input");
  var greeting = document.getElementById("greet");
  var timeEl = document.getElementById("time");
  var dateEl = document.getElementById("date");
  var is24HourFormat =
    localStorage.getItem("is24HourFormat") === "true" || false;

  asknameInput.addEventListener("change", function () {
    var name = asknameInput.value;
    localStorage.setItem("name", name);
    var timeof = getTimeOfDay();
    greeting.textContent =
      timeof === "late night"
        ? `Happy ${timeof}, ${name}`
        : `Good ${timeof}, ${name}`;
  });

  function getTimeOfDay() {
    var clock = new Date();
    var hours = clock.getHours();
    if (hours >= 0 && hours < 4) {
      return "late night";
    } else if (hours < 12) {
      return "morning";
    } else if (hours < 17) {
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

    // Personalize greeting based on time of day and user's name
    if (name) {
      greeting.textContent =
        timeof === "late night"
          ? `Happy ${timeof}, ${name}`
          : `Good ${timeof}, ${name}`;
    } else {
      greeting.textContent =
        timeof === "late night" ? `Happy ${timeof}!` : `Good ${timeof}!`;
    }

    if (!is24HourFormat) {
      hours = hours % 12 || 12;
    }

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;

    var options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    var date = new Intl.DateTimeFormat("en-US", options).format(clock);

    var TimeString = `${hours}<span class="colon">:</span>${minutes}`;
    var DateString = date;

    // Update time and date only if they've changed to minimize DOM manipulations
    if (timeEl.innerHTML !== TimeString) timeEl.innerHTML = TimeString;
    if (dateEl.textContent !== DateString) dateEl.textContent = DateString;
  }

  updateTime();
  var intervalId = setInterval(updateTime, 1000);

  // Add click event listener to switch time format
  timeEl.addEventListener("click", function () {
    is24HourFormat = !is24HourFormat;
    localStorage.setItem("is24HourFormat", is24HourFormat);
    updateTime();
  });

  // Optimize performance by pausing updates when tab is not visible
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") {
      clearInterval(intervalId);
    } else {
      intervalId = setInterval(updateTime, 1000);
    }
  });

  // Show name input only once if name is not set
  if (
    !localStorage.getItem("name") &&
    !localStorage.getItem("namePromptShown")
  ) {
    asknameInput.style.top = "3.5%";
    asknameInput.focus();
    localStorage.setItem("namePromptShown", "true");
  }
});

// Generate and display inspirational quotes
function quoteGen() {
  const quote = document.getElementById("mainquote");
  const author = document.getElementById("mainauthor");

  const cachedQuote = localStorage.getItem("quote");
  const now = new Date().toLocaleDateString();

  function displayQuote(quoteData) {
    quote.innerHTML = `"${quoteData.quote}"`;
    author.innerHTML = `- ${quoteData.author}`;
  }

  function fetchNewQuote() {
    fetch("https://quoteslate.vercel.app/api/quotes/random?maxLength=60")
      .then((res) => res.json())
      .then((data) => {
        displayQuote(data);
        data.timestamp = new Date().toISOString();
        localStorage.setItem("quote", JSON.stringify(data));
      })
      .catch((error) => {
        console.log(error);
        // Provide a single fallback quote in case of API failure
        const fallbackData = {
          quote: "API hiccup! No quotes for now, but we're fixing it!",
          author: "Musheer (Developer of BlankSlate)",
          timestamp: new Date().toISOString(),
          isFallback: true,
        };
        displayQuote(fallbackData);
        localStorage.setItem("quote", JSON.stringify(fallbackData));
      });
  }

  // Use cached quote if it's from today and not a fallback quote, otherwise fetch new
  if (cachedQuote) {
    const cachedData = JSON.parse(cachedQuote);
    const cachedDate = new Date(cachedData.timestamp).toLocaleDateString();

    if (cachedDate === now && !cachedData.isFallback) {
      displayQuote(cachedData);
    } else {
      fetchNewQuote();
    }
  } else {
    fetchNewQuote();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  quoteGen();

  const shareButton = document.getElementById("shareButton");
  shareButton.addEventListener("click", shareOnX);
});

// Enable social sharing of quotes
function shareOnX() {
  const quote = document.getElementById("mainquote").textContent;
  const author = document.getElementById("mainauthor").textContent;

  const postText = `${quote}\n${author} via @BlankSlateWeb`;
  const postUrl = `https://x.com/intent/post?text=${encodeURIComponent(
    postText,
  )}`;

  window.open(postUrl, "_blank");
}

// Hide cursor after inactivity for a cleaner UI
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

// Weather functionality
let weather = {
  defaultUnit: localStorage.getItem("unit") || "metric",
  fetchWeather: function (city, unit, isManualSearch = false) {
    const cachedWeatherData = localStorage.getItem("weatherData");
    const now = new Date().getTime();

    // Always display cached data if available
    if (cachedWeatherData) {
      const { data, timestamp } = JSON.parse(cachedWeatherData);
      this.displayWeather(data, unit);

      // If data is recent, don't fetch new data
      if (now - timestamp < 30 * 60 * 1000 && !isManualSearch) {
        return;
      }
    }

    // Fetch new data
    if (!city) {
      this.getCityByIP()
        .then((ipCity) => {
          city = ipCity || "New Delhi";
          this.fetchWeatherData(city, unit);
        })
        .catch((error) => {
          console.error("Error fetching IP-based city: ", error);
          city = "Delhi";
          this.fetchWeatherData(city, unit);
        });
    } else {
      this.fetchWeatherData(city, unit);
    }
  },

  fetchWeatherData: function (city, unit) {
    const apiKey = this.apiKey;
    fetch(
      "https://api.openweathermap.org/data/2.5/weather?q=" +
        city +
        "&units=" +
        unit +
        "&appid=" +
        apiKey,
    )
      .then((response) => response.json())
      .then((data) => {
        this.displayWeather(data, unit);
        localStorage.setItem(
          "weatherData",
          JSON.stringify({
            data: data,
            timestamp: new Date().getTime(),
          }),
        );
      })
      .catch((error) => {
        console.error("Error fetching weather data: ", error);
        // Keep using the last cached data if fetch fails
      });
  },

  getCityByIP: function () {
    return new Promise((resolve, reject) => {
      fetch("https://api.ipify.org/?format=json")
        .then((response) => response.json())
        .then((data) => {
          const ip = data.ip;
          return fetch(`https://ipapi.co/${ip}/json/`);
        })
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
    const roundedTemp = Math.round(temp);
    const cityName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    document.getElementById("city").innerText = cityName;
    document.getElementById("description").innerText = description;
    document.getElementById("temp").innerText =
      roundedTemp + (unit === "metric" ? "°C" : "°F");
  },

  setUnit: function (unit) {
    this.defaultUnit = unit;
    document
      .getElementById("celcius")
      .classList.toggle("active", unit === "metric");
    document
      .getElementById("fahrenhiet")
      .classList.toggle("active", unit === "imperial");
    localStorage.setItem("unit", unit);
    const savedCity = localStorage.getItem("city");
    this.fetchWeather(savedCity || "", unit, true);
  },
};

// Define API key as a non-enumerable property for security
Object.defineProperty(weather, "apiKey", {
  value: "API_KEY_HERE",
  enumerable: false,
  writable: false,
  configurable: false,
});

// Main event listener for DOM content loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize UI elements
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

  // Initialize weather with cached data or fetch new data
  const savedCity = localStorage.getItem("city");
  weather.fetchWeather(savedCity, weather.defaultUnit);

  // Event listeners for UI interactions

  // Search for weather by city name
  searchInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      const city = searchInput.value;
      weather.fetchWeather(city, weather.defaultUnit, true);
      localStorage.setItem("city", city);
      document.getElementById("city").innerText = city;
      searchBox.style.top = "-10%";
      searchInput.value = "";
    }
  });

  // Toggle city search input visibility
  city.addEventListener("click", function () {
    if (searchBox.style.top === "3.5%") {
      searchBox.style.top = "-10%";
    } else {
      searchBox.style.top = "3.5%";
      searchBox.focus();
    }
  });

  // Handle name input for personalized greeting
  nameInput.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      nameInput.style.top = "-10%";
      localStorage.setItem("name", nameInput.value);
      nameInput.value = "";
    }
  });

  // Toggle name input visibility
  greeting.addEventListener("click", function () {
    if (nameInput.style.top === "3.5%") {
      nameInput.style.top = "-10%";
    } else {
      nameInput.style.top = "3.5%";
      nameInput.focus();
    }
  });

  // Toggle temperature unit selection
  tempClick.addEventListener("click", function () {
    if (unitsButton.style.top === "3.5%") {
      unitsButton.style.top = "-10%";
    } else {
      unitsButton.style.top = "3.5%";
    }
  });

  // Set temperature unit to Celsius
  celciusBtn.addEventListener("click", function () {
    weather.setUnit("metric");
    unitsButton.style.top = "-10%";
  });

  // Set temperature unit to Fahrenheit
  fahrenhietBtn.addEventListener("click", function () {
    weather.setUnit("imperial");
    unitsButton.style.top = "-10%";
  });

  // Toggle settings menu visibility
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

  // Close menus when clicking outside for better UX
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

  // Apply stored blur effect or use default
  if (storedBlurValue) {
    body.style.webkitBackdropFilter = `blur(${storedBlurValue}px)`;
    body.style.backdropFilter = `blur(${storedBlurValue}px)`;
    blurSlider.value = storedBlurValue;
  }

  // Update blur effect based on user input
  blurSlider.addEventListener("input", function () {
    const blurValue = this.value;
    body.style.webkitBackdropFilter = `blur(${blurValue}px)`;
    body.style.backdropFilter = `blur(${blurValue}px)`;

    localStorage.setItem("blurValue", blurValue);
  });

  // Apply stored tint effect or use default
  if (alphaValue === null) {
    alphaValue = 75;
  } else {
    alphaValue = parseInt(alphaValue);
  }

  overlay.style.backgroundColor = `rgba(0, 0, 0, ${alphaValue / 100})`;

  alphaSlider.value = alphaValue;
  // Update tint effect based on user input
  alphaSlider.addEventListener("input", function () {
    alphaValue = parseInt(this.value);
    overlay.style.backgroundColor = `rgba(0, 0, 0, ${alphaValue / 100})`;
  });

  // Store tint value when user finishes adjusting
  alphaSlider.addEventListener("change", function () {
    localStorage.setItem("alphaValue", alphaValue);
  });
});

// Prevent context menu for a cleaner UI experience
document.addEventListener(
  "contextmenu",
  function (event) {
    event.preventDefault();
  },
  false,
);
