import { Schema, model, models } from "mongoose";

const RoomAssetSchema = new Schema(
  {
    hotelId: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },

    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },

    // IMAGE, VIDEO, DOCUMENT
    resourceType: {
      type: String,
      enum: ["IMAGE", "VIDEO", "DOCUMENT"],
      required: true,
    },

    // Classification
    category: {
      type: String,
      enum: [
        "THUMBNAIL",
        "ROOM_GALLERY",
        "BATHROOM",
        "VIEW",
        "FLOOR_PLAN",
        "VIDEO_TOUR",
        "DOCUMENT",
        "OTHER",
      ],
      default: "ROOM_GALLERY",
    },

    // Storage provider
    provider: {
      type: String,
      enum: ["CLOUDINARY", "S3"],
      default: "CLOUDINARY",
    },

    publicId: {
      type: String,
      required: true,
    },

    secureUrl: {
      type: String,
      required: true,
    },

    format: {
      type: String,
      default: "",
    },

    mimeType: {
      type: String,
      default: "",
    },

    size: {
      type: Number,
      min: 0,
      default: 0,
    },

    width: {
      type: Number,
      default: null,
    },

    height: {
      type: Number,
      default: null,
    },

    duration: {
      // Video duration in seconds
      type: Number,
      default: null,
    },

    altText: {
      type: String,
      trim: true,
      default: "",
      maxlength: 300,
    },

    caption: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    isPrimary: {
      type: Boolean,
      default: false,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// One primary asset per room and resource type.
RoomAssetSchema.index(
  {
    roomId: 1,
    resourceType: 1,
    isPrimary: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isPrimary: true,
    },
  },
);

RoomAssetSchema.index({
  hotelId: 1,
  roomId: 1,
  resourceType: 1,
});

export const RoomAsset =
  models.RoomAsset || model("RoomAsset", RoomAssetSchema);
