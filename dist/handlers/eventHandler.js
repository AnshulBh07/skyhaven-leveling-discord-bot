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
const getAllFiles_1 = __importDefault(require("../utils/getAllFiles"));
const path_1 = __importDefault(require("path"));
const compareStrings_1 = require("../utils/compareStrings");
const eventHandler = (client) => {
    // get all event folders
    const eventFolders = (0, getAllFiles_1.default)(path_1.default.join(__dirname, "..", "events"), true);
    for (const eventFolder of eventFolders) {
        // get all files of this folder
        const eventFiles = (0, getAllFiles_1.default)(eventFolder, false);
        eventFiles.sort(compareStrings_1.compareStringsLexicographically);
        // get event name from folder name as they are same
        const eventName = eventFolder.replace(/\\/g, "/").split("/").pop();
        if (!eventName)
            continue;
        client.on(eventName, (...args) => __awaiter(void 0, void 0, void 0, function* () {
            // execute event files concurrently so long-running operations do not block independent handlers
            yield Promise.all(eventFiles.map((eventFile) => __awaiter(void 0, void 0, void 0, function* () {
                const module = yield Promise.resolve(`${eventFile}`).then(s => __importStar(require(s)));
                yield module.default(client, ...args);
            })));
        }));
    }
};
exports.default = eventHandler;
