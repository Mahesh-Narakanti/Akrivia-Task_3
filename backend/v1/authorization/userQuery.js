const knexConfig = require("../../mysql/knexfile"); // Assuming knexfile is in ../mysql/knexfile
const { use } = require("./userRoute");
const knex = require("knex")(knexConfig);

module.exports = {
  // Create a new user
  createUser: ({ firstName, lastName, username, email, password , branch_id ,role_id}) => {
    return knex("users").insert({
      first_name: firstName,
      last_name: lastName,
      username,
      email,
      password,
      role_id,
      branch_id
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
  getUserById: async (id) => {
  // Fetch the user by id
  const user = await knex("users").where("id", id).first();

  if (!user) {
    return null;
  }

  const branch = await knex("branch").select("branch_name").where("id", user.branch_id).first();

  const role = await knex("roles").select("role_name").where("id", user.role_id).first();

  return {
    id: user.id,
    thumbnail: user.thumbnail,
    email: user.email,
    username: user.username,
    branch: branch ? branch.branch_name : null, 
    role: role ? role.role_name : null, 
    branch_id:user.branch_id,
  };
},

  
  getUsers: async (branch) => {
    return await knex("users").select("id","first_name", "last_name", "username", "email", "profile_pic", "thumbnail", "status", "role_id").where("branch_id", branch);
  },
   
  editUser: async (user_id, role_id) => {
    return await  knex("users")
      .where("id", user_id)
      .update({ role_id: role_id});
  },
  // Update user's profile picture and thumbnail
  updateProfilePic: (id, profilePicUrl, thumbnailUrl) => {
    return knex("users")
      .where("id", id)
      .update({ profile_pic: profilePicUrl, thumbnail: thumbnailUrl });
  },
};
