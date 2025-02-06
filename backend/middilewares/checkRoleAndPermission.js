const jwt = require("jsonwebtoken");
const knexConfig = require("../mysql/knexfile"); // Assuming knexfile is in ../mysql/knexfile
const knex = require("knex")(knexConfig);

const checkRoleAndPermission = (req, res, next) => {
  try {
    // Extract token from authorization header
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Decode JWT token and extract user info
    const decoded = jwt.verify(token, "godisgreat");
    const userId = decoded.id; 
    const roleId = decoded.role; 

    const permissionName = getPermissionName(req);

    if (!permissionName) {
      return res
        .status(400)
        .json({ message: "Permission not defined for this action" });
    }

      console.log(req.method);
    knex("role_permissions")
      .join("permissions", "role_permissions.permission_id", "permissions.id")
      .where("role_permissions.role_id", roleId)
      .andWhere("permissions.name", permissionName)
      .andWhere(
        "permissions.action",
        req.method.toLowerCase() === "get" ? "view" : req.method.toLowerCase()
      ) 
      .then((permissions) => {
        if (permissions.length === 0) {
          return res.status(403).json({ message: "Permission denied" });
        }
        next(); 
      })
      .catch((error) => {
        console.error("Error checking permissions:", error);
        res.status(500).json({ message: "Internal server error" });
      });
  } catch (error) {
    console.error("Error in checkRoleAndPermission middleware:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPermissionName = (req) => {

    
    console.log(req.url);
  if (
    req.url.includes("/product") ||
    req.url.includes("/category") ||
    req.url.includes("/vendor") ||
    req.url.includes("/addNew") ||
    req.url.includes("/del/:id") ||
    req.url.includes("/update")
  )
    return "product_management";
  if (req.url.includes("/cart")) return "cart_management";
  if (req.url.includes("/file")) return "file_management";
  if (req.url.includes("/user")) return "user_management";

  return null; 
};

module.exports = checkRoleAndPermission;
