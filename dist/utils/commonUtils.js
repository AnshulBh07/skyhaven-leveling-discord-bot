"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRandomImage = exports.getThumbnail = void 0;
const discord_js_1 = require("discord.js");
const helperArrays_1 = require("../data/helperArrays");
const getThumbnail = () => {
    const thumbnail = new discord_js_1.AttachmentBuilder(helperArrays_1.leaderboardThumbnail).setName("thumbnail.png");
    return thumbnail;
};
exports.getThumbnail = getThumbnail;
const getRandomImage = (imagesArr) => {
    return imagesArr[Math.floor(Math.random() * imagesArr.length)];
};
exports.getRandomImage = getRandomImage;
