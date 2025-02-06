const userService = require("./userService"); // Relative import
const logger = require("../../logger");
const Joi = require("joi");

module.exports = {
  // Signup route controller
  signup: async (req, res) => {

    const schema = Joi.object({
      firstName: Joi.string().min(1).max(30).required(),
      lastName: Joi.string().min(1).max(30).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(6).required(),
      branch: Joi.string().required(),
      role: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    const { firstName, lastName, email, password,branch,role } = req.body;
    try {
      await userService.createUser(firstName, lastName, email, password,branch,role);
      res.status(200).json({ message: "User registered successfully" });
    } catch (err) {
      logger.error(err);
      res.status(500).send("Server error");
    }
  },

  // Login route controller
  login: async (req, res) => {
    console.log(req.body);
    const { user, password } = req.body;
    try {
      const response = await userService.loginUser(user, password);
      res.status(200).send({
        message: "Login successful",
        token: response.token,
        refreshToken: response.refreshToken,
      });
    } catch (err) {
      logger.error(err);
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
      logger.error(err);
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
      logger.error(err);
      res.status(500).json({ message: "Error updating profile picture" });
    }
  },

  refreshToken: async (req, res, next) => {
    const refresh = req.body.refreshToken;
    if (!refresh) {
      return res.status(403).json({ message: "Refresh token is required" });
    }
    try {
      const response = await userService.updateToken(refresh);
      console.log("Refresh function response: ", response);
      res.status(200).send({
        message: "Token generated successfully",
        token: response.newToken,
      });
    } catch (err) {
      next(err);
    }
  },

  getUsers: async (req, res, next) => {
    try {
            const { branch } = req.query;
      const user = await userService.getUsers(branch);
      res.status(200).json(user);
    } catch (err) {
      logger.error(err);
      res.status(500).send("Internal Server Error");
    }
  },

  editUser: async (req, res, next) => {
    try {
      const { user_id, role_id } = req.body;
      console.log(role_id);
      const user = await userService.editUser(user_id,role_id);
      res.status(200).json(user);
    } catch (err) {
      logger.error(err);
      res.status(500).send("Internal Server Error");
    }
  },
};
