import mongoose from "mongoose";
const Schema = mongoose.Schema;

const RaidSchema = new Schema(
  {
    serverID: { type: String, required: true, default: "" },
    channelID: { type: String, required: true, default: "" },
    announcementMessageID: { type: String, required: true, default: "" },
    scoutMessageID: { type: String, required: true, default: "" },
    teamAllotmentMessageID: { type: String, required: true, default: "" },
    bosses: {
      type: [
        {
          type: String,
          enum: ["roaring_thruma", "dark_skull", "bison", "chimera", "celdyte"],
        },
      ],
      default: [],
    },
    participants: {
      type: {
        tank: { type: [String], required: true, default: [] },
        dps: { type: [String], required: true, default: [] },
        support: { type: [String], required: true, default: [] },
      },
    },
    stage: {
      type: String,
      enum: [
        "announced", //raid announced first message
        "scouted", //scouted for buffs and debuffs
        "alloted", //teams are alloted
        "finished", //raid finished
        "reviewed", //particpation reviewed by admin
        "completed", //raid completed
      ],
      default: "announced",
    },
    timetsamps: {
      announcementTime: { type: Number, required: true, default: Date.now() },
      scoutTime: { type: Number, default: null },
      allotmentTime: { type: Number, default: null },
      finishTime: { type: Number, default: null },
      reviewTime: { type: Number, default: null },
      completedTime: { type: Number, default: null },
    },
  },
  { timestamps: false }
);

const Raid = mongoose.model("Raid", RaidSchema);

export default Raid;
