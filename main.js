// BlankSlate - Optimized and Modernized
// Consolidated all functionality into a single DOMContentLoaded listener for better performance

// ============================================================================
// Constants and Configuration
// ============================================================================

const THROTTLE_DELAY = 2000;
const CURSOR_HIDE_DELAY = 4000;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB
const WEATHER_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Creates a throttled version of a function
 * @param {Function} fn - Function to throttle
 * @param {number} delay - Throttle delay in ms
 * @returns {Function} Throttled function
 */
const createThrottledFunction = (fn, delay) => {
  let isAllowed = true;
  return (...args) => {
    if (isAllowed) {
      isAllowed = false;
      fn(...args);
      setTimeout(() => {
        isAllowed = true;
      }, delay);
    }
  };
};

/**
 * Set background image on body element
 * @param {string} imageURL - URL or data URL for the image
 */
const applyBackgroundImage = (imageURL) => {
  document.body.style.background = `url(${imageURL}) no-repeat center / cover`;
};

/**
 * Compare two dates to check if they're the same calendar day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} True if same calendar day
 */
const isSameDay = (date1, date2) => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get the time of day for greeting
 * @returns {string} Time period name
 */
const getTimeOfDay = () => {
  const hours = new Date().getHours();
  if (hours >= 0 && hours < 4) return "late night";
  if (hours < 12) return "morning";
  if (hours < 17) return "afternoon";
  return "evening";
};

/**
 * Format hours with leading zero
 * @param {number} hours - Hours value
 * @returns {string} Formatted hours
 */
const formatTime = (value) => (value < 10 ? `0${value}` : String(value));

// ============================================================================
// Background Image Functions
// ============================================================================

/**
 * Load a random local image as a fallback option
 */
const loadRandomLocalImage = () => {
  const imageIndex = Math.floor(Math.random() * 5) + 1;
  applyBackgroundImage(`local-images/${imageIndex}.webp`);
};

/**
 * Fetch a new background image from the API
 */
const fetchBackgroundImage = () => {
  const overlay = document.querySelector(".overlay");
  const bgColor = getComputedStyle(overlay).getPropertyValue("background-color");
  const rgbaMatch = bgColor.match(/[\d.]+/g);
  const originalAlpha = rgbaMatch && rgbaMatch[3] ? rgbaMatch[3] : "0.75";

  overlay.classList.add("fade-in-out");

  fetch("https://bingw.jasonzeng.dev?index=random")
    .then((response) => response.url)
    .then((imageURL) => {
      localStorage.setItem("imageData", imageURL);
      localStorage.setItem("lastUpdate", new Date().toISOString());
      localStorage.setItem("isLocalImageSelected", "false");

      overlay.style.backgroundColor = "rgba(0, 0, 0, 1)";
      setTimeout(() => {
        applyBackgroundImage(imageURL);
        overlay.style.backgroundColor = `rgba(0, 0, 0, ${originalAlpha})`;
      }, 350);
    })
    .catch((error) => {
      console.error("Failed to fetch background image:", error);
      loadRandomLocalImage();
    })
    .finally(() => {
      setTimeout(() => {
        overlay.classList.remove("fade-in-out");
      }, 1000);
    });
};

/**
 * Set the background image based on local storage or fetch a new one
 */
const setBackgroundImage = () => {
  const imageDataURL = localStorage.getItem("imageData");
  const isLocalImageSelected = localStorage.getItem("isLocalImageSelected");
  const lastUpdateStr = localStorage.getItem("lastUpdate");

  // Prioritize user-selected local image for personalization
  if (isLocalImageSelected === "true" && imageDataURL) {
    applyBackgroundImage(imageDataURL);
    return;
  }

  // Check if we need to fetch a new image
  const today = new Date();
  const lastUpdate = lastUpdateStr ? new Date(lastUpdateStr) : null;
  const needsNewImage =
    !navigator.onLine ||
    !lastUpdate ||
    isNaN(lastUpdate.getTime()) ||
    !isSameDay(lastUpdate, today);

  if (needsNewImage) {
    fetchBackgroundImage();
  } else if (imageDataURL) {
    applyBackgroundImage(imageDataURL);
  }
};

