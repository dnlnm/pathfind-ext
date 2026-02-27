import { storage } from '#imports';

export interface ServerConfig {
    serverUrl: string;
    apiToken: string;
}

const serverUrlKey = storage.defineItem<string>('local:serverUrl', {
    fallback: '',
});

const apiTokenKey = storage.defineItem<string>('local:apiToken', {
    fallback: '',
});

export async function getServerConfig(): Promise<ServerConfig> {
    const [serverUrl, apiToken] = await Promise.all([
        serverUrlKey.getValue(),
        apiTokenKey.getValue(),
    ]);
    return { serverUrl, apiToken };
}

export async function setServerConfig(serverUrl: string, apiToken: string): Promise<void> {
    await Promise.all([
        serverUrlKey.setValue(serverUrl.replace(/\/+$/, '')),
        apiTokenKey.setValue(apiToken),
    ]);
}

export async function clearServerConfig(): Promise<void> {
    await Promise.all([
        serverUrlKey.removeValue(),
        apiTokenKey.removeValue(),
    ]);
}

export function watchServerConfig(callback: (config: ServerConfig) => void) {
    const update = async () => {
        const config = await getServerConfig();
        callback(config);
    };

    serverUrlKey.watch(() => update());
    apiTokenKey.watch(() => update());
}
