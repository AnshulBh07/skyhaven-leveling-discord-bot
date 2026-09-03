"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return {
            name: "ping",
            description: "a test ping command",
            options: [],
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                yield interaction.reply(`Pong! in ${client.ws.ping}ms`);
            }),
        };
    }
    catch (err) {
        console.error("Error loading ping command:", err);
        return undefined;
    }
});
exports.default = init;
