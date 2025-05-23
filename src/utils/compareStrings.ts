export const compareStringsLexicographically = (a: string, b: string) => {
  const len = Math.min(a.length, b.length);

  for (let i = 0; i < len; i++) {
    const l1 = a.charCodeAt(i);
    const l2 = b.charCodeAt(i);

    if (l1 < l2) return -1;
    if (l2 < l1) return 1;
  }

  if (a.length < b.length) return -1;
  if (a.length > b.length) return 1;
  return 0;
};
