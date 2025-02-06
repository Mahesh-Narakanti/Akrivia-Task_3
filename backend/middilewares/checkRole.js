const jwt = require("jsonwebtoken");
const knexConfig = require("../mysql/knexfile"); // Assuming knexfile is in ../mysql/knexfile
const knex = require("knex")(knexConfig);

const checkRole = (requiredRole) => {
    return (req, res, next) => {
      
    const token = req.headers.authorization?.split(" ")[1];
    if (!requiredRole) {
      return next(); // If no role is required, proceed to the next middleware
    }
   const decoded=jwt.verify(token, "godisgreat")
    const role  = decoded.role; // Access the role from the decoded token
    console.log("cur role:"+role+" "+requiredRole);
    // Compare the user's role with the required role
    if (role > requiredRole) {
      console.log("Insufficient role");
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }

    // Proceed if the role matches
    next();
  };
};

module.exports = checkRole;
