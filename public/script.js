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
    this.selectors.videoElement.load();
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
    const _timeData = [];
    {
      let lastTime = "0:00:10:000";
      for (const KEY in YAKKO_MAP) {
        const ITEM = YAKKO_MAP[KEY];
        _timeData.push({ from: lastTime, to: KEY, nation: ITEM.nation });
        lastTime = KEY;
      }
    }

    this.timeData = _timeData;
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
        this.updateData(entry);
        console.debug(
          `Active land: ${entry.country}, t${ct} hit: ${entry.time.from}-${entry.time.to}`
        );
        this.stallData = entry;
        entry = void 0;
      }
    }
  }

  updateData(entry) {
    $("current").style.backgroundColor = entry.color;
    $("current").innerHTML = `
      <data>
        <p id="country">
          <i class="fas fa-flag"></i>
          ${entry.country}
        </p>
        <p id="count">
          <i class="fas fa-virus"></i>
          ${entry.infected}
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
    V.updateData(
      new Spot({ country: "Germany", infected: 9000, color: "red" })
    );
  }

  hideVideo() {
    this.selectors.videoWrapElement.classList.remove("video-wrap--show");
    this.selectors.videoWrapElement.classList.add("video-wrap--hide");
    this.selectors.videoElement.pause();
  }
}

class Spot {
  constructor(obj) {
    this.nation = obj.nation || "-";
    this.infected = obj.infected || 0;
    this.color =
      obj.color ||
      getComputedStyle(document.documentElement).getPropertyValue("--bg");
    this.fixed = obj.fixed || false;
  }
}

const yakkoList = json => {
  const output = [];
  let _congofix = 0;
  for (const raw of Object.values(json)) {
    switch (raw.country) {
      case "US": {
        output.push(
          new Spot({
            nation: "United States",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Congo (Brazzaville)": {
        _congofix = raw.data.confirmed;
      }
      case "Congo (Kinshasa)": {
        output.push(
          new Spot({
            nation: "Congo",
            infected: raw.data.confirmed + _congofix,
            fixed: true
          })
        );
        break;
      }
      case "Czechia": {
        output.push(
          new Spot({
            nation: "Czechoslovakia",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Equatorial Guinea": {
        output.push(
          new Spot({
            nation: "Guinea",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Korea, South": {
        output.push(
          new Spot({
            nation: "Korea",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Papua New Guinea": {
        output.push(
          new Spot({
            nation: "New Guinea",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "South Sudan": {
        output.push(
          new Spot({
            nation: "Sudan",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Philippine Islands": {
        output.push(
          new Spot({
            nation: "Sudan",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Dominica": {
        output.push(
          new Spot({
            nation: "Dominican",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Dominican Republic": {
        output.push(
          new Spot({
            nation: "Republic Dominica",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "West Bank and Gaza": {
        output.push(
          new Spot({
            nation: "Palestine",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "United Kingdom": {
        output.push(
          new Spot({
            nation: "England",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Brunei": {
        output.push(
          new Spot({
            nation: "Borneo",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }

      case "United Arab Emirate": {
        output.push(
          new Spot({
            nation: "Abu Dhabi",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }

       
        
      default: {
        const entry = Object.values(YAKKO_MAP).find(
          n => n.nation === raw.country
        );
        if (entry)
          output.push(
            new Spot({
              nation: entry.nation,
              infected: raw.data.confirmed,
              color: entry.color
            })
          );
        else {
          console.warn(`ANOMALY: ${raw.country} not found in YAKKO_NATIONS!`);
        }
      }
    }
  }

  output.push(
    new Spot({
      nation: "Greenland",
      infected: 0
    })
  );

  for (const MAPDATA of Object.values(YAKKO_MAP).sort()) {
    
    console.log(!!output.find(r => r.nation === "Canada"))
    const findMe = output.find(r => r.nation === MAPDATA.nation);
    if (!findMe) {
      console.error(
        `ANOMALY: Nation "${MAPDATA.nation}" not found in LIVE list!`
      );
      switch (MAPDATA.nation) {
        case "x": {
          break;
        }

        default: {
          /* output.push(
            new Spot({ nation: "-", color: "black", infected: "???" })
          );*/
        }
      }
    }
  }

  return output;
};

const V = new VideoController();

//thank you gential
const YAKKO_MAP = {
  "0:00:10:120": { nation: "United States", color: "green" },
  "0:00:10:550": { nation: "Canada", color: "purple" },
  "0:00:11:000": { nation: "Mexico", color: "orange" },
  "0:00:11:400": { nation: "Panama", color: "green" },
  "0:00:11:950": { nation: "Haiti", color: "red" },
  "0:00:12:350": { nation: "Jamaica", color: "red" },
  "0:00:12:750": { nation: "Peru", color: "yellow" },
  "0:00:13:600": { nation: "Republic Dominica", color: "red" },
  "0:00:14:500": { nation: "Cuba", color: "red" },
  "0:00:15:000": { nation: "Caribbean" },
  "0:00:15:550": { nation: "Greenland", color: "green" },
  "0:00:16:050": { nation: "El Salvador", color: "purple" },
  "0:00:17:100": { nation: "Puerto Rico", color: "red" },
  "0:00:17:800": { nation: "Colombia", color: "red" },
  "0:00:18:350": { nation: "Venezuela", color: "green" }
  /*"Honduras",
  "Guyana",
  "Guatemala",
  "Bolivia",
  "Argentina",
  "Ecuador", green
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
  "Sudan"*/
};

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
