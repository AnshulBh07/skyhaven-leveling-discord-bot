"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const Schema = mongoose_1.default.Schema;
const choicesSchema = new Schema({
    name: { type: String, required: true, default: "" },
    value: { type: Schema.Types.Mixed, required: true },
}, { timestamps: false, _id: false });
const optionsSchema = new Schema({
    name: { type: String, required: true, default: "" },
    description: { type: String, required: true, default: "" },
    type: { type: Number, required: true, default: 0 },
    min_value: { type: Number },
    max_value: { type: Number },
    required: { type: Boolean, default: false },
    // options: { type: [this] },
    choices: { type: [choicesSchema] },
}, { timestamps: false, _id: false });
const commandSchema = new Schema({
    name: { type: String, required: true, unique: true, default: "" },
    description: { type: String, required: true, default: "" },
    options: { type: [optionsSchema], default: [] },
    type: { type: Number, default: 1 },
    nsfw: { type: Boolean, default: false },
}, { timestamps: true });
const Command = mongoose_1.default.model("Command", commandSchema);
exports.default = Command;
