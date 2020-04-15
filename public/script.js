"use strict";
console.clear();

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

//set generic
let {} = window;

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
    this.oTitle = document.title;
    this.delay = 3675;
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
    this.selectors.videoElement.playbackRate =
      +event.target.getAttribute("data-val") ||
      this.selectors.videoElement.playbackRate;
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
    function extraFormat(input) {
      const PLUS = +input.split(":")[1] * 60000;

      const NORMAL = +(input.split(":")[2] + input.split(":")[3]).replace(
        /:/g,
        ""
      );
      //console.log(PLUS + NORMAL);
      return PLUS + NORMAL;
    }

    if (!this.timeData) {
      const _timeData = [];
      let _infecTotal = 0;
      for (const KEY in YAKKO_MAP) {
        const _largerThanMin = +KEY.split(":")[1] > 0;
        const _hasNext = Object.keys(YAKKO_MAP)[i + 1];

        let _next, _nextLargerThanMin, next;
        if (_hasNext) {
          _nextLargerThanMin = +Object.keys(YAKKO_MAP)[i + 1].split(":")[1] > 0;
          _next = Object.keys(YAKKO_MAP)[i + 1];
          next = _nextLargerThanMin ? extraFormat(_next) : format(_next);
        }

        //count up total infected for time progress point
        _infecTotal += +`${this.yakkodList[i].infected}`.replace(/[^0-9]/, "");
        _timeData.push({
          id: i,
          infecTotal: _infecTotal,
          from:
            (_largerThanMin ? extraFormat(KEY) : format(KEY)) -
            (_preDelay - this.delay),
          to: _hasNext ? next - (_preDelay - this.delay) : format("1:00:00:000")
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
          document.title = `${this.oTitle} …`;
        }
        break;
      default: {
        document.title = `infected: ${entry.infecTotal}`;
      }
    }

    //update displayed HTML
    $("current>#country>live").innerHTML = `
      <p>
        ${NATION_TEXT}
      </p>`;
    $("current>#count>live").innerHTML = `
      <p>
       ${NATION_INFECTED}
     </p>`;
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

    let INHERITED_COLOR;
    INHERITED_DATA && [(INHERITED_COLOR = INHERITED_DATA.color)];

    switch (INHERITED_COLOR || obj.color) {
      case "gold":
      case "yellow": {
        this.color = "gold";
        break;
      }
      case "pink":
      case "hotpink": {
        this.color = "hotpink";
        break;
      }
      case "orange":
      case "palevioletred": {
        this.color = "palevioletred";
        break;
      }
      case "green":
      case "mediumseagreen": {
        this.color = "mediumseagreen";
        break;
      }
      case "red":
      case "#800032": {
        //bordaeux-red
        this.color = "#800032";
        break;
      }
      case "purple":
      case "rebeccapurple": {
        this.color = "rebeccapurple";
        break;
      }
      case "blue":
      case "royalblue": {
        this.color = "royalblue";
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

    this.fixed = obj.fixed === undefined ? false : true;
  }
}

//convert list to format the maps works with
const makeYakkoList = json => {
  const output = [],
    processing = [];
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
            nation: "Borneo (Brunei)",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }

      case "Western Sahara": {
        processing.push(
          new Spot({
            nation: "W. Sahara",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }

      case "Congo (Brazzaville)": {
        processing.push(
          new Spot({
            nation: "Congo",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }

      case "Congo (Kinshasa)": {
        processing.push(
          new Spot({
            nation: "Zaire (Dem. Rep. Congo)",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }

      case "United Arab Emirates": {
        processing.push(
          new Spot({
            nation: "Abu Dhabi",
            infected: raw.data.confirmed,
            fixed: true
          })
        );
        break;
      }

      case "West Bank and Gaza": {
        processing.push(
          new Spot({
            nation: "West Bank",
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
      output.push(new Spot({ nation: MAPDATA.nation, infected: "?" }));
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
  "0:00:11:400": { nation: "Panama", color: "blue" },
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
  "0:00:26:600": { nation: "Bahamas", color: "purple" },
  "0:00:27:100": { nation: "Tobago", color: "purple" },
  "0:00:27:550": { nation: "San Juan", color: "red" },

  "0:00:28:650": { nation: "Paraguay", color: "yellow" },
  "0:00:29:100": { nation: "Uruguay", color: "purple" },
  "0:00:29:550": { nation: "Suriname", color: "yellow" },
  "0:00:30:200": { nation: "French Guiana", color: "green" },
  "0:00:30:800": { nation: "Barbados", color: "red" },
  "0:00:31:350": { nation: "Guam", color: "pink" },

  "0:00:34:800": { nation: "Norway", color: "purple" },
  "0:00:35:300": { nation: "Sweden", color: "yellow" },
  "0:00:35:750": { nation: "Iceland", color: "yellow" },
  "0:00:36:200": { nation: "Finland", color: "darkgreen" },
  "0:00:36:600": { nation: "Germany", color: "darkgreen" },

  "0:00:38:300": { nation: "Switzerland", color: "purple" },
  "0:00:38:800": { nation: "Austria", color: "yellow" },
  "0:00:39:300": { nation: "Czechoslovakia", color: "green" },
  "0:00:40:200": { nation: "Italy", color: "orange" },
  "0:00:40:650": { nation: "Turkey", color: "orange" },
  "0:00:41:100": { nation: "Greece", color: "orange" },

  "0:00:42:100": { nation: "Poland", color: "pink" },
  "0:00:42:450": { nation: "Romania", color: "red" },
  "0:00:42:800": { nation: "Scotland", color: "yellow" },
  "0:00:43:250": { nation: "Albania", color: "purple" },
  "0:00:43:750": { nation: "Ireland", color: "green" },
  "0:00:44:250": { nation: "Russia", color: "orange" },
  "0:00:44:550": { nation: "Oman", color: "purple" },

  "0:00:45:400": { nation: "Bulgaria", color: "red" },
  "0:00:45:850": { nation: "Saudi Arabia", color: "darkgreen" },
  "0:00:46:800": { nation: "Hungary", color: "green" },
  "0:00:47:200": { nation: "Cyprus", color: "pink" },
  "0:00:47:600": { nation: "Iraq", color: "purple" },
  "0:00:48:100": { nation: "Iran", color: "red" },

  "0:00:49:100": { nation: "Syria", color: "pink" },
  "0:00:49:550": { nation: "Lebanon", color: "pink" },
  "0:00:50:000": { nation: "Israel", color: "yellow" },
  "0:00:50:450": { nation: "Jordan", color: "pink" },
  "0:00:50:750": { nation: "Yemen", color: "red" },
  "0:00:51:250": { nation: "Kuwait", color: "purple" },
  "0:00:51:650": { nation: "Bahrain", color: "darkgreen" },

  "0:00:52:550": { nation: "Netherlands", color: "orange" },
  "0:00:52:900": { nation: "Luxembourg", color: "darkgreen" },
  "0:00:53:500": { nation: "Belgium", color: "orange" },
  "0:00:53:950": { nation: "Portugal", color: "red" },
  "0:00:54:450": { nation: "France", color: "green" },
  "0:00:54:600": { nation: "England", color: "yellow" },
  "0:00:54:800": { nation: "Denmark", color: "orange" },
  "0:00:55:400": { nation: "Spain", color: "darkgreen" },

  "0:00:58:810": { nation: "India", color: "red" },
  "0:00:59:250": { nation: "Pakistan", color: "darkgreen" },
  "0:00:59:650": { nation: "Burma", color: "green" },
  "0:01:00:000": { nation: "Afghanistan", color: "yellow" },
  "0:01:00:500": { nation: "Thailand", color: "green" },
  "0:01:00:900": { nation: "Nepal", color: "red" },
  "0:01:01:300": { nation: "Bhutan", color: "red" },

  "0:01:01:800": { nation: "Cambodia", color: "pink" },
  "0:01:02:600": { nation: "Malaysia", color: "purple" },
  "0:01:03:200": { nation: "Bangladesh", color: "red" },
  "0:01:04:000": { nation: "Asia", color: "" },
  "0:01:04:150": { nation: "China", color: "pink" },
  "0:01:04:500": { nation: "Korea", color: "darkgreen" },
  "0:01:05:000": { nation: "Japan", color: "red" },

  "0:01:06:000": { nation: "Mongolia", color: "green" },
  "0:01:06:310": { nation: "Laos", color: "orange" },
  "0:01:06:650": { nation: "Tibet", color: "pink" },
  "0:01:07:200": { nation: "Indonesia", color: "darkgreen" },
  "0:01:07:800": { nation: "Philippines", color: "pink" },
  "0:01:08:500": { nation: "Taiwan", color: "pink" },

  "0:01:09:400": { nation: "Sri Lanka", color: "purple" },
  "0:01:09:900": { nation: "Papua New Guinea", color: "pink" },
  "0:01:10:300": { nation: "Sumatra", color: "yellow" },
  "0:01:10:700": { nation: "New Zealand", color: "purple" },
  "0:01:11:200": { nation: "Borneo (Brunei)", color: "darkgreen" },
  "0:01:11:800": { nation: "Vietnam", color: "orange" },

  "0:01:12:800": { nation: "Tunisia", color: "darkgreen" },
  "0:01:13:300": { nation: "Morocco", color: "purple" },
  "0:01:13:800": { nation: "Uganda", color: "pink" },
  "0:01:14:200": { nation: "Angola", color: "purple" },
  "0:01:14:600": { nation: "Zimbabwe", color: "orange" },
  "0:01:15:000": { nation: "Djibouti", color: "purple" },
  "0:01:15:500": { nation: "Botswana", color: "yellow" },

  "0:01:16:500": { nation: "Mozambique", color: "pink" },
  "0:01:17:000": { nation: "Zambia", color: "darkgreen" },
  "0:01:17:500": { nation: "Swaziland", color: "orange" },
  "0:01:18:000": { nation: "Gambia", color: "pink" },
  "0:01:18:500": { nation: "Guinea", color: "orange" },
  "0:01:18:900": { nation: "Algeria", color: "red" },
  "0:01:19:300": { nation: "Ghana", color: "pink" },

  "0:01:22:200": { nation: "Burundi", color: "red" },
  "0:01:22:600": { nation: "Lesotho", color: "green" },
  "0:01:23:000": { nation: "Malawi", color: "darkgreen" },
  "0:01:23:400": { nation: "Togo", color: "pink" },
  "0:01:23:800": { nation: "W. Sahara", color: "pink" },

  "0:01:25:600": { nation: "Niger", color: "yellow" },
  "0:01:26:000": { nation: "Nigeria", color: "orange" },
  "0:01:26:400": { nation: "Chad", color: "red" },
  "0:01:26:800": { nation: "Liberia", color: "yellow" },
  "0:01:27:200": { nation: "Egypt", color: "orange" },
  "0:01:27:600": { nation: "Benin", color: "darkgreen" },
  "0:01:28:000": { nation: "Gabon", color: "orange" },

  "0:01:28:500": { nation: "Tanzania", color: "green" },
  "0:01:29:000": { nation: "Somalia", color: "darkgreen" },
  "0:01:29:500": { nation: "Kenya", color: "yellow" },
  "0:01:29:800": { nation: "Mali", color: "darkgreen" },
  "0:01:30:200": { nation: "Sierra Leone", color: "orange" },
  "0:01:31:000": { nation: "Algiers", color: "red" },

  "0:01:31:800": { nation: "Dahomey", color: "darkgreen" },
  "0:01:32:200": { nation: "Namibia", color: "red" },
  "0:01:32:700": { nation: "Senegal", color: "pink" },
  "0:01:33:200": { nation: "Libya", color: "purple" },
  "0:01:33:600": { nation: "Cameroon", color: "darkgreen" },
  "0:01:34:000": { nation: "Congo", color: "red" },
  "0:01:34:400": { nation: "Zaire (Dem. Rep. Congo)", color: "red" }, // Zaire

  "0:01:35:000": { nation: "Ethiopia", color: "purple" },
  "0:01:35:500": { nation: "Guinea-Bissau", color: "orange" },
  "0:01:36:000": { nation: "Madagascar", color: "orange" },
  "0:01:36:400": { nation: "Rwanda", color: "red" },
  "0:01:36:800": { nation: "Mayotte", color: "orange" },
  "0:01:37:200": { nation: "Cayman Is.", color: "red" },

  "0:01:38:000": { nation: "Hong Kong", color: "orange" },
  "0:01:38:400": { nation: "Abu Dhabi", color: "darkgreen" },
  "0:01:38:800": { nation: "Qatar", color: "darkgreen" },
  "0:01:39:200": { nation: "Yugoslavia", color: "pink" },

  "0:01:40:100": { nation: "Crete", color: "orange" },
  "0:01:40:500": { nation: "Mauritania", color: "darkgreen" },
  "0:01:41:200": { nation: "Transylvania", color: "red" },
  "0:01:41:800": { nation: "Monaco", color: "green" },
  "0:01:42:200": { nation: "Liechtenstein", color: "yellow" },
  "0:01:42:600": { nation: "Malta", color: "orange" },
  "0:01:43:000": { nation: "West Bank", color: "yellow" },
  "0:01:43:400": { nation: "Fiji", color: "pink" },
  "0:01:43:800": { nation: "Australia", color: "green" },
  "0:01:44:200": { nation: "Sudan", color: "green" }
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
  /*"
  ,
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
}
