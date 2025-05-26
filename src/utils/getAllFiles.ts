// function that gets all files and sub folders from a particular folder, we will use this to get all files and folders from src/subfolder (events,commands,..)
import fs from "fs";
import path from "path";

const getAllFiles = (directory: string, foldersOnly = false) => {
  let fileNames: string[] = [];

  // creating a dfs code because our file system is a sort of n-ary tree which has children nodes
  // only if parent is a folder/directory
  const dfs = (src: string) => {
    const files = fs.readdirSync(src, { withFileTypes: true });

    for (const node of files) {
      const fullPath = path.join(src, node.name);

      if (node.isDirectory()) {
        if (foldersOnly) fileNames.push(fullPath);
        // recursively go to subfolders and files
        dfs(fullPath);
      } else {
        if (!foldersOnly) fileNames.push(fullPath);
      }
    }
  };

  dfs(directory);
  return fileNames;
};

export default getAllFiles;
