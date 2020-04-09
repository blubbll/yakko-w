"use strict";
console.clear();

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

//set generic
let { app_start, route } = window;

class VideoController {
  constructor() {
    this.cacheSelectors();
    this.bindEvents();
  }

  cacheSelectors() {
    this.selectors = {};
    this.selectors.bodyElement = document.querySelector("body");
    this.selectors.videoWrapElement = document.querySelector(".js-video-wrap");
    this.selectors.videoElement = this.selectors.videoWrapElement.querySelector(
      ".js-video"
    );
    this.selectors.playButtonElement = document.querySelector(".js-play-video");
    this.selectors.closeButtonElement = document.querySelector(
      ".js-close-video"
    );
  }

  bindEvents() {
    this.selectors.playButtonElement.addEventListener(
      "click",
      this.onPlayClick.bind(this)
    );
    this.selectors.closeButtonElement.addEventListener(
      "click",
      this.onCloseClick.bind(this)
    );
    this.selectors.videoElement.addEventListener(
      "ended",
      this.onVideoEnded.bind(this)
    );

    if (this.selectors.videoElement.readyState === 4) {
      this.onVideoCanPlayThrough();
    } else {
      this.selectors.videoElement.addEventListener(
        "canplaythrough",
        this.onVideoCanPlayThrough.bind(this)
      );
    }
  }

  onPlayClick(event) {
    event.preventDefault();
    this.showVideo();
  }

  onCloseClick(event) {
    event.preventDefault();
    this.hideVideo();
  }

  onVideoCanPlayThrough() {
    this.selectors.bodyElement.classList.add("video-loaded");
  }

  onVideoEnded() {
    this.hideVideo();
    this.endUpdateloop();
  }

  startUpdateloop() {
    this.loop = window.setInterval(() => this.updateByMs(), 299);
  }

  endUpdateloop() {
    window.clearInterval(this.loop);
  }

  updateByMs() {
    const ct = Math.floor(this.selectors.videoElement.currentTime * 1000);
    /*if (ct !== this.ct) {
      this.ct = ct;
      V.updateData("Germany", ct * 1000);
    }*/
    if (this.yakkodList) {
      let entry = this.yakkodList.find(
        record => record.time.from <= ct && ct <= record.time.to
      );
      if (entry && this.stallData !== entry) {
        this.updateData(entry.country, entry.infected);
        console.debug(
          `Active land: ${entry.country}, t${ct} hit: ${entry.time.from}-${entry.time.to}`
        );
        this.stallData = entry;
        entry = void 0;
      }
    }
  }

  updateData(country, count) {
    $("current").innerHTML = `
      <data>
        <p id="country">
          <i class="fas fa-flag"></i>
          ${country}
        </p>
        <p id="count">
          <i class="fas fa-virus"></i>
          ${count}
        </p>
      </data>`;
  }

  showVideo() {
    this.selectors.videoElement.currentTime = 0;
    this.selectors.videoElement.playerbackRate = 0.5; //take a step down yo
    this.selectors.videoWrapElement.classList.remove("video-wrap--hide");
    this.selectors.videoWrapElement.classList.add("video-wrap--show");

    fetch("/data")
      .then(res => res.json())
      .then(json => {
        this.yakkodList = yakkoList(json);
      });

    setTimeout(() => this.selectors.videoElement.play(), 600);
    this.startUpdateloop();
    V.updateData("Germany", 9000);
  }

  hideVideo() {
    this.selectors.videoWrapElement.classList.remove("video-wrap--show");
    this.selectors.videoWrapElement.classList.add("video-wrap--hide");
    this.selectors.videoElement.pause();
  }
}

const yakkoList = json => {
  const output = [];
  let _congofix = 0;
  for (const raw of Object.values(json)) {
    switch (raw.country) {
      case "US": {
        output.push({
          country: "United States",
          infected: raw.data.confirmed,
          time: { from: 1000, to: 5000 }
        });
        break;
      }
      case "Congo (Brazzaville)": {
        _congofix = raw.data.confirmed;
      }
      case "Congo (Kinshasa)": {
        output.push({
          country: "Congo",
          infected: raw.data.confirmed + _congofix,
          time: { from: 5000, to: 10000 }
        });
        break;
      }
      case "Czechia": {
        output.push({
          country: "Czechoslovakia",
          infected: raw.data.confirmed + _congofix,
          time: {}
        });
        break;
      }
      case "Equatorial Guinea": {
        output.push({
          country: "Guinea",
          infected: raw.data.confirmed + _congofix,
          time: {}
        });
        break;
      }
      case "Korea, South": {
        output.push({
          country: "Korea",
          infected: raw.data.confirmed + _congofix,
          time: {}
        });
        break;
      }
      case "Papua New Guinea": {
        output.push({
          country: "New Guinea",
          infected: raw.data.confirmed + _congofix,
          time: {}
        });
        break;
      }
      case "South Sudan": {
        output.push({
          country: "Sudan",
          infected: raw.data.confirmed + _congofix,
          time: {}
        });
        break;
      }
      default: {
        if (YAKKO_LIST.includes(raw.country))
          output.push({
            country: raw.country,
            infected: raw.data.confirmed,
            time: {}
          });
        else {
          console.warn(
            `ANOMALIE: ${raw.country} not found in YAKKO_LIST const`
          );
        }
      }
    }
  }

  for (const country of YAKKO_LIST) {
    if (!output.find(record => record.country === country)) {
      console.error(`ANOMALIE: ${country} not found in LIVE list!`);
      switch (country) {
        case "x": {
          break;
        }

        default: {
          output.push({ country, infected: "???", time: {} });
        }
      }
    }
  }

  return output;
};

