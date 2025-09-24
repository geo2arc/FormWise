import { Profile } from "@/types";
const createMockStorage = () => {
  let store: { [key: string]: any; } = {};
  return {
    local: {
      get: (keys: string | string[] | { [key: string]: any; } | null, callback: (items: { [key: string]: any; }) => void) => {
        const result: { [key: string]: any; } = {};
        if (keys === null) {
          callback(store);
          return;
        }
        const keyList = Array.isArray(keys) ? keys : typeof keys === 'object' ? Object.keys(keys) : [keys];
        keyList.forEach((key) => {
          if (store[key]) {
            result[key] = store[key];
          }
        });
        callback(result);
      },
      set: (items: { [key: string]: any; }, callback?: () => void) => {
        store = { ...store, ...items };
        if (callback) callback();
      },
      remove: (keys: string | string[], callback?: () => void) => {
        const keyList = Array.isArray(keys) ? keys : [keys];
        keyList.forEach((key) => {
          delete store[key];
        });
        if (callback) callback();
      },
      clear: (callback?: () => void) => {
        store = {};
        if (callback) callback();
      }
    }
  };
};
const storage = typeof chrome !== 'undefined' && chrome.storage ? chrome.storage : createMockStorage();
const PROFILES_KEY = 'formwise_ai_profiles';
export const getProfiles = async (): Promise<Profile[]> => {
  return new Promise((resolve) => {
    storage.local.get([PROFILES_KEY], (result) => {
      resolve(result[PROFILES_KEY] || []);
    });
  });
};
export const saveProfiles = async (profiles: Profile[]): Promise<void> => {
  return new Promise((resolve) => {
    storage.local.set({ [PROFILES_KEY]: profiles }, () => {
      resolve();
    });
  });
};
export const saveProfile = async (profile: Profile): Promise<void> => {
  const profiles = await getProfiles();
  const existingIndex = profiles.findIndex((p) => p.id === profile.id);
  if (existingIndex > -1) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }
  await saveProfiles(profiles);
};
export const deleteProfile = async (profileId: string): Promise<void> => {
  const profiles = await getProfiles();
  const updatedProfiles = profiles.filter((p) => p.id !== profileId);
  await saveProfiles(updatedProfiles);
};
export const clearAllData = async (): Promise<void> => {
  return new Promise((resolve) => {
    storage.local.clear(() => {
      resolve();
    });
  });
};
export const exportProfiles = async (): Promise<void> => {
  const profiles = await getProfiles();
  const dataStr = JSON.stringify(profiles, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'formwise_ai_profiles.json';
  a.click();
  URL.revokeObjectURL(url);
};
export const importProfiles = (file: File): Promise<Profile[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const profiles = JSON.parse(event.target?.result as string);
        // Basic validation
        if (Array.isArray(profiles) && profiles.every(p => p.id && p.name && Array.isArray(p.fields))) {
          await saveProfiles(profiles);
          resolve(profiles);
        } else {
          reject(new Error('Invalid profile format.'));
        }
      } catch (e) {
        reject(new Error('Failed to parse JSON file.'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(file);
  });
};