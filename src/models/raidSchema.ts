import mongoose from "mongoose";
const Schema = mongoose.Schema;

const TimestampsSchema = new Schema(
  {
    announcementTime: { type: Number, required: true, default: Date.now() },
    startTime: { type: Number, required: true, default: null },
    scoutTime: { type: Number, default: null },
    allotmentTime: { type: Number, default: null },
    finishTime: { type: Number, default: null },
    reviewTime: { type: Number, default: null },
    completedTime: { type: Number, default: null },
  },
  { timestamps: false, _v: false, _id: false }
);

const RaidSchema = new Schema(
  {
    serverID: { type: String, required: true, default: "" },
    channelID: { type: String, required: true, default: "" },
    announcementMessageID: { type: String, required: true, default: "" },
    scoutMessageID: { type: String, required: true, default: "" },
    teamAllotmentMessageID: { type: String, required: true, default: "" },
    bannerUrl: { type: String, rquired: true, default: "" },
    bosses: {
      //the first element will be the boss that is to be scouted
      type: [
        {
          type: String,
          enum: ["roaring_thruma", "dark_skull", "bison", "chimera", "celdyte"],
        },
      ],
      default: [],
    },
    bossBuffsImageUrl: { type: String, default: "" },
    bossDebuffsImageUrl: { type: String, default: "" },
    participants: {
      type: {
        tank: { type: [String], required: true, default: [] },
        dps: { type: [String], required: true, default: [] },
        support: { type: [String], required: true, default: [] },
      },
      required: true,
    },
    waitlist: {
      type: {
        tank: { type: [String], required: true, default: [] },
        dps: { type: [String], required: true, default: [] },
        support: { type: [String], required: true, default: [] },
      },
      required: true,
    },
    stage: {
      type: String,
      enum: [
        "announced", //raid announced first message
        "scout_reminded",//reminded admins/officials for raid
        "scouted", //scouted for buffs and debuffs
        "alloted", //teams are alloted
        "player_reminded", //reminding participants a few minutes before
        "finished", //raid finished
        "reviewed", //particpation reviewed by admin
        "completed", //raid completed
      ],
      default: "announced",
    },
    raidTimestamps: { type: TimestampsSchema, required: true },
  },
  { timestamps: false }
);

const Raid = mongoose.model("Raid", RaidSchema);

export default Raid;
