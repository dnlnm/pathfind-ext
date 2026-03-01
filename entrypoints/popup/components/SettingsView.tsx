import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { setServerConfig, getSearchInjectorEnabled, setSearchInjectorEnabled } from '@/lib/storage';
import { validateConnection } from '@/lib/api';
import { Loader2, Server, Key, CheckCircle2, AlertCircle, Search } from 'lucide-react';

interface SettingsViewProps {
    onConnected: () => void;
    initialUrl?: string;
    initialToken?: string;
}

export function SettingsView({ onConnected, initialUrl = '', initialToken = '' }: SettingsViewProps) {
    const [serverUrl, setServerUrl] = useState(initialUrl);
    const [apiToken, setApiToken] = useState(initialToken);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [searchInjector, setSearchInjector] = useState(true);

    useEffect(() => {
        getSearchInjectorEnabled().then(setSearchInjector);
    }, []);

    const handleConnect = async () => {
        if (!serverUrl || !apiToken) {
            setError('Both fields are required');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            // Save config first so the API client can use it
            await setServerConfig(serverUrl, apiToken);

            const valid = await validateConnection();
            if (valid) {
                setSuccess(true);
                setTimeout(() => onConnected(), 600);
            } else {
                setError('Could not connect. Check your URL and token.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Connection failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center size-10 rounded-xl bg-primary text-primary-foreground">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                        <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-base font-semibold">PathFind</h1>
                    <p className="text-xs text-muted-foreground">Connect to your instance</p>
                </div>
            </div>

            {/* Form */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="server-url">
                        <Server className="size-3.5" />
                        Server URL
                    </Label>
                    <Input
                        id="server-url"
                        type="url"
                        placeholder="https://pathfind.example.com"
                        value={serverUrl}
                        onChange={(e) => setServerUrl(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="api-token">
                        <Key className="size-3.5" />
                        API Token
                    </Label>
                    <Input
                        id="api-token"
                        type="password"
                        placeholder="pf_..."
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)}
                        disabled={loading}
                    />
                    <p className="text-[11px] text-muted-foreground">
                        Generate a token in PathFind → Settings → API Tokens
                    </p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/10 rounded-md px-3 py-2">
                        <AlertCircle className="size-3.5 shrink-0" />
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-md px-3 py-2">
                        <CheckCircle2 className="size-3.5 shrink-0" />
                        Connected successfully!
                    </div>
                )}

                <Button
                    className="w-full"
                    onClick={handleConnect}
                    disabled={loading || !serverUrl || !apiToken}
                >
                    {loading ? (
                        <>
                            <Loader2 className="size-4 animate-spin" />
                            Connecting...
                        </>
                    ) : (
                        'Connect'
                    )}
                </Button>

                {/* Search Injection Toggle */}
                <div className="border-t border-border/40 pt-4 mt-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="search-injector" className="text-xs cursor-pointer flex items-center gap-1.5">
                            <Search className="size-3.5" />
                            Search Injection
                        </Label>
                        <Switch
                            id="search-injector"
                            size="sm"
                            checked={searchInjector}
                            onCheckedChange={(checked) => {
                                setSearchInjector(checked);
                                setSearchInjectorEnabled(checked);
                            }}
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1">
                        Show matching bookmarks in Google &amp; DuckDuckGo results
                    </p>
                </div>
            </div>
        </div>
    );
}
