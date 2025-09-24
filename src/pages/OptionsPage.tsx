import React, { useEffect, useState } from 'react';
import { useProfileStore } from '@/stores/profileStore';
import { ProfileForm } from '@/components/ProfileForm';
import { SettingsPage } from '@/pages/SettingsPage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, User, Settings, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
type ActiveView = 'profiles' | 'settings';
export const OptionsPage: React.FC = () => {
  const { profiles, fetchProfiles, selectProfile, selectedProfile, deleteProfile, isLoading, prepareNewProfile } = useProfileStore();
  const [activeView, setActiveView] = useState<ActiveView>('profiles');
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);
  useEffect(() => {
    fetchProfiles();
    const urlParams = new URLSearchParams(window.location.search);
    const newProfileData = urlParams.get('newProfile');
    if (newProfileData) {
      try {
        const fields = JSON.parse(decodeURIComponent(newProfileData));
        if (Array.isArray(fields)) {
          prepareNewProfile(fields);
          setIsFormVisible(true);
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      } catch (error) {
        console.error("Failed to parse new profile data from URL:", error);
      }
    }
  }, [fetchProfiles, prepareNewProfile]);
  const handleAddNew = () => {
    selectProfile(null);
    setIsFormVisible(true);
  };
  const handleEdit = (profile: (typeof profiles)[0]) => {
    selectProfile(profile);
    setIsFormVisible(true);
  };
  const handleFormSave = () => {
    setIsFormVisible(false);
    selectProfile(null);
    fetchProfiles();
  };
  const handleDeleteConfirm = () => {
    if (profileToDelete) {
      deleteProfile(profileToDelete);
      setProfileToDelete(null);
    }
  };
  const renderProfilesView = () => (
    <AnimatePresence mode="wait">
      {isFormVisible ? (
        <motion.div
          key="form"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <ProfileForm profile={selectedProfile} onSave={handleFormSave} />
        </motion.div>
      ) : (
        <motion.div
          key="list"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-2xl font-bold text-slate-800">Your Profiles</CardTitle>
              <Button onClick={handleAddNew} className="bg-slate-800 hover:bg-slate-700 text-slate-50 active:scale-95 transition-transform">
                <Plus className="mr-2 h-4 w-4" /> Add New
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-slate-500 py-8">Loading profiles...</p>
              ) : profiles.length > 0 ? (
                <div className="space-y-3">
                  <AnimatePresence>
                    {profiles.map((profile, index) => (
                      <motion.div
                        key={profile.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                        exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                        className="p-4 border border-slate-200 rounded-lg flex items-center justify-between bg-white"
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{profile.name}</p>
                          <p className="text-sm text-slate-500">{profile.fields.length} fields</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(profile)} className="text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setProfileToDelete(profile.id)} className="text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the "{profile.name}" profile.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-lg">
                  <h3 className="text-lg font-medium text-slate-800">No Profiles Yet</h3>
                  <p className="text-slate-500 mt-1 mb-4">Click "Add New" to create your first profile.</p>
                  <Button onClick={handleAddNew} className="bg-slate-800 hover:bg-slate-700 text-slate-50">
                    <Plus className="mr-2 h-4 w-4" /> Create Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-2">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-800">
              <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <h1 className="text-4xl font-bold text-slate-800">FormWise AI</h1>
          </div>
          <p className="text-lg text-slate-500">Manage your autofill profiles and settings.</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <aside className="lg:col-span-1">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveView('profiles')}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg font-semibold transition-colors text-left",
                  activeView === 'profiles' ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100 text-slate-600'
                )}
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5" />
                  <span>Profiles</span>
                </div>
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => setActiveView('settings')}
                className={cn(
                  "w-full flex items-center justify-between p-3 rounded-lg font-semibold transition-colors text-left",
                  activeView === 'settings' ? 'bg-slate-200 text-slate-800' : 'hover:bg-slate-100 text-slate-600'
                )}
              >
                <div className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>
            </nav>
          </aside>
          <main className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeView === 'profiles' ? renderProfilesView() : <SettingsPage />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <footer className="text-center mt-16 text-slate-500 text-sm">
          <p>Built with ❤️ at Cloudflare</p>
        </footer>
      </div>
    </div>
  );
};