import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: { type: String, required: [true, "Email is required"], unique: true },
  password: { type: String, required: [true, "Password is required"] },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  image: { type: String, required: false },
  imagePublicId: { type: String, required: false },
  color: { type: Number, required: false },
  profileSetup: { type: Boolean, default: false },
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

const User = mongoose.model("User", userSchema);

export default User;
