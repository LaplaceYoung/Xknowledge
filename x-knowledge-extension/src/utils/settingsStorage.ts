export interface ExtensionSettings {
  siliconFlowApiKey: string;
  customAIPrompt: string;
  notionToken: string;
  notionDatabaseId: string;
  apiProvider: 'siliconflow' | 'custom';
  apiBaseUrl: string;
  apiModel: string;
  syncSecretsEnabled: boolean;
}

const ALL_KEYS = [
  'siliconFlowApiKey',
  'customAIPrompt',
  'notionToken',
  'notionDatabaseId',
  'apiProvider',
  'apiBaseUrl',
  'apiModel',
  'syncSecretsEnabled'
] as const;

const SENSITIVE_KEYS = ['siliconFlowApiKey', 'notionToken'] as const;

const NON_SENSITIVE_SYNC_KEYS = [
  'customAIPrompt',
  'notionDatabaseId',
  'apiProvider',
  'apiBaseUrl',
  'apiModel',
  'syncSecretsEnabled'
] as const;

const DEFAULT_SETTINGS: ExtensionSettings = {
  siliconFlowApiKey: '',
  customAIPrompt: '',
  notionToken: '',
  notionDatabaseId: '',
  apiProvider: 'siliconflow',
  apiBaseUrl: '',
  apiModel: '',
  syncSecretsEnabled: false
};

const hasLocalStorage = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.storage?.local;
};

const hasSyncStorage = (): boolean => {
  return typeof chrome !== 'undefined' && !!chrome.storage?.sync;
};

const getFromStorage = (area: chrome.storage.StorageArea, keys: readonly string[]): Promise<Record<string, unknown>> => {
  return new Promise((resolve) => {
    area.get([...keys], (result) => resolve(result as Record<string, unknown>));
  });
};

const setToStorage = (area: chrome.storage.StorageArea, payload: Record<string, unknown>): Promise<void> => {
  return new Promise((resolve) => {
    area.set(payload, () => resolve());
  });
};

const removeFromStorage = (area: chrome.storage.StorageArea, keys: readonly string[]): Promise<void> => {
  return new Promise((resolve) => {
    area.remove([...keys], () => resolve());
  });
};

const toStringValue = (value: unknown): string => {
  return typeof value === 'string' ? value : '';
};

const toBoolValue = (value: unknown, fallback = false): boolean => {
  return typeof value === 'boolean' ? value : fallback;
};

const normalizeSettings = (raw: Record<string, unknown>): ExtensionSettings => {
  return {
    siliconFlowApiKey: toStringValue(raw.siliconFlowApiKey),
    customAIPrompt: toStringValue(raw.customAIPrompt),
    notionToken: toStringValue(raw.notionToken),
    notionDatabaseId: toStringValue(raw.notionDatabaseId),
    apiProvider: raw.apiProvider === 'custom' ? 'custom' : 'siliconflow',
    apiBaseUrl: toStringValue(raw.apiBaseUrl),
    apiModel: toStringValue(raw.apiModel),
    syncSecretsEnabled: toBoolValue(raw.syncSecretsEnabled, false)
  };
};

const persistSettings = async (settings: ExtensionSettings): Promise<void> => {
  if (hasLocalStorage()) {
    await setToStorage(chrome.storage.local, { ...settings });
  }

  if (!hasSyncStorage()) return;

  const syncPayload: Record<string, unknown> = {};
  NON_SENSITIVE_SYNC_KEYS.forEach((key) => {
    syncPayload[key] = settings[key];
  });
  await setToStorage(chrome.storage.sync, syncPayload);

  if (settings.syncSecretsEnabled) {
    await setToStorage(chrome.storage.sync, {
      siliconFlowApiKey: settings.siliconFlowApiKey,
      notionToken: settings.notionToken
    });
  } else {
    await removeFromStorage(chrome.storage.sync, SENSITIVE_KEYS);
  }
};

export const loadSettings = async (): Promise<ExtensionSettings> => {
  const [localRaw, syncRaw] = await Promise.all([
    hasLocalStorage() ? getFromStorage(chrome.storage.local, ALL_KEYS) : Promise.resolve({}),
    hasSyncStorage() ? getFromStorage(chrome.storage.sync, ALL_KEYS) : Promise.resolve({})
  ]);

  const mergedRaw: Record<string, unknown> = {};
  ALL_KEYS.forEach((key) => {
    mergedRaw[key] = localRaw[key] ?? syncRaw[key] ?? DEFAULT_SETTINGS[key];
  });
  const merged = normalizeSettings(mergedRaw);

  if (hasLocalStorage()) {
    const needLocalSecretMigration = SENSITIVE_KEYS.some((key) => !toStringValue(localRaw[key]) && toStringValue(syncRaw[key]));
    if (needLocalSecretMigration) {
      await setToStorage(chrome.storage.local, {
        siliconFlowApiKey: merged.siliconFlowApiKey,
        notionToken: merged.notionToken
      });
    }
  }

  if (hasSyncStorage() && !merged.syncSecretsEnabled) {
    await removeFromStorage(chrome.storage.sync, SENSITIVE_KEYS);
  }

  return merged;
};

export const saveSettings = async (settings: ExtensionSettings): Promise<void> => {
  await persistSettings(settings);
};

export const updateSettings = async (partial: Partial<ExtensionSettings>): Promise<ExtensionSettings> => {
  const current = await loadSettings();
  const next = {
    ...current,
    ...partial
  };
  await persistSettings(next);
  return next;
};
