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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getLocalCommands_1 = __importDefault(require("../../utils/getLocalCommands"));
const getApplicationCommands_1 = __importDefault(require("../../utils/getApplicationCommands"));
const areCommandsSame_1 = require("../../utils/areCommandsSame");
const TEST_GUILD_NAME = "Seraphina Development Server"; // replace with your dev server name
const registerCommands = (client) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const localCommands = yield (0, getLocalCommands_1.default)();
        const isDev = process.env.NODE_ENV !== "production";
        if (isDev) {
            // 🔁 Register for dev guild instantly
            const devGuild = client.guilds.cache.find((guild) => guild.name === TEST_GUILD_NAME);
            if (!devGuild) {
                console.error("⚠️ Dev guild not found.");
                return;
            }
            const guildCommands = yield (0, getApplicationCommands_1.default)(client, devGuild.id);
            const manager = devGuild.commands;
            if (!guildCommands) {
                console.log("No guild commands found while registering.");
                return;
            }
            for (const localCommand of localCommands) {
                const { isDeleted, callback } = localCommand, command = __rest(localCommand, ["isDeleted", "callback"]);
                const existing = guildCommands.find((c) => c.name === command.name);
                // 🔍 Log the command before creating or editing
                // console.log("🔧 Attempting to register command:", command.name);
                // console.log(JSON.stringify(command, null, 2));
                if (isDeleted) {
                    if (existing) {
                        yield manager.delete(existing.id);
                        console.log(`🗑️ Deleted command ${command.name} (guild)`);
                    }
                    continue;
                }
                if (!existing) {
                    yield manager.create(command);
                    console.log(`✅ Created command ${command.name} (guild)`);
                }
                else if (!(0, areCommandsSame_1.areCommandsSame)(localCommand, existing)) {
                    yield manager.edit(existing.id, command);
                    console.log(`🔄 Updated command ${command.name} (guild)`);
                }
            }
        }
        else {
            // 🌍 Register globally (may take up to 1 hour)
            const globalCommands = yield (0, getApplicationCommands_1.default)(client);
            const manager = (_a = client.application) === null || _a === void 0 ? void 0 : _a.commands;
            if (!globalCommands) {
                console.log("No global commands found while registering");
                return;
            }
            if (!manager) {
                console.error("❌ Could not access application.commands");
                return;
            }
            for (const localCommand of localCommands) {
                const { isDeleted, callback } = localCommand, command = __rest(localCommand, ["isDeleted", "callback"]);
                const existing = globalCommands.find((c) => c.name === command.name);
                if (isDeleted) {
                    if (existing) {
                        yield manager.delete(existing.id);
                        console.log(`🗑️ Deleted command ${command.name} (global)`);
                    }
                    continue;
                }
                if (!existing) {
                    yield manager.create(command);
                    console.log(`🌐 Created command ${command.name} (global)`);
                }
                else if (!(0, areCommandsSame_1.areCommandsSame)(localCommand, existing)) {
                    yield manager.edit(existing.id, command);
                    console.log(`🌐 Updated command ${command.name} (global)`);
                }
            }
        }
    }
    catch (err) {
        console.error("Error registering commands:", err);
    }
});
exports.default = registerCommands;
