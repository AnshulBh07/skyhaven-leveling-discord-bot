export const countEmojis = (text: string) => {
  const basicEmojis = text.match(/\p{Emoji}/gu) || [];
  //   custom emojis will be of the form <a?:emojiName:emojiID> where a stands for animated or not
  const customEmojis = text.match(/<a?:\w+:\d+>/gu) || [];

  return basicEmojis.length + customEmojis.length;
};
