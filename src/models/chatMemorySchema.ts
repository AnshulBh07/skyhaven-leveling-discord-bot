import mongoose from "mongoose";
const Schema = mongoose.Schema;

const MessageSchema = new Schema(
  {
    role: {
      type: String,
      enum: ["user", "model", "system"],
      required: true,
    },
    content: { type: String },
    timeStamp: { type: Number, default: Date.now() },
  },
  { timestamps: false }
);

const ChatMemorySchema = new Schema(
  {
    userID: { type: String, required: true },
    messages: { type: [MessageSchema], default: [] },
  },
  { timestamps: true }
);

const ChatMemory = mongoose.model("ChatMemory", ChatMemorySchema);

export default ChatMemory;
