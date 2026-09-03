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
const getApplicationCommands = (client, guildID) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!client.application) {
            throw new Error("Client application not initialized. Ensure 'ready' event has fired.");
        }
        if (guildID) {
            const guild = yield client.guilds.fetch(guildID);
            return guild.commands.fetch();
        }
        const globalCommands = yield client.application.commands.fetch();
        return globalCommands;
    }
    catch (err) {
        console.error(err);
    }
});
exports.default = getApplicationCommands;
