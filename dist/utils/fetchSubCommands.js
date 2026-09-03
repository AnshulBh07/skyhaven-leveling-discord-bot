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
exports.fetchAllSubcommands = void 0;
const path_1 = __importDefault(require("path"));
const getAllFiles_1 = __importDefault(require("./getAllFiles"));
const fetchAllSubcommands = (directoryPathString, foldersOnly) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // fetch all commands from the parent folder and map them to their names
        const subcommandsMap = new Map();
        const allSubcommandFiles = (0, getAllFiles_1.default)(directoryPathString, foldersOnly);
        const adminCommands = [], userCommands = [], ownerCommands = [];
        for (const file of allSubcommandFiles) {
            const module = yield Promise.resolve(`${file}`).then(s => __importStar(require(s)));
            if (!module)
                continue;
            const commandObj = yield module.default();
            // get key string
            const cmdName = path_1.default.basename(file).split(".")[0];
            const cmdKey = cmdName.includes("_")
                ? cmdName.replace("_", "-")
                : cmdName;
            const subcommand = commandObj;
            subcommandsMap.set(cmdKey, subcommand);
            // track admin and user commands for permissions check
            const type = file.split("\\").at(-2);
            if (type === "admin")
                adminCommands.push(cmdName);
            if (type === "user")
                userCommands.push(cmdName);
            if (type === "owner")
                ownerCommands.push(cmdName);
        }
        return [adminCommands, userCommands, ownerCommands, subcommandsMap];
    }
    catch (err) {
        console.error("Error while fetching all subcommands for : ", err);
        return undefined;
    }
});
exports.fetchAllSubcommands = fetchAllSubcommands;
