import { Token } from "../../db/models/token.model.js";
import { User } from "../../db/models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
export const isAuthenticated = asyncHandler(async (req, res, next) => {
  // check token is existence and type
  let { token } = req.headers;
  if (!token || !token.startsWith(process.env.BEARER_KEY))
    return next(new Error("Valid token is required!", { cause: 400 }));
  // check payload
  token = token.split(process.env.BEARER_KEY)[1];
  const payload = jwt.verify(token, process.env.TOKEN_KEY);
  if (!payload) return next(new Error("Invalid Token!"));
  // check token in DB
  const tokenDB = await Token.findOne({ token, isValid: true });
  if (!tokenDB) return next(new Error("Token expired!"));
  // check user existence
  const user = await User.findOne({ email: payload.email });
  if (!user) return next(new Error("User not found!"));
  // pass user in req
  req.user = user;
  // return next
  return next();
});
