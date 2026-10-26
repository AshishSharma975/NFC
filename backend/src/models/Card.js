import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    cardId: {
      type: String,
      required: [true, "Card ID is required"],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
      minlength: [3, "Card ID must be at least 3 characters"],
      maxlength: [64, "Card ID cannot exceed 64 characters"],
    },
    destinationUrl: {
      type: String,
      trim: true,
      default: "",
    },
    cardNumber: {
      type: Number,
      index: true,
      default: null,
    },
    batchId: {
      type: String,
      trim: true,
      index: true,
      default: "",
    },
    title: {
      type: String,
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive"],
        message: "Status must be either 'active' or 'inactive'",
      },
      default: "active",
      index: true,
    },
    scanCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastScannedAt: {
      type: Date,
      default: null,
    },
    activatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


cardSchema.virtual("redirectPath").get(function () {
  return `/c/${this.cardId}`;
});


cardSchema.set("toJSON", {
  virtuals: true,
  transform: (doc, ret) => {
    delete ret.__v;
    return ret;
  },
});

export const Card = mongoose.model("Card", cardSchema);
