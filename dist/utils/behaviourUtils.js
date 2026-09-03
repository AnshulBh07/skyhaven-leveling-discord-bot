"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomMoodMessage = getRandomMoodMessage;
const moodTemplates_1 = require("../data/moodTemplates");
function getRandomMoodMessage(mood, category, messageType) {
    const moodTemplate = moodTemplates_1.seraphinaTemplates[mood];
    const categoryGroup = moodTemplate === null || moodTemplate === void 0 ? void 0 : moodTemplate[category];
    const messages = categoryGroup === null || categoryGroup === void 0 ? void 0 : categoryGroup[messageType];
    if (!Array.isArray(messages) || messages.length === 0) {
        return "Seraphina is speechless...";
    }
    const randomIndex = Math.floor(Math.random() * messages.length);
    return messages[randomIndex];
}
