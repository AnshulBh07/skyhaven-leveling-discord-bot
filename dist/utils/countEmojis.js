"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.countEmojis = void 0;
const countEmojis = (text) => {
    const basicEmojis = text.match(/\p{Emoji}/gu) || [];
    //   custom emojis will be of the form <a?:emojiName:emojiID> where a stands for animated or not
    const customEmojis = text.match(/<a?:\w+:\d+>/gu) || [];
    return basicEmojis.length + customEmojis.length;
};
exports.countEmojis = countEmojis;
