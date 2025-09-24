import { create } from 'zustand';
import { Profile } from '@/types';
import { getProfiles, saveProfile, deleteProfile as removeProfile } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';
interface ProfileState {
  profiles: Profile[];
  selectedProfile: Profile | null;
  isLoading: boolean;
  fetchProfiles: () => Promise<void>;
  addProfile: (profile: Profile) => Promise<void>;
  updateProfile: (profile: Profile) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  selectProfile: (profile: Profile | null) => void;
  prepareNewProfile: (fields: { key: string; value: string }[]) => void;
}
export const useProfileStore = create<ProfileState>((set) => ({
  profiles: [],
  selectedProfile: null,
  isLoading: true,
  fetchProfiles: async () => {
    set({ isLoading: true });
    const profiles = await getProfiles();
    set({ profiles, isLoading: false });
  },
  addProfile: async (profile) => {
    await saveProfile(profile);
    set((state) => ({
      profiles: [...state.profiles, profile],
    }));
  },
  updateProfile: async (profile) => {
    await saveProfile(profile);
    set((state) => ({
      profiles: state.profiles.map((p) => (p.id === profile.id ? profile : p)),
    }));
  },
  deleteProfile: async (profileId) => {
    await removeProfile(profileId);
    set((state) => ({
      profiles: state.profiles.filter((p) => p.id !== profileId),
    }));
  },
  selectProfile: (profile) => {
    set({ selectedProfile: profile });
  },
  prepareNewProfile: (fields) => {
    const newProfile: Profile = {
      id: uuidv4(),
      name: 'New Profile from Form',
      fields: fields.map(field => ({
        id: uuidv4(),
        key: field.key,
        value: field.value,
      })),
    };
    set({ selectedProfile: newProfile });
  },
}));