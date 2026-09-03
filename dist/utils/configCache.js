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
exports.setCachedGuildConfig = exports.invalidateGuildConfigCache = exports.getCachedGuildConfig = void 0;
const configSchema_1 = __importDefault(require("../models/configSchema"));
const configCache = new Map();
const CONFIG_CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL
const getCachedGuildConfig = (serverID) => __awaiter(void 0, void 0, void 0, function* () {
    const now = Date.now();
    const cached = configCache.get(serverID);
    if (cached && cached.expiresAt > now) {
        return cached.config;
    }
    try {
        const guildConfig = (yield configSchema_1.default.findOne({
            serverID: serverID,
        }).lean());
        if (guildConfig) {
            configCache.set(serverID, {
                config: guildConfig,
                expiresAt: now + CONFIG_CACHE_TTL_MS,
            });
        }
        else {
            configCache.delete(serverID);
        }
        return guildConfig;
    }
    catch (err) {
        console.error(`Error fetching config for server ${serverID}:`, err);
        return null;
    }
});
exports.getCachedGuildConfig = getCachedGuildConfig;
const invalidateGuildConfigCache = (serverID) => {
    configCache.delete(serverID);
};
exports.invalidateGuildConfigCache = invalidateGuildConfigCache;
const setCachedGuildConfig = (serverID, config) => {
    configCache.set(serverID, {
        config,
        expiresAt: Date.now() + CONFIG_CACHE_TTL_MS,
    });
};
exports.setCachedGuildConfig = setCachedGuildConfig;