// ============================================================================
// Menu Functions
// ============================================================================

/**
 * Toggle the settings menu for user customization
 * @param {HTMLElement} menuButton - The menu button element
 */
const toggleMenu = (menuButton) => {
  menuButton.classList.toggle("opened");
  menuButton.setAttribute(
    "aria-expanded",
    String(menuButton.classList.contains("opened"))
  );
};

/**
 * Close the menu when clicking outside for better UX
 * @param {Event} event - Click event
 * @param {HTMLElement} menuButton - The menu button element
 */
const closeMenuOnOutsideClick = (event, menuButton) => {
  const clickedElement = event.target;
  const menuSelectors = [
    "#settingsMenu",
    "#selectormenu",
    "#blurbox",
    "#tintbox",
    "#imagebox",
  ];

  const isClickInsideMenu = menuSelectors.some((selector) =>
    clickedElement.closest(selector)
  );

  if (!isClickInsideMenu) {
    menuButton.classList.remove("opened");
    menuButton.setAttribute("aria-expanded", "false");
  }
};

/**
 * Implement image rotation animation for visual feedback
 * @param {HTMLElement} image - Image element to rotate
 */
const createRotateImageHandler = () => {
  let isRotationAllowed = true;

  return (image) => {
    if (isRotationAllowed && !image.classList.contains("rotated")) {
      isRotationAllowed = false;
      image.classList.add("rotated");
      image.addEventListener(
        "animationend",
        () => {
          image.classList.remove("rotated");
        },
        { once: true }
      );

      setTimeout(() => {
        isRotationAllowed = true;
      }, THROTTLE_DELAY);
    }
  };
};

// ============================================================================
// Quote Functions
// ============================================================================

/**
 * Display a quote in the UI
 * @param {Object} quoteData - Quote data object with quote and author
 * @param {HTMLElement} quoteEl - Quote element
 * @param {HTMLElement} authorEl - Author element
 */
const displayQuote = (quoteData, quoteEl, authorEl) => {
  quoteEl.textContent = `"${quoteData.quote}"`;
  authorEl.textContent = `- ${quoteData.author}`;
};

/**
 * Fetch a new quote from the API
 * @param {HTMLElement} quoteEl - Quote element
 * @param {HTMLElement} authorEl - Author element
 */
const fetchNewQuote = (quoteEl, authorEl) => {
  fetch("https://quoteslate.vercel.app/api/quotes/random?maxLength=60")
    .then((res) => res.json())
    .then((data) => {
      displayQuote(data, quoteEl, authorEl);
      data.timestamp = new Date().toISOString();
      localStorage.setItem("quote", JSON.stringify(data));
    })
    .catch((error) => {
      console.error("Failed to fetch quote:", error);
      const fallbackData = {
        quote: "API hiccup! No quotes for now, but we're fixing it!",
        author: "Musheer (Developer of BlankSlate)",
        timestamp: new Date().toISOString(),
        isFallback: true,
      };
      displayQuote(fallbackData, quoteEl, authorEl);
      localStorage.setItem("quote", JSON.stringify(fallbackData));
    });
};

/**
 * Generate and display inspirational quotes
 * @param {HTMLElement} quoteEl - Quote element
 * @param {HTMLElement} authorEl - Author element
 */
const initQuotes = (quoteEl, authorEl) => {
  const cachedQuote = localStorage.getItem("quote");
  const now = new Date().toLocaleDateString();

  if (cachedQuote) {
    try {
      const cachedData = JSON.parse(cachedQuote);
      const cachedDate = new Date(cachedData.timestamp).toLocaleDateString();

      if (cachedDate === now && !cachedData.isFallback) {
        displayQuote(cachedData, quoteEl, authorEl);
        return;
      }
    } catch (e) {
      console.error("Failed to parse cached quote:", e);
    }
  }

  fetchNewQuote(quoteEl, authorEl);
};

