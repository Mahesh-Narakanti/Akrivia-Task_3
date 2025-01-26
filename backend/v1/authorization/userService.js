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
      expiresIn: "30m",
    });
    const refreshToken = jwt.sign({ id: curUser.id }, "godisdoublegreat", { expiresIn: "1d" });
    return { token ,refreshToken};
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

  updateToken: async (refreshToken) => {
    let newToken = null;
    await jwt.verify(refreshToken, "godisdoublegreat", (err, decoded) => {
          if (err) {
            const error = new Error(err.name);
            error.statusCode = 401;
            return next(error);
          }
    
           newToken = jwt.sign({ id: decoded.id }, "godisgreat", {
            expiresIn: "30m",
          });
      //console.log(newToken);
    });
    return {newToken};
  }
};
