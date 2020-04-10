"use strict";
console.clear();

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

//set generic
let { app_start, route } = window;

function hexToRgb(hex) {
  // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, function(m, r, g, b) {
    return r + r + g + g + b + b;
  });

  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

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
    this.endUpdateloop();
  }

  onVideoCanPlayThrough() {
    this.selectors.bodyElement.classList.add("video-loaded");
  }

  onVideoEnded() {
    this.hideVideo();
    this.endUpdateloop();
  }

  startUpdateloop() {
    function _formatMe(input) {
      const delay = -7500;
      return +input.replace(/:/g, "") + delay;
    }
    const _timeData = [];
    {
      let lastTime = "0:00:10:000";
      let i = 0;
      for (const KEY in YAKKO_MAP) {
        _timeData.push({
          id: i,
          from: _formatMe(lastTime),
          to: _formatMe(KEY)
        });
        lastTime = KEY;
        i++;
      }
    }

    this.timeData = _timeData;
    this.loop = window.setInterval(() => this.updateByMs(), 99);
  }

  endUpdateloop() {
    window.clearInterval(this.loop);
  }

  updateByMs() {
    const ct = Math.floor(this.selectors.videoElement.currentTime * 1000);

    //console.debug(`Ticking active nation by ms [${ct}]...`);

    if (this.yakkodList) {
      let entry = this.timeData.find(td => td.from <= ct && ct <= td.to);
      if (entry && this.stallData !== entry) {
        const current = V.yakkodList[entry.id];
        this.updateData(current);
        console.debug(
          `Active land: ${current.nation}, t${ct} hit: ${entry.from}-${entry.to}`
        );
        this.stallData = entry;
        entry = void 0;
      }
    }
  }

  updateData(entry) {
    {
      const d = document.createElement("div");
      d.style.color = entry.color;
      document.body.appendChild(d);

      $("current").style.backgroundColor = `rgba(${window
        .getComputedStyle(d)
        .color.slice(4, -1)}, .8)`;
      document.body.removeChild(d);
    }
    $("current").innerHTML = `
      <data>
        <p id="country">
          <i class="fas fa-flag"></i>
          ${entry.nation}
        </p>
        <p id="count">
          <i class="fas fa-virus"></i>
          ${entry.infected}
        </p>
      </data>`;
  }

  showVideo() {
    this.selectors.videoElement.currentTime = 0;
    this.selectors.videoElement.playerbackRate = 0.3; //take a step down yo
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
      new Spot({ nation: "wait for it.", infected: 420, color: "white" })
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
  }
}

//convert list to format the maps works with
const yakkoList = json => {
  const output = [],
    processing = [],
    custom = [];
  let _congofix = 0;
  for (const raw of Object.values(json)) {
    switch (raw.country) {
      case "US": {
        processing.push(
          new Spot({
            nation: "United States",
            infected: raw.data.confirmed
          })
        );
        break;
      }
      case "Congo (Brazzaville)": {
        _congofix = raw.data.confirmed;
      }
      case "Congo (Kinshasa)": {
        processing.push(
          new Spot({
            nation: "Congo",
            infected: raw.data.confirmed + _congofix
          })
        );
        break;
      }
      case "Czechia": {
        processing.push(
          new Spot({
            nation: "Czechoslovakia",
            infected: raw.data.confirmed
          })
        );
        break;
      }
      case "Equatorial Guinea": {
        processing.push(
          new Spot({
            nation: "Guinea",
            infected: raw.data.confirmed
          })
        );
        break;
      }
      case "Korea, South": {
        processing.push(
          new Spot({
            nation: "Korea",
            infected: raw.data.confirmed
          })
        );
        break;
      }
      case "Papua New Guinea": {
        processing.push(
          new Spot({
            nation: "New Guinea",
            infected: raw.data.confirmed
          })
        );
        break;
      }
      case "South Sudan": {
        processing.push(
          new Spot({
            nation: "Sudan",
            infected: raw.data.confirmed
          })
        );
        break;
      }
      case "Philippine Islands": {
        processing.push(
          new Spot({
            nation: "Sudan",
            infected: raw.data.confirmed
          })
        );
        break;
      }
      case "Dominica": {
        processing.push(
          new Spot({
            nation: "Dominican",
            infected: raw.data.confirmed
          })
        );
        break;
      }
      case "Dominican Republic": {
        processing.push(
          new Spot({
            nation: "Republic Dominica",
            infected: raw.data.confirmed
          })
        );
        break;
      }
      case "West Bank and Gaza": {
        processing.push(
          new Spot({
            nation: "Palestine",
            infected: raw.data.confirmed
          })
        );
        break;
      }
      case "United Kingdom": {
        processing.push(
          new Spot({
            nation: "England",
            infected: raw.data.confirmed
          })
        );
        break;
      }
      case "Brunei": {
        processing.push(
          new Spot({
            nation: "Borneo",
            infected: raw.data.confirmed
          })
        );
        break;
      }

      case "United Arab Emirate": {
        const $new = new Spot({
          nation: "Abu Dhabi",
          infected: raw.data.confirmed
        });
        alert($new);
        custom.push(processing[$new]);
        break;
      }

      default: {
        const entry = Object.values(YAKKO_MAP).find(
          n => n.nation === raw.country
        );
        const IS_CUSTOMIZED = custom.find(x => x.nation === entry.nation);

        if (entry && !IS_CUSTOMIZED)
          processing.push(
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

  processing.push(
    new Spot({
      nation: "Greenland",
      infected: 0
    })
  );

  for (const MAPDATA of Object.values(YAKKO_MAP).sort()) {
    const ENTRY_INORDER = processing.find(r => r.nation === MAPDATA.nation);
    if (ENTRY_INORDER) {
      output.push(
        new Spot({
          nation: ENTRY_INORDER.nation,
          color: ENTRY_INORDER.color,
          infected: ENTRY_INORDER.infected
        })
      );
    } else {
      console.error(
        `ANOMALY: Nation "${MAPDATA.nation}" not found in LIVE list!`
      );
      output.push(
        new Spot({ nation: MAPDATA.nation, color: "white", infected: "???" })
      );
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
