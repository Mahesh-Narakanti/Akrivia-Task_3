const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const users = require("../models/users"); // Assuming users model is in models/users.js

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  try {
    const username = firstName + lastName;
    const hashedPassword = await bcrypt.hash(password, 10);
    await users.query().insert({
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      password: hashedPassword,
    });
    res.status(200).json({ message: "User registered successfully" });
  } catch (err) {
    console.log("error" + err);
    res.status(500).send("Server error");
  }
});

// Login Route
router.post("/login", async (req, res) => {
  console.log(req.body);
  const { user, password } = req.body;
  try {
    const curUser = await users.query().findOne((builder) => {
      if (user.includes("@")) builder.where("email", user);
      else builder.where("username", user);
    });
    if (!curUser) {
      return res.status(404).send("User not found");
    }
    const match = await bcrypt.compare(password, curUser.password);
    if (!match) {
      return res.status(400).send("Invalid credentials");
    }
    const token = jwt.sign({ id: curUser.id }, "godisgreat", {
      expiresIn: "1hr",
    });
      res.status(200).send({
        message: "Login successful",
        token
      });
  } catch (err) {
    console.log("error :" + err);
    res.status(500).send("Server error");
  }
});

router.get("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).send("Token Required");
  }

  try {
    // Decode the token to extract user information
    const decoded = jwt.verify(token, "godisgreat");
      console.log(decoded);
    // Find the user using the user_id from the decoded token
    const user = await users.query().findById(decoded.id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    // Send the user information as a response
    res.status(200).json({
      user_id: user.id, // Adjusted field name for user_id
      username: user.username,
      thumbnail: user.thumbnail,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.post("/pic", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(403).send("Token Required");
  }

  try {
    // Decode the token to extract user information
    const decoded = jwt.verify(token, "godisgreat");

    // Get the new profile pic and thumbnail URLs from the request body
    const { profilePicUrl, thumbnailUrl } = req.body;

    // Update the user's profile pic and thumbnail
    await users
      .query()
      .patch({ profile_pic: profilePicUrl, thumbnail: thumbnailUrl })
      .where("id", decoded.id);

    res.status(200).json({
      message: "Profile picture updated successfully!",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating profile picture" });
  }
});




module.exports = router;