const V = new VideoController();

const YAKKO_LIST = [
  "United States",
  "Canada",
  "Mexico",
  "Panama",
  "Haiti",
  "Jamaica",
  "Peru",
  "Republic",
  "Dominican",
  "Cuba",
  "Caribbean",
  "Greenland",
  "El Salvador",
  "Puerto Rico",
  "Colombia",
  "Venezuela",
  "Honduras",
  "Guyana",
  "Guatemala",
  "Bolivia",
  "Argentina",
  "Ecuador",
  "Chile",
  "Brazil",
  "Costa Rica",
  "Belize",
  "Nicaragua",
  "Bermuda",
  "Bahamas",
  "Tobago",
  "San Juan",
  "Paraguay",
  "Uruguay",
  "Suriname",
  "French Guiana",
  "Barbados",
  "Guam",
  "Norway",
  "Sweden",
  "Iceland",
  "Finland",
  "Germany",
  "Switzerland",
  "Austria",
  "Czechoslovakia",
  "Italy",
  "Turkey",
  "Greece",
  "Poland",
  "Romania",
  "Scotland",
  "Albania",
  "Ireland",
  "Russia",
  "Oman",
  "Saudi Arabia",
  "Hungary",
  "Cyprus",
  "Iraq",
  "Iran",
  "Syria",
  "Lebanon",
  "Israel",
  "Jordan",
  "Yemens",
  "Kuwait",
  "Bahrain",
  "Netherlands",
  "Luxembourg",
  "Belgium",
  "Portugal",
  "France",
  "England",
  "Denmark",
  "Spain",
  "India",
  "Pakistan",
  "Burma",
  "Afghanistan",
  "Thailand",
  "Nepal",
  "Bhutan",
  "Kampuchea",
  "Malaysia",
  "Bangladesh",
  "China",
  "Korea",
  "Japan",
  "Mongolia",
  "Laos",
  "Tibet",
  "Indonesia",
  "Philippine Islands",
  "Taiwan",
  "Sri Lanka",
  "New Guinea",
  "Sumatra",
  "New Zealand",
  "Borneo",
  "Vietnam",
  "Tunisia",
  "Morocco",
  "Uganda",
  "Angola",
  "Zimbabwe",
  "Djibouti",
  "Botswana",
  "Mozambique",
  "Zambia",
  "Swaziland",
  "Gambia",
  "Guinea",
  "Algeria",
  "Ghana",
  "Burundi",
  "Lesotho",
  "Malawi",
  "Togo",
  "Niger",
  "Nigeria",
  "Chad",
  "Liberia",
  "Egypt",
  "Benin",
  "Gabon",
  "Tanzania",
  "Somalia",
  "Kenya",
  "Mali",
  "Sierra Leone",
  "Algiers",
  "Dahomey",
  "Namibia",
  "Senegal",
  "Libya",
  "Cameroon",
  "Congo",
  "Zaire",
  "Ethiopia",
  "Guinea-Bissau",
  "Madagascar",
  "Rwanda",
  "Maore",
  "Cayman",
  "Hong Kong",
  "Abu Dhabi",
  "Qatar",
  "Yugoslavia",
  "Crete",
  "Mauritania",
  "Transylvania",
  "Monaco",
  "Liechtenstein",
  "Malta",
  "Palestine",
  "Fiji",
  "Australia",
  "Sudan"
];

{
  //for debugging (manually looking for a country)
  const YAKKO_LIST_SORTED = [
    "Abu Dhabi",
    "Afghanistan",
    "Albania",
    "Algeria",
    "Algiers",
    "Angola",
    "Argentina",
    "Australia",
    "Austria",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belgium",
    "Belize",
    "Benin",
    "Bermuda",
    "Bhutan",
    "Bolivia",
    "Borneo",
    "Botswana",
    "Brazil",
    "Burma",
    "Burundi",
    "Cameroon",
    "Canada",
    "Caribbean",
    "Cayman",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Congo",
    "Costa Rica",
    "Crete",
    "Cuba",
    "Cyprus",
    "Czechoslovakia",
    "Dahomey",
    "Denmark",
    "Djibouti",
    "Dominican",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "England",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "French Guiana",
    "Gabon",
    "Gambia",
    "Germany",
    "Ghana",
    "Greece",
    "Greenland",
    "Guam",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hong Kong",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kampuchea",
    "Kenya",
    "Korea",
    "Kuwait",
    "Laos",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Mali",
    "Malta",
    "Maore",
    "Mauritania",
    "Mexico",
    "Monaco",
    "Mongolia",
    "Morocco",
    "Mozambique",
    "Namibia",
    "Nepal",
    "Netherlands",
    "New Guinea",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "Norway",
    "Oman",
    "Pakistan",
    "Palestine",
    "Panama",
    "Paraguay",
    "Peru",
    "Philippine Islands",
    "Poland",
    "Portugal",
    "Puerto Rico",
    "Qatar",
    "Republic",
    "Romania",
    "Russia",
    "Rwanda",
    "San Juan",
    "Saudi Arabia",
    "Scotland",
    "Senegal",
    "Sierra Leone",
    "Somalia",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Sumatra",
    "Suriname",
    "Swaziland",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tanzania",
    "Thailand",
    "Tibet",
    "Tobago",
    "Togo",
    "Transylvania",
    "Tunisia",
    "Turkey",
    "Uganda",
    "United States",
    "Uruguay",
    "Venezuela",
    "Vietnam",
    "Yemens",
    "Yugoslavia",
    "Zaire",
    "Zambia",
    "Zimbabwe"
  ];
}
