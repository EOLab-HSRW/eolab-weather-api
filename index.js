// Import express
const express = require("express");
var cors = require('cors');
const app = express();
// Load DB Config
require("dotenv").config();
// Init DB
const { Pool } = require("pg");
const pool = new Pool();

app.use(cors());
app.use(express.json());

const returnDate = function (input) {
  if (isNaN(input)) {
    return new Date(input);
  } else {
    return new Date(parseInt(input));
  }
};

const checkDate = function (date) {
  if (isNaN(date.getDate())) {
    return false;
  }
  return true;
};

// Check if Server is online and has a database connection
app.get("/api", (req, res) => {
  pool.query("SELECT 1 + 1 AS solution", (err, result) => {
    if (err) {
      res.status(500).send(err);
      console.log(err);
      return;
    }
    res.status(201).send("This is fine.");
  });
});

// Get the last 20 measuerments
app.get("/api/weather", (req, res) => {
  pool.query(
    "SELECT * FROM sensordata ORDER BY created_at_tz DESC LIMIT 20",
    (err, result) => {
      if (err) {
        res.status(500).send(err);
        console.log(err);
        return;
      }
      res.status(201).send(result.rows);
    }
  );
});

// Get the 20 next measurements after begin (begin in ms)
app.get("/api/weather/:begin", (req, res) => {
  let begin = returnDate(req.params.begin);
  if (checkDate(begin)) {
    pool.query(
      "SELECT * FROM sensordata WHERE created_at_tz > $1 ORDER BY created_at_tz DESC LIMIT 20",
      [begin],
      (err, result) => {
        if (err) {
          res.status(500).send(err);
          console.log(err);
          return;
        }
        res.status(201).send(result.rows);
      }
    );
  } else {
    res.status(422).send("Could not process given date.");
  }
});

// Get all measurements between begin and end (both in ms)
app.get("/api/weather/:begin/:end", (req, res) => {
  let begin = returnDate(req.params.begin);
  let end = returnDate(req.params.end);
  if (checkDate(begin) && checkDate(end)) {
    pool.query(
      "SELECT * FROM sensordata WHERE created_at_tz > $1 AND created_at_tz < $2 ORDER BY created_at_tz DESC",
      [begin, end],
      (err, result) => {
        if (err) {
          res.status(500).send(err);
          console.log(err);
          return;
        }
        res.status(201).send(result.rows);
      }
    );
  } else {
    res.status(422).send("Could not process given date.");
  }
});

// Get every nth measurements between begin and end (both in ms)
// Adds new column 'row' to the result (index)
app.get("/api/weather/:begin/:end/:n", (req, res) => {
  let begin = returnDate(req.params.begin);
  let end = returnDate(req.params.end);
  if (checkDate(begin) && checkDate(end)) {
    let query = `
    SELECT t.*
    FROM (
      SELECT *, row_number() OVER(ORDER BY created_at_tz DESC) AS row
      FROM sensordata WHERE created_at_tz > $1 AND created_at_tz < $2
    ) t
    WHERE t.row % $3 = 0    
    `;
    pool.query(query, [begin, end, req.params.n], (err, result) => {
      if (err) {
        res.status(500).send(err);
        console.log(err);
        return;
      }
      res.status(201).send(result.rows);
    });
  } else {
    res.status(422).send("Could not process given date.");
  }
});

app.listen(8079, () => {
  console.log("Server started on port 8079");
});
