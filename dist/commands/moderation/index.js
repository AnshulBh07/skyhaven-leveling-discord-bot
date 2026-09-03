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
const path_1 = __importDefault(require("path"));
const getAllFiles_1 = __importDefault(require("../../utils/getAllFiles"));
const configSchema_1 = __importDefault(require("../../models/configSchema"));
const init = () => __awaiter(void 0, void 0, void 0, function* () {
    // fetch all subcommands and map them to command name
    // will be used here
    const subcommandsMap = new Map();
    const subcommandFiles = (0, getAllFiles_1.default)(path_1.default.join(__dirname, "", "subcommands"), false);
    for (const file of subcommandFiles) {
        // get the default export
        const module = yield Promise.resolve(`${file}`).then(s => __importStar(require(s)));
        if (!module)
            continue;
        const commandObj = yield module.default();
        // get key string
        const cmdName = path_1.default.basename(file).split(".")[0];
        const cmdKey = cmdName.includes("_") ? cmdName.replace("_", "-") : cmdName;
        const subcommand = commandObj;
        subcommandsMap.set(cmdKey, subcommand);
    }
    try {
        return {
            name: "mod",
            description: "All commands related to bot moderation",
            options: Array.from(subcommandsMap.entries()).map(([_, subcommand]) => subcommand.data),
            permissionsRequired: [],
            //   these commands can only be performed by bot admins
            callback: (client, interaction) => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    // for a valid command call the clalback function using map
                    const subcommandName = interaction.options.getSubcommand(false);
                    const guild = interaction.guild;
                    if (!subcommandName) {
                        yield interaction.editReply({
                            content: "Subcommands not found.",
                        });
                        return;
                    }
                    if (!guild) {
                        yield interaction.editReply({
                            content: "Guild not found",
                        });
                        return;
                    }
                    const subCmdKey = subcommandName;
                    const subCmd = subcommandsMap.get(subCmdKey);
                    if (!subCmd) {
                        yield interaction.editReply({
                            content: "Subcommand not found",
                        });
                        return;
                    }
                    const guildConfig = yield configSchema_1.default.findOne({ serverID: guild.id });
                    if (!guildConfig) {
                        yield interaction.editReply({ content: "Guild config not found." });
                        return;
                    }
                    const { botAdminIDs } = guildConfig.moderationConfig;
                    //   check for permissions
                    const user = interaction.user.id;
                    if (!botAdminIDs.includes(user)) {
                        yield interaction.editReply({
                            content: "You don't have the permission to run this command",
                        });
                        return;
                    }
                    // call the function
                    yield subCmd.callback(client, interaction);
                }
                catch (err) {
                    console.error("Error in gquest root command : ", err);
                }
            }),
        };
    }
    catch (err) {
        console.error("Error in gquest root file : ", err);
        return undefined;
    }
});
exports.default = init;
