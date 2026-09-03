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
const cognitionWorker_1 = require("../../cognition/queues.ts/cognitionWorker");
const COGNITION_INTERVAL = 5 * 60 * 1000; // 5 minutes
const startCognitionLoop = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, cognitionWorker_1.processQueue)();
    }
    catch (err) {
        console.error("Cognition worker failed:", err);
    }
    finally {
        setTimeout(startCognitionLoop, COGNITION_INTERVAL);
    }
});
const execute = (client) => __awaiter(void 0, void 0, void 0, function* () {
    if (!client.user)
        return;
    client.user.setPresence({
        status: "online",
        activities: [
            {
                name: "Server",
                type: 3,
            },
        ],
    });
    console.log(`${client.user.username} bot is online.`);
    // Start background cognition loop
    void startCognitionLoop();
});
exports.default = execute;
