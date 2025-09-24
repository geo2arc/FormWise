import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { Profile } from '@/types';
import { useProfileStore } from '@/stores/profileStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { PlusCircle, Trash2, Save } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
const profileFieldSchema = z.object({
  id: z.string(),
  key: z.string().min(1, 'Key is required'),
  value: z.string().min(1, 'Value is required'),
});
const profileSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Profile name is required'),
  fields: z.array(profileFieldSchema),
});
type ProfileFormData = z.infer<typeof profileSchema>;
interface ProfileFormProps {
  profile?: Profile | null;
  onSave: () => void;
}
export const ProfileForm: React.FC<ProfileFormProps> = ({ profile, onSave }) => {
  const { addProfile, updateProfile } = useProfileStore();
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile || {
      id: uuidv4(),
      name: '',
      fields: [{ id: uuidv4(), key: '', value: '' }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fields',
  });
  useEffect(() => {
    reset(profile || {
      id: uuidv4(),
      name: '',
      fields: [{ id: uuidv4(), key: '', value: '' }],
    });
  }, [profile, reset]);
  const onSubmit = async (data: ProfileFormData) => {
    if (profile) {
      await updateProfile(data);
    } else {
      await addProfile(data);
    }
    onSave();
  };
  return (
    <Card className="w-full border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-slate-800">
          {profile ? 'Edit Profile' : 'Create New Profile'}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-medium text-slate-600">Profile Name</Label>
            <Input id="name" {...register('name')} placeholder="e.g., Personal, Work" className="focus-visible:ring-slate-400" />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>
          <div className="space-y-4">
            <Label className="font-medium text-slate-600">Profile Fields</Label>
            <AnimatePresence>
              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                  className="flex items-center gap-2"
                >
                  <Input {...register(`fields.${index}.key`)} placeholder="Field Name (e.g., Email)" className="focus-visible:ring-slate-400" />
                  <Input {...register(`fields.${index}.value`)} placeholder="Field Value" className="focus-visible:ring-slate-400" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </AnimatePresence>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ id: uuidv4(), key: '', value: '' })}
              className="w-full border-dashed text-slate-600 hover:text-slate-800 hover:border-slate-400 transition-colors"
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Add Field
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onSave} className="text-slate-700">
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="bg-slate-800 hover:bg-slate-700 text-slate-50 active:scale-95 transition-transform">
            <Save className="mr-2 h-4 w-4" /> {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};