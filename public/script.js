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

/*setTimeout(() => {
  V.startUpdateloop();
  console.log(V.timeData);
});
*/
class VideoController {
  constructor() {
    this.cacheSelectors();
    this.bindEvents();
    this.oTitle = document.title;
    this.delay = 2100;
  }

  cacheSelectors() {
    this.selectors = {};
    this.selectors.bodyElement = $("body");
    this.selectors.videoWrapElement = $(".js-video-wrap");
    this.selectors.videoElement = this.selectors.videoWrapElement.querySelector(
      ".js-video"
    );
    this.selectors.playButtonElement = $(".js-play-video");
    this.selectors.closeButtonElement = $(".js-close-video");
    this.selectors.ppButtonElement = $(".js-pp-video");
    this.selectors.speedDDElement = $(".dropdown-container");
    this.selectors.speedDDInsideElement = $("ul.content");
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
    this.selectors.ppButtonElement.addEventListener(
      "click",
      this.onPPClick.bind(this)
    );
    this.selectors.videoElement.addEventListener(
      "ended",
      this.onVideoEnded.bind(this)
    );

    this.selectors.bodyElement.addEventListener(
      "click",
      this.onBodyClick.bind(this)
    );

    this.selectors.speedDDInsideElement.addEventListener(
      "click",
      this.onSpeedDDClick.bind(this)
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

  onPPClick(event) {
    if (
      (event.type === "open" && !this.selectors.videoElement.paused) ||
      !this.selectors.videoElement.paused
    ) {
      this.selectors.videoElement.pause();
      this.selectors.ppButtonElement.querySelector(
        "svg.fa-play"
      ).style.display = "inline-block";
      this.selectors.ppButtonElement.querySelector(
        "svg.fa-pause"
      ).style.display = "none";
      this.selectors.ppButtonElement.title = "play";
    } else {
      if (event.type !== "close") this.selectors.videoElement.play();
      this.selectors.ppButtonElement.querySelector(
        "svg.fa-play"
      ).style.display = "none";
      this.selectors.ppButtonElement.querySelector(
        "svg.fa-pause"
      ).style.display = "inline-block";
      this.selectors.ppButtonElement.title = "pause";
    }
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

  onSpeedDDClick(event) {
    this.selectors.videoElement.playbackRate = +event.target.getAttribute(
      "data-val"
    )||this.selectors.videoElement.playbackRate;
  }

  onBodyClick(event) {
    if (event.target === $("#drop")) {
      for (const speed of this.selectors.speedDDInsideElement.querySelectorAll(
        "li"
      )) {
        speed.setAttribute(
          "active",
          +speed.getAttribute("data-val") ===
            this.selectors.videoElement.playbackRate
            ? "true"
            : "false"
        );
      }
    }
    //close speed-checkbox if click was outside
    if (event.target.parentElement !== this.selectors.speedDDElement)
      $("#drop").checked = false;
  }

  startUpdateloop() {
    let i = 0;
    const _preDelay = format("0:00:10:120");
    function format(input) {
      return +input.replace(/:/g, "");
    }

    if (!this.timeData) {
      const _timeData = [];
      let _infecTotal = 0;
      for (const KEY in YAKKO_MAP) {
        const _next = format(Object.keys(YAKKO_MAP)[i + 1] || "1:00:00:000");

        //count up total infected for time progress point
        _infecTotal += this.yakkodList[i].infected;
        _timeData.push({
          id: i,
          infecTotal: _infecTotal,
          from: format(KEY) - (_preDelay - this.delay),
          to: _next - (_preDelay - this.delay)
        });

        i++;
      }
      this.timeData = _timeData;
    }

    this.loop = window.setInterval(() => this.updateByMs(), 119);
  }

  endUpdateloop() {
    document.title = this.oTitle;
    window.clearInterval(this.loop);
  }

  updateTime(perc) {
    this.selectors.videoElement.currentTime =
      (perc / 100) * this.selectors.videoElement.duration;
  }

  updateByMs() {
    const ct = Math.floor(this.selectors.videoElement.currentTime * 1000);

    $("#proc").value =
      (this.selectors.videoElement.currentTime * 100) /
      this.selectors.videoElement.duration;

    //console.debug(`Ticking active nation by ms [${ct}]...`);

    if (this.yakkodList) {
      let entry = this.timeData.find(td => td.from <= ct && ct <= td.to);
      
      
      if (entry && this.stallData !== entry) {
        const current = this.yakkodList[entry.id];
        this.updateData(current, entry);
        /*console.debug(
          `Active nation: ${current.nation}, t${ct} hit: ${entry.from}-${entry.to}`
        );*/
        this.stallData = entry;
        entry = void 0;
      } else if (
        !this.stallData ||
        (this.stallData.nation !== "$START" && ct <= this.timeData[0].from)
      ) {
        const entry = new Spot({ nation: "$START", color: "black" });
        this.updateData(entry);
        this.stallData = entry;
      }
    }
  }

  updateData(current, entry) {
    {
      const d = document.createElement("div");
      d.style.color = current.color;
      document.body.appendChild(d);

      $("current").style.backgroundColor = `rgba(${window
        .getComputedStyle(d)
        .color.slice(4, -1)}, .85)`;
      document.body.removeChild(d);
    }

    let NATION_TEXT = current.nation,
      NATION_INFECTED = current.infected;
    switch (current.nation) {
      case "$START":
        {
          NATION_TEXT = "Wait for it...";
        }
        break;
      default: {
        document.title = `infected: ${entry.infecTotal}`;
      }
    }

    //update displayed HTML
    $("current").innerHTML = `
      <data>
        <p id="country">
          <i class="fas fa-flag"></i>
          ${NATION_TEXT}
        </p>
        <p id="count">
          ${NATION_INFECTED}
          <i class="fas fa-virus"></i>
        </p>
      </data>`;
  }

  showVideo() {
    this.selectors.videoElement.currentTime = 0;
    this.selectors.videoElement.playbackRate = 0.9; //take a step down yo
    this.selectors.videoWrapElement.classList.remove("video-wrap--hide");
    this.selectors.videoWrapElement.classList.add("video-wrap--show");

    const done = () => {
      this.startUpdateloop();
      this.onPPClick({ type: "open" });
    };
    !this.yakkodList
      ? fetch("/data")
          .then(res => res.json())
          .then(json => {
            //transient list to convert real data to yakko format
            this.yakkodList = makeYakkoList(json);
            done();
          })
      : done();
  }

  hideVideo() {
    this.selectors.videoWrapElement.classList.remove("video-wrap--show");
    this.selectors.videoWrapElement.classList.add("video-wrap--hide");
    setTimeout(this.selectors.videoElement.pause);
    this.onPPClick({ type: "close" });
  }
}

class Spot {
  constructor(obj) {
    this.nation = obj.nation || "-";
    this.infected = obj.infected || 0;
    //inherit data like color from yakkolist
    const INHERITED_DATA = Object.values(YAKKO_MAP).find(
      n => n.nation === this.nation
    );

    switch (obj.color) {
      case "gold": case"yellow": {
        this.color = "gold";
        break;
      }
      default: {
        this.color =
          INHERITED_DATA && INHERITED_DATA.color
            ? INHERITED_DATA.color
            : obj.color ||
              getComputedStyle(document.documentElement)
                .getPropertyValue("--bg")
                .replace(/ /g, "");
      }
    }

    this.fixed = obj.fixed || false;
  }
}

//convert list to format the maps works with
const makeYakkoList = json => {
  const output = [],
    processing = [];
  let _congofix = 0;
  for (const raw of Object.values(json)) {
    switch (raw.country) {
      case "US": {
        processing.push(
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
        break;
      }
      case "Congo (Kinshasa)": {
        processing.push(
          new Spot({
            nation: "Congo",
            infected: raw.data.confirmed + _congofix,
            fixed: true
          })
        );
        break;
      }
      case "Czechia": {
        processing.push(
          new Spot({
            nation: "Czechoslovakia",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Equatorial Guinea": {
        processing.push(
          new Spot({
            nation: "Guinea",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Korea, South": {
        processing.push(
          new Spot({
            nation: "Korea",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Papua New Guinea": {
        processing.push(
          new Spot({
            nation: "New Guinea",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "South Sudan": {
        processing.push(
          new Spot({
            nation: "Sudan",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Philippine Islands": {
        processing.push(
          new Spot({
            nation: "Sudan",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Dominica": {
        processing.push(
          new Spot({
            nation: "Dominican",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Dominican Republic": {
        processing.push(
          new Spot({
            nation: "Republic Dominica",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "West Bank and Gaza": {
        processing.push(
          new Spot({
            nation: "Palestine",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "United Kingdom": {
        processing.push(
          new Spot({
            nation: "England",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }
      case "Brunei": {
        processing.push(
          new Spot({
            nation: "Borneo",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }

      case "United Arab Emirate": {
        processing.push(
          new Spot({
            nation: "Abu Dhabi",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }

      default: {
        const entry =
          Object.values(YAKKO_MAP).find(n => n.nation === raw.country) || {};

        entry.wasFixed = processing.find(
          n => n.nation === raw.country && n.fixed === true
        );

        if (entry !== {} && !entry.wasFixed)
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
      infected: 0,
      fixed: true
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
      console.warn(
        `ANOMALY: Nation "${MAPDATA.nation}" not found in LIVE list!`
      );
      output.push(new Spot({ nation: MAPDATA.nation }));
    }
  }

  return output;
};

const V = new VideoController();

//Mapped data from original Video, thank you gential
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
  "0:00:18:350": { nation: "Venezuela", color: "green" },
  "0:00:19:200": { nation: "Honduras", color: "darkgreen" },
  "0:00:19:600": { nation: "Guyana", color: "blue" },
  "0:00:21:000": { nation: "Guatemala", color: "green" },
  "0:00:21:550": { nation: "Bolivia", color: "blue" },
  "0:00:22:150": { nation: "Argentina", color: "green" },
  "0:00:23:000": { nation: "Ecuador", color: "green" },
  "0:00:23:450": { nation: "Chile", color: "red" },
  "0:00:23:850": { nation: "Brazil", color: "orange" },
  "0:00:24:400": { nation: "Costa Rica", color: "yellow" },
  "0:00:25:100": { nation: "Belize", color: "orange" },
  "0:00:25:500": { nation: "Nicaragua", color: "darkgreen" },
  "0:00:26:100": { nation: "Bermuda", color: "purple" },
  "0:00:26:600": { nation: "Bahamas", color: "orange" },
  "0:00:27:100": { nation: "Tobago", color: "purple" },
  "0:00:27:550": { nation: "San Juan" } //no color on yakkos map here
  /*"
  ,
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
