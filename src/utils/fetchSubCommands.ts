import path from "path";
import getAllFiles from "./getAllFiles";
import { ISubcommand } from "./interfaces";

export const fetchAllSubcommands = async (
	directoryPathString: string,
	foldersOnly: boolean,
): Promise<
	[string[], string[], string[], Map<string, ISubcommand>] | undefined
> => {
	try {
		// fetch all commands from the parent folder and map them to their names
		const subcommandsMap = new Map<string, ISubcommand>();
		const allSubcommandFiles = getAllFiles(directoryPathString, foldersOnly);

		const adminCommands: string[] = [],
			userCommands: string[] = [],
			ownerCommands: string[] = [];

		for (const file of allSubcommandFiles) {
			const module = await import(file);

			if (!module) continue;

			const commandObj: ISubcommand = await module.default();

			// get key string
			const cmdName = path.basename(file).split(".")[0];
			const cmdKey = cmdName.includes("_")
				? cmdName.replace("_", "-")
				: cmdName;
			const subcommand = commandObj;
			subcommandsMap.set(cmdKey, subcommand);

			// track admin and user commands for permissions check
			const type = file.split("\\").at(-2)!;

			if (type === "admin") adminCommands.push(cmdName);
			if (type === "user") userCommands.push(cmdName);
			if (type === "owner") ownerCommands.push(cmdName);
		}

		return [adminCommands, userCommands, ownerCommands, subcommandsMap];
	} catch (err) {
		console.error("Error while fetching all subcommands for : ", err);
		return undefined;
	}
};
