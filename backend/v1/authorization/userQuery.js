const knexConfig = require("../../mysql/knexfile"); // Assuming knexfile is in ../mysql/knexfile
const knex = require("knex")(knexConfig);

module.exports = {
  // Create a new user
  createUser: ({ firstName, lastName, username, email, password }) => {
    return knex("users").insert({
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      password,
    });
  },

  // Get user by email or username
  getUserByEmailOrUsername: (user) => {
    return knex("users")
      .where((builder) => {
        if (user.includes("@")) builder.where("email", user);
        else builder.where("username", user);
      })
      .first();
  },

  // Get user by ID
  getUserById: (id) => {
    return knex("users").where("id", id).first();
  },

  // Update user's profile picture and thumbnail
  updateProfilePic: (id, profilePicUrl, thumbnailUrl) => {
    return knex("users")
      .where("id", id)
      .update({ profile_pic: profilePicUrl, thumbnail: thumbnailUrl });
  },
};
