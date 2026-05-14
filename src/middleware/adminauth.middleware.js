import jwt from "jsonwebtoken";

export const verifyAdmin = (req, res, next) => {

  try {

    const token = req.cookies?.token || req.headers?.authorization?.replace("Bearer ", "")


    if (!token) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (decoded.role !== "admin") {
      return res.status(403).json({
        message: "Access Denied"
      });
    }

    req.admin = decoded;

    next();

  } catch (error) {

    return res.status(401).json({
      message: "Invalid Token"
    });

  }
};