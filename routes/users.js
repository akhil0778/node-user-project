const express = require("express");
const axios = require("axios");
const db = require("../database");

const router = express.Router();

// Fetch all Users and insert into database
router.get("/load", async (req, res) => {
    try {
      const usersResponse = await axios.get("https://jsonplaceholder.typicode.com/users");
      const users = usersResponse.data.slice(0, 10); // Get only first 10 users
  
      db.serialize(() => {
        users.forEach((user) => {
          db.run(
            `INSERT OR IGNORE INTO users 
            (id, name, username, email, phone, website, street, suite, city, zipcode, lat, lng, companyName, catchPhrase, bs)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              user.id, user.name, user.username, user.email, user.phone, user.website,
              user.address.street, user.address.suite, user.address.city, user.address.zipcode,
              user.address.geo.lat, user.address.geo.lng,
              user.company.name, user.company.catchPhrase, user.company.bs
            ]
          );
        });
      });
  
      res.status(200).json({ message: "10 Users loaded successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Fetch a User along with their posts and comments
router.get("/users/:id", (req, res) => {
    const userId = req.params.id;

    db.get("SELECT * FROM users WHERE id = ?", [userId], (err, user) => {
        if (err) return res.status(500).json({ error: err.message });
        if (!user) return res.status(404).json({ error: "User not found" });

        db.all("SELECT * FROM posts WHERE userId = ?", [userId], (err, posts) => {
            if (err) return res.status(500).json({ error: err.message });

            let postIds = posts.map((post) => post.id);
            if (postIds.length === 0) return res.json({ user, posts });

            db.all(`SELECT * FROM comments WHERE postId IN (${postIds.join(",")})`, (err, comments) => {
                if (err) return res.status(500).json({ error: err.message });

                posts = posts.map((post) => ({
                    ...post,
                    comments: comments.filter((c) => c.postId === post.id),
                }));

                res.json({ user, posts });
            });
        });
    });
});

// Delete all Users
router.delete("/users", (req, res) => {
    db.run("DELETE FROM users", (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(200).json({ message: "All users deleted" });
    });
});

// Delete a User
router.delete("/users/:id", (req, res) => {
    const userId = req.params.id;
    db.run("DELETE FROM users WHERE id = ?", [userId], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: "User not found" });
        res.status(200).json({ message: "User deleted successfully" });
    });
});

// Add a New User
router.put("/users", (req, res) => {
    const { id, name, username, email, phone, website, street, suite, city, zipcode, lat, lng, companyName, catchPhrase, bs } = req.body;

    db.get("SELECT id FROM users WHERE id = ?", [id], (err, row) => {
        if (row) return res.status(409).json({ error: "User already exists" });

        db.run(`INSERT INTO users 
            (id, name, username, email, phone, website, street, suite, city, zipcode, lat, lng, companyName, catchPhrase, bs) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, username, email, phone, website, street, suite, city, zipcode, lat, lng, companyName, catchPhrase, bs], 
            (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: "User added successfully" });
            }
        );
    });
});

// Export router
module.exports = router;
