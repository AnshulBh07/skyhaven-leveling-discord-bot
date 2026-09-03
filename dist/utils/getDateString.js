"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeekOfYear = exports.getDateString = void 0;
const getDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
exports.getDateString = getDateString;
// Get ISO week number
const getWeekOfYear = (date) => {
    const temp = new Date(date.getTime());
    temp.setHours(0, 0, 0, 0);
    temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
    const week1 = new Date(temp.getFullYear(), 0, 4);
    return (1 +
        Math.round(((temp.getTime() - week1.getTime()) / 86400000 -
            3 +
            ((week1.getDay() + 6) % 7)) /
            7));
};
exports.getWeekOfYear = getWeekOfYear;
