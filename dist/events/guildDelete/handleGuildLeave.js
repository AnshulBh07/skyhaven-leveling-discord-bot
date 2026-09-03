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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const configSchema_1 = __importDefault(require("../../models/configSchema"));
const execute = (client, guild) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // also delete guild from config
        yield configSchema_1.default.findOneAndDelete({ serverID: guild.id });
    }
    catch (err) {
        console.error(`❌ Error deleting commands for guild ${guild.name} : `, err);
    }
});
exports.default = execute;
