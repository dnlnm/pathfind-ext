import { useState, useEffect } from 'react';
import { getServerConfig } from '@/lib/storage';
import { SettingsView } from './components/SettingsView';
import { SaveBookmarkView } from './components/SaveBookmarkView';
import { Loader2 } from 'lucide-react';

type View = 'loading' | 'settings' | 'save';

function App() {
  const [view, setView] = useState<View>('loading');
  const [configUrl, setConfigUrl] = useState('');
  const [configToken, setConfigToken] = useState('');

  useEffect(() => {
    const checkConfig = async () => {
      const { serverUrl, apiToken } = await getServerConfig();
      setConfigUrl(serverUrl);
      setConfigToken(apiToken);

      if (serverUrl && apiToken) {
        setView('save');
      } else {
        setView('settings');
      }
    };
    checkConfig();
  }, []);

  if (view === 'loading') {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (view === 'settings') {
    return (
      <SettingsView
        initialUrl={configUrl}
        initialToken={configToken}
        onConnected={() => setView('save')}
      />
    );
  }

  return <SaveBookmarkView onOpenSettings={() => setView('settings')} />;
}

export default App;
