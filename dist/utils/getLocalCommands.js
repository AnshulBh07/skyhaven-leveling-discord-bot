"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
// function that gets all the commands (from commands folder)
const path_1 = __importDefault(require("path"));
const getAllFiles_1 = __importDefault(require("./getAllFiles"));
let cachedLocalCommands = null;
// exceptions contains the list of commands that we want to exclude
const getLocalCommands = (exceptions_1, ...args_1) => __awaiter(void 0, [exceptions_1, ...args_1], void 0, function* (exceptions, forceReload = false) {
    if (cachedLocalCommands && !forceReload && (!exceptions || exceptions.length === 0)) {
        return cachedLocalCommands;
    }
    let localCommands = [];
    try {
        //   get all command categories(folders) first
        const commandCategories = (0, getAllFiles_1.default)(path_1.default.join(__dirname, "..", "commands"), true);
        //   now iterate over command folders and get all files
        for (const commandCategory of commandCategories) {
            const commandFiles = (0, getAllFiles_1.default)(commandCategory, false);
            for (const file of commandFiles) {
                const module = yield Promise.resolve(`${file}`).then(s => __importStar(require(s)));
                if (!module) {
                    console.log("module undefined");
                    continue;
                }
                const commandObj = yield module.default();
                // we encounter a subcommand
                if (!commandObj.name)
                    continue;
                // skip commands in exceptions
                if (exceptions && exceptions.includes(commandObj.name))
                    continue;
                // check for duplicates
                if (!localCommands.some((command) => command.name === commandObj.name))
                    localCommands.push(commandObj);
            }
        }
        if (!exceptions || exceptions.length === 0) {
            cachedLocalCommands = localCommands;
        }
    }
    catch (err) {
        console.error(err);
    }
    return localCommands;
});
exports.default = getLocalCommands;
