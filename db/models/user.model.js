import mongoose, { model, Schema } from "mongoose";

// Schema
const userSchema = new Schema(
  {
    userName: {
      type: String,
      unique: true,
      required: true,
      min: 3,
      max: 20,
    },

    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
    },

    gender: {
      type: String,
      required: true,
      enum: ["male", "female"],
    },

    phone: {
      type: String,
      unique: true,
    },

    address: String,

    status: {
      type: String,
      enum: [`online`, `offline`],
      default: `offline`,
    },

    role: {
      type: String,
      enum: [`user`, `admin`],
      default: `user`,
    },

    isConfirmed: {
      type: Boolean,
      default: false,
    },

    forgetCode: String,

    activationCode: String,
    profilePic: {
      url: {
        type: String,
        default:
          "https://res.cloudinary.com/dvv8v6lig/image/upload/v1691166307/ecommerce/user/download_ommb7k.jpg",
      },
      id: {
        type: String,
        default: "ecommerce/user/download_ommb7k",
      },
    },
  },
  { timestamps: true }
);
// Model
export const User = mongoose.models.User || model("User", userSchema);
