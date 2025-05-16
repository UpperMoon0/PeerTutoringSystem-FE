import React, { useState, useEffect } from 'react';
import type { CreateTutorProfileDto, TutorProfileDto } from '../../types/TutorProfile';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';

interface TutorProfileFormProps {
  initialData?: TutorProfileDto | null;
  onSubmit: (data: CreateTutorProfileDto) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const TutorProfileForm: React.FC<TutorProfileFormProps> = ({ initialData, onSubmit, onCancel, isLoading }) => {
  const [formData, setFormData] = useState<CreateTutorProfileDto>({
    bio: initialData?.bio || '',
    experience: initialData?.experience || '', 
    availability: initialData?.availability || '',
    hourlyRate: initialData?.hourlyRate || 0,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        bio: initialData.bio || '',
        experience: initialData.experience || '', 
        availability: initialData.availability || '',
        hourlyRate: initialData.hourlyRate || 0,
      });
    } else {
      // Reset form if initialData becomes null
      setFormData({
        bio: '',
        experience: '',
        availability: '',
        hourlyRate: 0,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      // Ensure experience is a string, hourlyRate is a number
      [name]: name === 'hourlyRate' ? parseFloat(value) || 0 : value, 
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 p-6 bg-card text-card-foreground rounded-lg shadow space-y-4">
      <h2 className="text-2xl font-semibold mb-4">{initialData ? 'Edit Tutor Profile' : 'Create Tutor Profile'}</h2>
      
      <div>
        <Label htmlFor="bio">Bio</Label>
        <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} required className="mt-1" />
      </div>

      <div>
        <Label htmlFor="experience">Experience</Label> 
        <Textarea id="experience" name="experience" value={formData.experience} onChange={handleChange} required className="mt-1" />
      </div>

      <div>
        <Label htmlFor="availability">Availability (e.g., Weekends, Evenings)</Label>
        <Input id="availability" name="availability" value={formData.availability} onChange={handleChange} required className="mt-1" />
      </div>

      <div>
        <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
        <Input id="hourlyRate" name="hourlyRate" type="number" step="0.01" value={formData.hourlyRate} onChange={handleChange} required className="mt-1" />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Profile'}</Button>
      </div>
    </form>
  );
};

export default TutorProfileForm;
