import React, { useEffect } from 'react';
import { useProfileStore } from '@/stores/profileStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Settings, FilePlus, ScanSearch, List } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Message, Profile } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
const PopupSkeleton: React.FC = () => (
  <div className="space-y-2">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="bg-white border-slate-200 shadow-sm">
        <CardContent className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 w-full">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="space-y-1 w-full">
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <Skeleton className="h-7 w-12 rounded-md" />
        </CardContent>
      </Card>
    ))}
  </div>
);
export const PopupPage: React.FC = () => {
  const { profiles, fetchProfiles, isLoading } = useProfileStore();
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);
  const openOptionsPage = () => {
    if (chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    }
  };
  const sendMessageToBackground = (message: Message) => {
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Message sending failed:', chrome.runtime.lastError.message);
        } else {
          console.log('Response from background:', response);
        }
      });
    } else {
      console.log("Not in a chrome extension context. Message:", message);
    }
  };
  const handleFillProfile = (profile: Profile) => {
    sendMessageToBackground({ type: 'FILL_FORM', payload: profile });
  };
  const handleScanAndFill = () => {
    sendMessageToBackground({ type: 'SCAN_AND_FILL' });
  };
  const handleSaveForm = () => {
    sendMessageToBackground({ type: 'SAVE_FORM_DATA' });
  };
  return (
    <div className="bg-slate-50 text-slate-900 w-[320px] p-4 font-sans">
      <header className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-slate-800">
            <path d="M12 2L2 7V17L12 22L22 17V7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2 7L12 12L22 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 className="text-lg font-bold text-slate-800">FormWise AI</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={openOptionsPage} className="text-slate-500 hover:bg-slate-200 transition-colors">
          <Settings className="h-5 w-5" />
        </Button>
      </header>
      <main className="space-y-3">
        <h2 className="text-sm font-medium text-slate-500 px-1">Your Profiles</h2>
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
          {isLoading ?
            <PopupSkeleton /> :
            profiles.length > 0 ?
              <AnimatePresence>
                {profiles.map((profile, index) =>
                  <motion.div
                    key={profile.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                    exit={{ opacity: 0, x: -10 }}>
                    <Card className="bg-white hover:bg-slate-100 transition-colors border-slate-200 shadow-sm">
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-md">
                            <List className="h-4 w-4 text-slate-600" />
                          </div>
                          <span className="font-medium text-slate-700">{profile.name}</span>
                        </div>
                        <Button size="sm" onClick={() => handleFillProfile(profile)} className="bg-slate-800 hover:bg-slate-700 text-slate-50 text-xs h-7 px-2.5 active:scale-95 transition-transform">
                          Fill
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence> :
              <div className="text-center py-4 px-2 bg-slate-100 rounded-lg">
                <p className="text-sm text-slate-600 mb-2">No profiles found.</p>
                <Button size="sm" onClick={openOptionsPage} className="bg-slate-800 hover:bg-slate-700 text-slate-50 h-8">
                  Create a Profile
                </Button>
              </div>
          }
        </div>
      </main>
      <footer className="mt-4 pt-4 border-t border-slate-200 space-y-2">
        <Button variant="outline" onClick={handleScanAndFill} className="w-full justify-start text-slate-700 hover:bg-slate-200 transition-colors">
          <ScanSearch className="mr-2 h-4 w-4" /> Scan & Fill Form
        </Button>
        <Button variant="outline" onClick={handleSaveForm} className="w-full justify-start text-slate-700 hover:bg-slate-200 transition-colors">
          <FilePlus className="mr-2 h-4 w-4" /> Save Form Data
        </Button>
      </footer>
    </div>);
};