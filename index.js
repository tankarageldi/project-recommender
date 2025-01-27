import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const app = express();

// PostgreSQL connection pool for serverless environments
const db = new Pool({
  user: process.env.user,
  host: process.env.host,
  database: process.env.name,
  password: process.env.password,
  port: process.env.port,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set("view engine", "ejs");

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

// Export the app for Vercel
module.exports = app;
