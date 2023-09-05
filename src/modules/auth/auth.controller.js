import { User } from "../../../db/models/user.model.js";
import { Token } from "../../../db/models/token.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import bcryptjs from "bcryptjs";
import crypto from "crypto";
import { sendEmail } from "../../utils/sendEmail.js";
import { confirmEmailTemp, resetPassTemp } from "../../utils/generateHtml.js";
import jwt from "jsonwebtoken";
import Randomstring from "randomstring";
import { Cart } from "../../../db/models/cart.model.js";
// register

export const register = asyncHandler(async (req, res, next) => {
  // console.log("register");

  // data from req

  const { userName, email, password, gender, phone } = req.body;

  // chech user existence

  const isUser = await User.find({ email });

  if (!isUser)
    return next(new Error(`Email already registered!`, { cause: 409 }));

  // hash password

  const hashPassword = bcryptjs.hashSync(
    password,
    Number(process.env.SALT_ROUND)
  );

  // generate activationCode  // or generate token payload email

  const activationCode = crypto.randomBytes(64).toString("hex");

  // create user

  const user = await User.create({
    userName,
    email,
    password: hashPassword,
    activationCode,
    gender,
    phone,
  });

  // create confirmationLink

  const link = `http://localhost:${process.env.PORT}/auth/confirmEmail/${activationCode}`;

  // send email

  const isSent = await sendEmail({
    to: email,
    subject: "Activate Account",
    html: confirmEmailTemp(link),
  });

  // send response

  return isSent
    ? res.json({ success: true, message: "Please review your email" })
    : next(new Error("Something went wrong!"));
});

// activateAccount

export const activateAccount = asyncHandler(async (req, res, next) => {
  // find user , delete the activationCode , update inConfirmed

  const user = await User.findOneAndUpdate(
    { activationCode: req.params.activationCode },
    { isConfirmed: true, $unset: { activationCode: 1 } }
  );

  // check if the user doesn't exist

  if (!user) return next(new Error("User not found", { cause: 404 }));

  // create a cart
  await Cart.create({ user: user._id });
  // send response

  return res.send(
    "Congratulations, your Account is now activated , try to login now!"
  );
});

// login

export const login = asyncHandler(async (req, res, next) => {
  // data from request
  const { email, password } = req.body;
  // check user existence
  const user = await User.findOne({ email });
  if (!user) return next(new Error("Invalid email!", { cause: 404 }));
  // check isConfirmed
  if (!user.isConfirmed)
    return next(new Error("please confirm your email!", { cause: 404 }));
  // check password
  const match = bcryptjs.compareSync(password, user.password);
  if (!match) return next(new Error("Invalid password!", { cause: 400 }));
  // generate token
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.TOKEN_KEY,
    {
      expiresIn: "2d",
    }
  );
  // save token in token model
  await Token.create({
    token,
    user: user._id,
    agent: req.headers["user-agent"],
  });
  // change user status to online and save user
  user.status = "online";
  await user.save();
  // send response
  return res.json({ success: true, results: token });
});

// send forget code

export const sendForgetCode = asyncHandler(async (req, res, next) => {
  // check user
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new Error("Invalid email!"));

  // generate code
  const code = Randomstring.generate({
    length: 5,
    charset: "numeric",
  });

  // save code in db
  user.forgetCode = code;
  await user.save();

  // send email
  return (await sendEmail({
    to: user.email,
    subject: "Reset password",
    html: resetPassTemp(code),
  }))
    ? res.json({ success: true, message: "check your email!" })
    : next(new Error("something went wrong!"));
});

// reset password
////////////////////////////// edit line 155 to find email and check if email exist
export const resetPassword = asyncHandler(async (req, res, next) => {
  // check user
  let user = await User.findOne({ email: req.body.email });
  if (!user) return next(new Error("Invalid Email!"));

  //check code
  if (user.forgetCode !== req.body.forgetCode)
    return next(new Error("Invalid Code!"));
  user = await User.findOneAndUpdate(
    { email: req.body.email },
    { $unset: { forgetCode: 1 } }
  );

  // hash password
  user.password = bcryptjs.hashSync(
    req.body.password,
    Number(process.env.SALT_ROUND)
  );
  await user.save();
  // Invalidate tokens
  const token = await Token.find({ user: user._id });
  token.forEach(async (token) => {
    token.isValid = false;
    await token.save();
  });

  // send response
  return res.json({ success: true, message: "try to login again!" });
});
