"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// function that gets all files and sub folders from a particular folder, we will use this to get all files and folders from src/subfolder (events,commands,..)
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const getAllFiles = (directory, foldersOnly = false) => {
    let fileNames = [];
    // creating a dfs code because our file system is a sort of n-ary tree which has children nodes
    // only if parent is a folder/directory
    const dfs = (src) => {
        const files = fs_1.default.readdirSync(src, { withFileTypes: true });
        for (const node of files) {
            const fullPath = path_1.default.join(src, node.name);
            if (node.isDirectory()) {
                if (foldersOnly)
                    fileNames.push(fullPath);
                // recursively go to subfolders and files
                dfs(fullPath);
            }
            else {
                if (!foldersOnly)
                    fileNames.push(fullPath);
            }
        }
    };
    dfs(directory);
    return fileNames;
};
exports.default = getAllFiles;