/**
 * Enable social sharing of quotes
 * @param {HTMLElement} quoteEl - Quote element
 * @param {HTMLElement} authorEl - Author element
 */
const shareOnX = (quoteEl, authorEl) => {
  const quote = quoteEl.textContent;
  const author = authorEl.textContent;
  const postText = `${quote}\n${author} via @BlankSlateWeb`;
  const postUrl = `https://x.com/intent/post?text=${encodeURIComponent(postText)}`;

  window.open(postUrl, "_blank", "noopener,noreferrer");
};

// ============================================================================
// Cursor Functions
// ============================================================================

/**
 * Initialize cursor hiding after inactivity
 */
const initCursorHiding = () => {
  let cursorTimer;

  const resetCursor = () => {
    clearTimeout(cursorTimer);
    document.documentElement.style.cursor = "default";
    cursorTimer = setTimeout(() => {
      document.documentElement.style.cursor = "none";
    }, CURSOR_HIDE_DELAY);
  };

  document.addEventListener("mousemove", resetCursor, { passive: true });
};

// ============================================================================
// Weather Object
// ============================================================================

const weather = {
  defaultUnit: localStorage.getItem("unit") || "metric",
  // Note: For production, API key should be handled via a backend proxy
  // to avoid exposing it in client-side code
  apiKey: "API_KEY_HERE",

  fetchWeather(city, unit, isManualSearch = false) {
    const cachedWeatherData = localStorage.getItem("weatherData");
    const now = Date.now();

    if (cachedWeatherData) {
      try {
        const { data, timestamp } = JSON.parse(cachedWeatherData);
        this.displayWeather(data, unit);

        if (now - timestamp < WEATHER_CACHE_DURATION && !isManualSearch) {
          return;
        }
      } catch (e) {
        console.error("Failed to parse cached weather data:", e);
      }
    }

    if (!city) {
      this.getCityByIP()
        .then((ipCity) => {
          this.fetchWeatherData(ipCity || "New Delhi", unit);
        })
        .catch((error) => {
          console.error("Error fetching IP-based city:", error);
          this.fetchWeatherData("Delhi", unit);
        });
    } else {
      this.fetchWeatherData(city, unit);
    }
  },

  fetchWeatherData(city, unit) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=${unit}&appid=${this.apiKey}`;

    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        if (data.cod && data.cod !== 200) {
          console.error("Weather API error:", data.message);
          return;
        }
        this.displayWeather(data, unit);
        localStorage.setItem(
          "weatherData",
          JSON.stringify({
            data,
            timestamp: Date.now(),
          })
        );
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
      });
  },

  getCityByIP() {
    return fetch("https://api.ipify.org/?format=json")
      .then((response) => response.json())
      .then((data) => fetch(`https://ipapi.co/${data.ip}/json/`))
      .then((response) => response.json())
      .then((data) => data.city);
  },

  displayWeather(data, unit) {
    // Validate required data exists before accessing properties
    if (!data || !data.name || !data.weather?.[0] || !data.main) {
      console.error("Invalid weather data received");
      return;
    }

    const { name } = data;
    const { description } = data.weather[0];
    const { temp } = data.main;
    const roundedTemp = Math.round(temp);
    const cityName = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const cityEl = document.getElementById("city");
    const descEl = document.getElementById("description");
    const tempEl = document.getElementById("temp");

    if (cityEl) cityEl.textContent = cityName;
    if (descEl) descEl.textContent = description;
    if (tempEl) tempEl.textContent = `${roundedTemp}${unit === "metric" ? "°C" : "°F"}`;
  },

  setUnit(unit) {
    this.defaultUnit = unit;
    const celsiusBtn = document.getElementById("celcius");
    const fahrenheitBtn = document.getElementById("fahrenhiet");

    if (celsiusBtn) celsiusBtn.classList.toggle("active", unit === "metric");
    if (fahrenheitBtn) fahrenheitBtn.classList.toggle("active", unit === "imperial");

    localStorage.setItem("unit", unit);
    const savedCity = localStorage.getItem("city");
    this.fetchWeather(savedCity || "", unit, true);
  },
};

