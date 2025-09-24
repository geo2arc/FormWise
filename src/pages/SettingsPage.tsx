import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useProfileStore } from '@/stores/profileStore';
import { clearAllData, exportProfiles, importProfiles } from '@/lib/storage';
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
import { Toaster, toast } from 'sonner';
export const SettingsPage: React.FC = () => {
  const { fetchProfiles } = useProfileStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const handleExport = async () => {
    try {
      await exportProfiles();
      toast.success("Profiles exported successfully!");
    } catch (error) {
      toast.error("Failed to export profiles.");
      console.error(error);
    }
  };
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsImporting(true);
    try {
      const imported = await importProfiles(file);
      await fetchProfiles(); // Refresh the store
      toast.success(`${imported.length} profiles imported successfully!`);
    } catch (error) {
      toast.error((error as Error).message || "Failed to import profiles.");
      console.error(error);
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  const handleClearData = async () => {
    try {
      await clearAllData();
      await fetchProfiles(); // Refresh the store
      toast.success("All data has been cleared.");
    } catch (error) {
      toast.error("Failed to clear data.");
      console.error(error);
    }
  };
  return (
    <>
      <Toaster richColors position="bottom-right" />
      <div className="space-y-8">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800">Data Management</CardTitle>
            <CardDescription>Import or export your profile data.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold text-slate-700">Export Profiles</h3>
                <p className="text-sm text-slate-500">Save all your profiles to a JSON file.</p>
              </div>
              <Button onClick={handleExport} variant="outline" className="text-slate-700">
                <Download className="mr-2 h-4 w-4" /> Export
              </Button>
            </div>
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold text-slate-700">Import Profiles</h3>
                <p className="text-sm text-slate-500">Load profiles from a JSON file.</p>
              </div>
              <Button onClick={handleImportClick} disabled={isImporting} variant="outline" className="text-slate-700">
                <Upload className="mr-2 h-4 w-4" /> {isImporting ? 'Importing...' : 'Import'}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="application/json"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="border-red-200 shadow-sm bg-red-50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-6 w-6" /> Danger Zone
            </CardTitle>
            <CardDescription className="text-red-600">These actions are permanent and cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 border border-red-300 bg-white rounded-lg">
              <div>
                <h3 className="font-semibold text-red-700">Clear All Data</h3>
                <p className="text-sm text-slate-500">Permanently delete all your profiles.</p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" /> Clear All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your profiles from this device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData} className="bg-red-600 hover:bg-red-700">
                      Yes, delete everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};