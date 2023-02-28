function updateTime() {
    var clock = new Date();
    var hours = clock.getHours();
    var minutes = clock.getMinutes();
    var AMPM = hours >= 12 ? "PM" : "AM";
    var timeof;

    if (hours < 12 && hours >= 0) {
        timeof = "Morning!";
    } else if (hours < 18 && hours >= 12) {
        timeof = "Afternoon!";
    } else if (hours >= 18 && hours <= 23) {
        timeof = "Evening!";
    }

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
    document.getElementById("timeofday").innerHTML = timeof;
}

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

let weather = {
    apiKey: "f13b50734a9037f193248d4330b2360c",
    fetchWeather: function (city) {
        fetch(
            "https://api.openweathermap.org/data/2.5/weather?q=" +
            city +
            "&units=metric&appid=" +
            this.apiKey
        )
            .then((response) => response.json())
            .then((data) => this.displayWeather(data));
    },

    displayWeather: function (data) {
        const { name } = data;
        const { description } = data.weather[0];
        const { temp } = data.main;
        console.log(name, description, temp);
        document.getElementById("city").innerText = name;
        document.getElementById("description").innerText = description;
        document.getElementById("temp").innerText = temp + "°C";
    },
};

setInterval(updateTime, 1000);
quoteGen();
weather.fetchWeather("Tanda");