// ============================================================================
// Main Initialization
// ============================================================================

document.addEventListener("DOMContentLoaded", () => {
  // Cache DOM elements
  const elements = {
    chooseLocalBtn: document.getElementById("chooselocal"),
    refreshBackgroundBtn: document.getElementById("refreshBackground"),
    reloadIcon: document.getElementById("reloadIcon"),
    settingsMenuBtn: document.getElementById("settingsMenu"),
    menuButton: document.getElementById("menubtn"),
    selectorMenu: document.getElementById("selectormenu"),
    blurBox: document.getElementById("blurbox"),
    tintBox: document.getElementById("tintbox"),
    imageBox: document.getElementById("imagebox"),
    blurSlider: document.getElementById("blurSlider"),
    alphaSlider: document.getElementById("alphaSlider"),
    overlay: document.getElementById("tint"),
    asknameInput: document.getElementById("askname-input"),
    greeting: document.getElementById("greet"),
    timeEl: document.getElementById("time"),
    dateEl: document.getElementById("date"),
    quoteEl: document.getElementById("mainquote"),
    authorEl: document.getElementById("mainauthor"),
    shareButton: document.getElementById("shareButton"),
    cityEl: document.getElementById("city"),
    searchBox: document.getElementById("searchbox-input"),
    tempEl: document.getElementById("temp"),
    unitsButton: document.getElementById("unitclick"),
    celsiusBtn: document.getElementById("celcius"),
    fahrenheitBtn: document.getElementById("fahrenhiet"),
    body: document.body,
  };

  // Create throttled functions
  const throttledFetchBackground = createThrottledFunction(
    fetchBackgroundImage,
    THROTTLE_DELAY
  );
  const rotateImage = createRotateImageHandler();

  // ========================================
  // Background Image Initialization
  // ========================================

  if (elements.chooseLocalBtn) {
    elements.chooseLocalBtn.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = "image/*";

      fileInput.addEventListener("change", () => {
        const file = fileInput.files?.[0];

        if (file?.type.startsWith("image/") && file.size <= MAX_FILE_SIZE) {
          const reader = new FileReader();

          reader.addEventListener("load", () => {
            localStorage.setItem("imageData", reader.result);
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
  }

  if (elements.refreshBackgroundBtn) {
    elements.refreshBackgroundBtn.addEventListener("click", () => {
      throttledFetchBackground();
      if (elements.reloadIcon) {
        rotateImage(elements.reloadIcon);
      }
    });
  }

  setBackgroundImage();

  // ========================================
  // Menu Initialization
  // ========================================

  if (elements.settingsMenuBtn) {
    elements.settingsMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleMenu(elements.settingsMenuBtn);
    });

    document.body.addEventListener("click", (e) => {
      closeMenuOnOutsideClick(e, elements.settingsMenuBtn);
    });
  }

  // Settings menu panel toggle
  if (elements.menuButton) {
    const menuPanels = [
      elements.selectorMenu,
      elements.blurBox,
      elements.tintBox,
      elements.imageBox,
    ].filter(Boolean);

    const setMenuPanelsVisible = (visible) => {
      const left = visible ? "2.5%" : "-20%";
      const opacity = visible ? "0.65" : "0";

      menuPanels.forEach((panel) => {
        panel.style.left = left;
        panel.style.opacity = opacity;
      });
    };

    elements.menuButton.addEventListener("click", () => {
      const isOpen = elements.selectorMenu?.style.left === "2.5%";
      setMenuPanelsVisible(!isOpen);
    });

    // Close menu panels when clicking outside
    document.addEventListener("click", (event) => {
      const target = event.target;

      const isMenuElement =
        elements.menuButton.contains(target) ||
        menuPanels.some((panel) => panel.contains(target));

      if (!isMenuElement) {
        elements.settingsMenuBtn?.classList.remove("opened");
        elements.settingsMenuBtn?.setAttribute("aria-expanded", "false");
        setMenuPanelsVisible(false);
      }

      // Close city search
      if (
        elements.cityEl &&
        elements.searchBox &&
        !elements.cityEl.contains(target) &&
        !elements.searchBox.contains(target)
      ) {
        elements.searchBox.style.top = "-10%";
      }

      // Close units selector
      if (
        elements.tempEl &&
        elements.unitsButton &&
        !elements.tempEl.contains(target) &&
        !elements.unitsButton.contains(target)
      ) {
        elements.unitsButton.style.top = "-10%";
      }

      // Close name input
      if (
        elements.greeting &&
        elements.asknameInput &&
        !elements.greeting.contains(target) &&
        !elements.asknameInput.contains(target)
      ) {
        elements.asknameInput.style.top = "-10%";
      }
    });
  }

  // ========================================
  // Blur and Tint Controls
  // ========================================

  const storedBlurValue = localStorage.getItem("blurValue");
  if (storedBlurValue && elements.blurSlider) {
    elements.body.style.webkitBackdropFilter = `blur(${storedBlurValue}px)`;
    elements.body.style.backdropFilter = `blur(${storedBlurValue}px)`;
    elements.blurSlider.value = storedBlurValue;
  }

  if (elements.blurSlider) {
    elements.blurSlider.addEventListener("input", function () {
      const blurValue = this.value;
      elements.body.style.webkitBackdropFilter = `blur(${blurValue}px)`;
      elements.body.style.backdropFilter = `blur(${blurValue}px)`;
      localStorage.setItem("blurValue", blurValue);
    });
  }

  let alphaValue = parseInt(localStorage.getItem("alphaValue") ?? "75", 10);
  if (elements.overlay) {
    elements.overlay.style.backgroundColor = `rgba(0, 0, 0, ${alphaValue / 100})`;
  }

  if (elements.alphaSlider) {
    elements.alphaSlider.value = alphaValue;

    elements.alphaSlider.addEventListener("input", function () {
      alphaValue = parseInt(this.value, 10);
      if (elements.overlay) {
        elements.overlay.style.backgroundColor = `rgba(0, 0, 0, ${alphaValue / 100})`;
      }
    });

    elements.alphaSlider.addEventListener("change", () => {
      localStorage.setItem("alphaValue", String(alphaValue));
    });
  }

  // ========================================
  // Time and Greeting Initialization
  // ========================================

  let is24HourFormat = localStorage.getItem("is24HourFormat") === "true";

  const updateTime = () => {
    const clock = new Date();
    let hours = clock.getHours();
    const minutes = clock.getMinutes();
    const timeof = getTimeOfDay();
    const name = localStorage.getItem("name");

    // Update greeting
    if (elements.greeting) {
      const greetingPrefix = timeof === "late night" ? "Happy" : "Good";
      elements.greeting.textContent = name
        ? `${greetingPrefix} ${timeof}, ${name}`
        : `${greetingPrefix} ${timeof}!`;
    }

    // Format time
    if (!is24HourFormat) {
      hours = hours % 12 || 12;
    }

    const timeString = `${formatTime(hours)}<span class="colon">:</span>${formatTime(minutes)}`;
    const dateString = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(clock);

    // Update only if changed to minimize DOM manipulations
    if (elements.timeEl && elements.timeEl.innerHTML !== timeString) {
      elements.timeEl.innerHTML = timeString;
    }
    if (elements.dateEl && elements.dateEl.textContent !== dateString) {
      elements.dateEl.textContent = dateString;
    }
  };

  updateTime();
  let intervalId = setInterval(updateTime, 1000);

  // Time format toggle
  if (elements.timeEl) {
    elements.timeEl.addEventListener("click", () => {
      is24HourFormat = !is24HourFormat;
      localStorage.setItem("is24HourFormat", String(is24HourFormat));
      updateTime();
    });
  }

  // Pause updates when tab is not visible for performance
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      clearInterval(intervalId);
    } else {
      updateTime();
      intervalId = setInterval(updateTime, 1000);
    }
  });

  // Name input handling
  if (elements.asknameInput) {
    elements.asknameInput.addEventListener("change", function () {
      const name = this.value;
      localStorage.setItem("name", name);
      updateTime();
    });

    elements.asknameInput.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        elements.asknameInput.style.top = "-10%";
        localStorage.setItem("name", elements.asknameInput.value);
        elements.asknameInput.value = "";
        updateTime();
      }
    });

    // Show name input only once if name is not set
    if (!localStorage.getItem("name") && !localStorage.getItem("namePromptShown")) {
      elements.asknameInput.style.top = "3.5%";
      elements.asknameInput.focus();
      localStorage.setItem("namePromptShown", "true");
    }
  }

  // Toggle name input visibility
  if (elements.greeting && elements.asknameInput) {
    elements.greeting.addEventListener("click", () => {
      const isVisible = elements.asknameInput.style.top === "3.5%";
      elements.asknameInput.style.top = isVisible ? "-10%" : "3.5%";
      if (!isVisible) elements.asknameInput.focus();
    });
  }

  // ========================================
  // Quote Initialization
  // ========================================

  if (elements.quoteEl && elements.authorEl) {
    initQuotes(elements.quoteEl, elements.authorEl);

    if (elements.shareButton) {
      elements.shareButton.addEventListener("click", () => {
        shareOnX(elements.quoteEl, elements.authorEl);
      });
    }
  }

  // ========================================
  // Weather Initialization
  // ========================================

  const savedCity = localStorage.getItem("city");
  weather.fetchWeather(savedCity, weather.defaultUnit);

  // City search
  if (elements.searchBox) {
    elements.searchBox.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        const city = elements.searchBox.value.trim();
        if (city) {
          weather.fetchWeather(city, weather.defaultUnit, true);
          localStorage.setItem("city", city);
        }
        elements.searchBox.style.top = "-10%";
        elements.searchBox.value = "";
      }
    });
  }

  // Toggle city search visibility
  if (elements.cityEl && elements.searchBox) {
    elements.cityEl.addEventListener("click", () => {
      const isVisible = elements.searchBox.style.top === "3.5%";
      elements.searchBox.style.top = isVisible ? "-10%" : "3.5%";
      if (!isVisible) elements.searchBox.focus();
    });
  }

  // Temperature unit toggle
  if (elements.tempEl && elements.unitsButton) {
    elements.tempEl.addEventListener("click", () => {
      const isVisible = elements.unitsButton.style.top === "3.5%";
      elements.unitsButton.style.top = isVisible ? "-10%" : "3.5%";
    });
  }

  if (elements.celsiusBtn) {
    elements.celsiusBtn.addEventListener("click", () => {
      weather.setUnit("metric");
      if (elements.unitsButton) elements.unitsButton.style.top = "-10%";
    });
  }

  if (elements.fahrenheitBtn) {
    elements.fahrenheitBtn.addEventListener("click", () => {
      weather.setUnit("imperial");
      if (elements.unitsButton) elements.unitsButton.style.top = "-10%";
    });
  }

  // ========================================
  // Cursor Hiding
  // ========================================

  initCursorHiding();
});
