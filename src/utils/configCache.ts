import Config from "../models/configSchema";
import { IConfig } from "./interfaces";

interface CachedConfigEntry {
	config: IConfig;
	expiresAt: number;
}

const configCache = new Map<string, CachedConfigEntry>();
const CONFIG_CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export const getCachedGuildConfig = async (
	serverID: string,
): Promise<IConfig | null> => {
	const now = Date.now();
	const cached = configCache.get(serverID);

	if (cached && cached.expiresAt > now) {
		return cached.config;
	}

	try {
		const guildConfig = (await Config.findOne({
			serverID: serverID,
		}).lean()) as IConfig | null;

		if (guildConfig) {
			configCache.set(serverID, {
				config: guildConfig,
				expiresAt: now + CONFIG_CACHE_TTL_MS,
			});
		} else {
			configCache.delete(serverID);
		}

		return guildConfig;
	} catch (err) {
		console.error(`Error fetching config for server ${serverID}:`, err);
		return null;
	}
};

export const invalidateGuildConfigCache = (serverID: string) => {
	configCache.delete(serverID);
};

export const setCachedGuildConfig = (serverID: string, config: IConfig) => {
	configCache.set(serverID, {
		config,
		expiresAt: Date.now() + CONFIG_CACHE_TTL_MS,
	});
};
