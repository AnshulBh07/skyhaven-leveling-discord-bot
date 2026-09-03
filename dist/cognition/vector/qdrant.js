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
exports.searchVector = exports.insertVector = exports.setupQdrant = exports.VECTOR_SIZE = exports.qdrant = void 0;
const js_client_rest_1 = require("@qdrant/js-client-rest");
const dotenv_1 = __importDefault(require("dotenv"));
const envFile = `.env.${process.env.NODE_ENV || "development"}`;
dotenv_1.default.config({ path: envFile });
exports.qdrant = new js_client_rest_1.QdrantClient({
    url: process.env.VECTOR_DB_URI,
    apiKey: process.env.VECTOR_DB_KEY,
    checkCompatibility: false,
});
exports.VECTOR_SIZE = 768;
const setupQdrant = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const collections = yield exports.qdrant.getCollections();
        const existing = collections.collections.map((c) => c.name);
        if (!existing.includes("episodic_memories")) {
            yield exports.qdrant.createCollection("episodic_memories", {
                vectors: {
                    size: exports.VECTOR_SIZE,
                    distance: "Cosine",
                },
            });
            yield exports.qdrant.createPayloadIndex("episodic_memories", {
                field_name: "userID",
                field_schema: "keyword",
            });
        }
        if (!existing.includes("semantic_memories")) {
            yield exports.qdrant.createCollection("semantic_memories", {
                vectors: {
                    size: exports.VECTOR_SIZE,
                    distance: "Cosine",
                },
            });
            yield exports.qdrant.createPayloadIndex("semantic_memories", {
                field_name: "userID",
                field_schema: "keyword",
            });
        }
    }
    catch (err) {
        console.error("Error while setting up qdrant db : ", err);
    }
});
exports.setupQdrant = setupQdrant;
const insertVector = (embed, collectionName, vectorID, payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield exports.qdrant.upsert(collectionName, {
            points: [{ id: vectorID, vector: embed, payload: payload }],
        });
    }
    catch (err) {
        console.error("Error while inserting in qdrant db : ", err);
    }
});
exports.insertVector = insertVector;
const searchVector = (embed, user_id, collectionName) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const searchOptions = {
            vector: embed,
            limit: 15,
        };
        searchOptions.filter = {
            must: [{ key: "userID", match: { value: user_id } }],
        };
        const results = yield exports.qdrant.search(collectionName, searchOptions);
        return results
            ? results.map((r) => {
                var _a, _b;
                return ({
                    id: String(r.id),
                    score: Number(r.score),
                    payload: {
                        userID: String((_a = r.payload) === null || _a === void 0 ? void 0 : _a.userID),
                        type: (_b = r.payload) === null || _b === void 0 ? void 0 : _b.type,
                    },
                });
            })
            : [];
    }
    catch (err) {
        console.error("Error while searching in qdrant vector db : ", err);
        return [];
    }
});
exports.searchVector = searchVector;
