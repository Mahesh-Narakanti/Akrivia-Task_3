const jwt = require("jsonwebtoken");

const validateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    jwt.verify(token, "godisgreat", (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Token expired or invalid" });
      }

      req.user = decoded;
      next();
    });
  } catch (err) {
    next(err);
  }
};

module.exports = validateToken;
