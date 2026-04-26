import jwt from "jsonwebtoken";

const verifyJwt = (token) =>
  new Promise((resolve, reject) =>
    jwt.verify(token, process.env.JWT_KEY, (err, decoded) =>
      err ? reject(err) : resolve(decoded),
    ),
  );

export const verifyToken = async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) return res.status(401).json({ message: "Unauthorized" });
  try {
    const decoded = await verifyJwt(token);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(403).json({ message: "Token is not valid" });
  }
};

const parseCookies = (cookieHeader = "") =>
  Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    }),
  );

export const verifySocketToken = async (socket, next) => {
  const cookies = parseCookies(socket.handshake.headers.cookie);
  const token = cookies.jwt;
  if (!token) return next(new Error("Authentication error"));
  try {
    const decoded = await verifyJwt(token);
    socket.userId = decoded.userId;
    next();
  } catch {
    next(new Error("Authentication error"));
  }
};
