const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./data/database.db", (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

db.serialize(() => {
    // Create Users Table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        username TEXT,
        email TEXT,
        phone TEXT,
        website TEXT,
        street TEXT,
        suite TEXT,
        city TEXT,
        zipcode TEXT,
        lat TEXT,
        lng TEXT,
        companyName TEXT,
        catchPhrase TEXT,
        bs TEXT
    )`);

    // Create Posts Table
    db.run(`CREATE TABLE IF NOT EXISTS posts (
        id INTEGER PRIMARY KEY,
        userId INTEGER,
        title TEXT,
        body TEXT,
        FOREIGN KEY(userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

    // Create Comments Table
    db.run(`CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY,
        postId INTEGER,
        name TEXT,
        email TEXT,
        body TEXT,
        FOREIGN KEY(postId) REFERENCES posts(id) ON DELETE CASCADE
    )`);
});

module.exports = db;
