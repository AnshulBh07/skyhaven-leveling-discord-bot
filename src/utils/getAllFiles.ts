// function that gets all files and sub folders from a particular folder, we will use this to get all files and folders from src/subfolder (events,commands,..)
import fs from "fs";
import path from "path";

const getAllFiles = (directory: string, foldersOnly = false) => {
  let fileNames: string[] = [];

  const files = fs.readdirSync(directory, { withFileTypes: true });

  //   check for each file in files whether it is a folder or not
  for (const file of files) {
    // create file path
    const filePath = path.join(directory, file.name);

    if (foldersOnly) {
      if (file.isDirectory()) fileNames.push(filePath);
    } else {
      if (file.isFile()) fileNames.push(filePath);
    }
  }

  return fileNames;
};

export default getAllFiles;
