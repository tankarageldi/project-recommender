const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const pg = require("pg");

dotenv.config();

const app = express();
const db = new pg.Pool({
  user: process.env.user,
  host: process.env.host,
  database: process.env.name,
  password: process.env.password,
  port: process.env.port,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.render("index.ejs");
});

app.post("/projects", async (req, res) => {
  try {
    const { language, difficulty, count } = req.body;

    const query = `
      SELECT *
      FROM projects
      WHERE lang = $1 AND difficulty = $2
      ORDER BY RANDOM()
      LIMIT $3
    `;
    const values = [language, difficulty, count];
    const result = await db.query(query, values);

    res.render("results.ejs", {
      language,
      difficulty,
      count,
      projects: result.rows,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = app;
