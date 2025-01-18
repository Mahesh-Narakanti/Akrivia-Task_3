const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userQuery = require("./userQuery"); // Relative import

module.exports = {
  // Create a new user
  createUser: async (firstName, lastName, email, password) => {
    const username = firstName + lastName;
    const hashedPassword = await bcrypt.hash(password, 10);
    return userQuery.createUser({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
    });
  },

  // Log in a user
  loginUser: async (user, password) => {
    const curUser = await userQuery.getUserByEmailOrUsername(user);
    if (!curUser) {
      throw { status: 404, message: "User not found" };
    }

    const match = await bcrypt.compare(password, curUser.password);
    if (!match) {
      throw { status: 400, message: "Invalid credentials" };
    }

    const token = jwt.sign({ id: curUser.id }, "godisgreat", {
      expiresIn: "1hr",
    });

    return { token };
  },

  // Get user from decoded token
  getUserFromToken: async (token) => {
    const decoded = jwt.verify(token, "godisgreat");
    return userQuery.getUserById(decoded.id);
  },

  // Update user's profile picture
  updateProfilePic: async (token, profilePicUrl, thumbnailUrl) => {
    const decoded = jwt.verify(token, "godisgreat");
    await userQuery.updateProfilePic(decoded.id, profilePicUrl, thumbnailUrl);
  },
};
