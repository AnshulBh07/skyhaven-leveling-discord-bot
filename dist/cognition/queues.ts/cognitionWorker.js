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
exports.processQueue = void 0;
const runCognition_1 = require("../vector/runCognition");
const cognitionQueue_1 = require("./cognitionQueue");
let isProcessing = false;
const processQueue = () => __awaiter(void 0, void 0, void 0, function* () {
    if (isProcessing)
        return;
    isProcessing = true;
    try {
        while (cognitionQueue_1.CognitionQueue.length > 0) {
            const job = cognitionQueue_1.CognitionQueue.shift();
            if (!job)
                break;
            try {
                console.log(`🧠 Processing cognition job ${job.id}`);
                yield (0, runCognition_1.runCognition)(job.interaction, job.userId);
            }
            catch (err) {
                console.error(`Cognition failed, skipping job ${job.id} : `, err);
            }
        }
    }
    finally {
        isProcessing = false;
    }
});
exports.processQueue = processQueue;
