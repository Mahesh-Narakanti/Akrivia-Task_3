const userService = require("./userService"); // Relative import

module.exports = {
  // Signup route controller
  signup: async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    try {
      await userService.createUser(firstName, lastName, email, password);
      res.status(200).json({ message: "User registered successfully" });
    } catch (err) {
      console.log("error" + err);
      res.status(500).send("Server error");
    }
  },

  // Login route controller
  login: async (req, res) => {
    const { user, password } = req.body;
    try {
      const response = await userService.loginUser(user, password);
      res.status(200).send({
        message: "Login successful",
        token: response.token,
      });
    } catch (err) {
      res.status(err.status || 500).send(err.message);
    }
  },

  // Get user info route controller
  getUser: async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).send("Token Required");
    }

    try {
      const user = await userService.getUserFromToken(token);
      res.status(200).json(user);
    } catch (err) {
      res.status(500).send("Internal Server Error");
    }
  },

  // Update profile picture route controller
  updateProfilePic: async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(403).send("Token Required");
    }

    const { profilePicUrl, thumbnailUrl } = req.body;

    try {
      await userService.updateProfilePic(token, profilePicUrl, thumbnailUrl);
      res
        .status(200)
        .json({ message: "Profile picture updated successfully!" });
    } catch (err) {
      res.status(500).json({ message: "Error updating profile picture" });
    }
  },
};
