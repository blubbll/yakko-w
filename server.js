// imports
const express = require("express"),
  app = express(),
  fetch = require("node-fetch");

app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/views/index.html`);
});

let world = [];

const update = () => {
  const data = [];
  fetch("https://pomber.github.io/covid19/timeseries.json")
    .then(res => res.json())
    .then(json => {
      for (const country of Object.keys(json).sort()) {
        data.push({ country, data: json[country][json[country].length - 1] });
      }
      world = data;
    });
};
update();
{
  const mins = 5;
  setInterval(update, 60 * 1000 * mins);
}

// send the default array of dreams to the webpage
app.get("/data", (req, res) => {
  res.json(world);
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`);
});
