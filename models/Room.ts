import { Schema, model, models } from "mongoose";

const BedSchema = new Schema(
  {
    bedType: {
      type: String,
      enum: ["SINGLE", "TWIN", "DOUBLE", "QUEEN", "KING", "SOFA_BED", "BUNK"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false },
);

const RoomSchema = new Schema(
  {
    hotelId: {
      type: Schema.Types.ObjectId,
      ref: "Hotel",
      required: true,
      index: true,
    },

    roomTypeId: {
      type: Schema.Types.ObjectId,
      ref: "RoomType",
      required: true,
      index: true,
    },

    roomNumber: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },

    name: {
      type: String,
      trim: true,
      default: "",
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      default: "",
      maxlength: 3000,
    },

    // Capacity
    maxAdults: {
      type: Number,
      required: true,
      min: 1,
      default: 2,
    },

    maxChildren: {
      type: Number,
      min: 0,
      default: 0,
    },

    maxOccupancy: {
      type: Number,
      required: true,
      min: 1,
      default: 2,
    },

    // Room area
    area: {
      type: Number,
      min: 0,
      default: 0,
    },

    areaUnit: {
      type: String,
      enum: ["SQM", "SQFT"],
      default: "SQM",
    },

    // Beds
    beds: {
      type: [BedSchema],
      default: [],
    },

    // Room amenities
    amenities: {
      type: [String],
      default: [],
    },

    // Base price per night
    basePrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    currency: {
      type: String,
      default: "VND",
      enum: ["VND", "USD"],
    },

    // Room operational status
    status: {
      type: String,
      enum: ["AVAILABLE", "OCCUPIED", "MAINTENANCE", "INACTIVE"],
      default: "AVAILABLE",
      required: true,
    },

    // Housekeeping
    isClean: {
      type: Boolean,
      default: true,
    },

    lastCleanedAt: {
      type: Date,
      default: null,
    },

    maintenanceNote: {
      type: String,
      default: "",
      maxlength: 1000,
    },

    maintenanceStart: {
      type: Date,
      default: null,
    },

    maintenanceEnd: {
      type: Date,
      default: null,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// A room number must be unique within a hotel.
RoomSchema.index({ hotelId: 1, roomNumber: 1 }, { unique: true });

// Search/filter rooms within a hotel.
RoomSchema.index({
  hotelId: 1,
  status: 1,
  roomTypeId: 1,
});

export const Room = models.Room || model("Room", RoomSchema);
