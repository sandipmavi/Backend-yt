const jwt = require("jsonwebtoken");

const checkAuth = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(401).json({
      message: "Token Unauthorized",
    });
  }
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  req.user = decoded;

  next();
};
module.exports = checkAuth;
