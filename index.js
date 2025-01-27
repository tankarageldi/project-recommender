import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const app = express();
const port = 3000;
const db = new pg.Client({
  user: process.env.user,
  host: process.env.host,
  database: process.env.name,
  password: process.env.password,
  port: process.env.port,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  res.render("index.ejs");
});

app.post("/projects", async (req, res) => {
  try {
    const { language, difficulty, count } = req.body;

    // Query the database with random sorting
    const query = `
      SELECT *
      FROM projects
      WHERE lang = $1 AND difficulty = $2
      ORDER BY RANDOM()
      LIMIT $3
    `;
    const values = [language, difficulty, count];
    const result = await db.query(query, values);

    // Pass data to the results page
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

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

module.exports = app;
