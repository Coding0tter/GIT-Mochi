import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    jti: { type: String, unique: true, index: true, required: true },
    tokenHash: { type: String, required: true },
    userAgent: { type: String },
    ip: { type: String },
    revokedAt: { type: Date },
    expiresAt: { type: Date, index: true },
  },
  { timestamps: true },
);

export const RefreshToken = mongoose.model("RefreshToken", schema);
