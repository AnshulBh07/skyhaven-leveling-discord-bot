"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateLvlTransition = void 0;
const canvas_1 = require("canvas");
const drawRoundedHexagon_1 = require("./drawRoundedHexagon");
const drawArrow_1 = require("./drawArrow");
const generateLvlTransition = (previous_level, current_level, baseColor) => {
    const canvas = (0, canvas_1.createCanvas)(800, 180);
    const ctx = canvas.getContext("2d");
    const roundedHexa1 = (0, drawRoundedHexagon_1.drawRoundedHexagonWithLevel)(500, 90, 60, 20, baseColor, previous_level.toString());
    const arrow = (0, drawArrow_1.drawArrow)(575, 90, 625, 90, baseColor, 20);
    const roundedHexa2 = (0, drawRoundedHexagon_1.drawRoundedHexagonWithLevel)(700, 90, 60, 20, baseColor, current_level.toString());
    ctx.drawImage(roundedHexa1, 0, 0);
    ctx.drawImage(arrow, 0, 0);
    ctx.drawImage(roundedHexa2, 0, 0);
    return canvas;
};
exports.generateLvlTransition = generateLvlTransition;
