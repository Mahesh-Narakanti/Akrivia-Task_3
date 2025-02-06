const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userQuery = require("./userQuery"); // Relative import
const { editUser } = require("./userController");

module.exports = {
  // Create a new user
  createUser: async (firstName, lastName, email, password, branch, role) => {
    const username = firstName + lastName;
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("chosen role: " + role);
    return userQuery.createUser({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      branch_id: branch,
      role_id: role,
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

    const token = jwt.sign(
      { id: curUser.id, role: curUser.role_id },
      "godisgreat",
      {
        expiresIn: "1h",
      }
    );
    const refreshToken = jwt.sign(
      { id: curUser.id, role: curUser.role_id },
      "godisdoublegreat",
      { expiresIn: "1d" }
    );
    return { token, refreshToken };
  },

  // Get user from decoded token
  getUserFromToken: async (token) => {
    const decoded = jwt.verify(token, "godisgreat");
    return userQuery.getUserById(decoded.id);
  },

  getUsers: async (branch) => {
    return userQuery.getUsers(branch);
  },

  editUser: async (user_id, role_id) => {
    return userQuery.editUser(user_id, role_id);
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

      newToken = jwt.sign(
        { id: decoded.id, role: decoded.role },

        "godisgreat",
        {
          expiresIn: "30m",
        }
      );
      //console.log(newToken);
    });
    return { newToken };
  },
};
