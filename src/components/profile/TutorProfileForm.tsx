import React, { useState, useEffect } from 'react';
import type { CreateTutorProfileDto, TutorProfileDto } from '../../types/TutorProfile';
import type { Skill } from '../../types/skill.types'; 
import { AdminSkillService } from '../../services/AdminSkillService'; 
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import SkillSelector from '../common/SkillSelector'; 

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
    skillIds: initialData?.skills?.map(s => s.skillID) || [], 
  });
  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialData?.skills?.map(s => s.skillID) || []);

  useEffect(() => {
    // Fetch all skills when component mounts
    const fetchSkills = async () => {
      const result = await AdminSkillService.getAllSkills();
      if (result.success && result.data) {
        setAllSkills(result.data);
      }
    };
    fetchSkills();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        bio: initialData.bio || '',
        experience: initialData.experience || '', 
        availability: initialData.availability || '',
        hourlyRate: initialData.hourlyRate || 0,
        skillIds: initialData.skills?.map(s => s.skillID) || [],
      });
      setSelectedSkills(initialData.skills?.map(s => s.skillID) || []);
    } else {
      setFormData({
        bio: '',
        experience: '',
        availability: '',
        hourlyRate: 0,
        skillIds: [],
      });
      setSelectedSkills([]);
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

  const handleSkillChange = (skillId: string) => {
    setSelectedSkills(prevSelectedSkills => {
      const newSelectedSkills = prevSelectedSkills.includes(skillId)
        ? prevSelectedSkills.filter(id => id !== skillId)
        : [...prevSelectedSkills, skillId];
      setFormData(prevFormData => ({ ...prevFormData, skillIds: newSelectedSkills }));
      return newSelectedSkills;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6 p-6 bg-gray-900 text-white rounded-lg shadow-lg border border-gray-800 space-y-6">
      <h2 className="text-2xl font-semibold mb-6 pb-4 border-b border-gray-800 text-white">{initialData ? 'Edit Tutor Profile' : 'Create Tutor Profile'}</h2>
      
      <div>
        <Label htmlFor="bio" className="text-gray-400">Bio</Label>
        <Textarea id="bio" name="bio" value={formData.bio} onChange={handleChange} required className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" />
      </div>

      <div>
        <Label htmlFor="experience" className="text-gray-400">Experience</Label>
        <Textarea id="experience" name="experience" value={formData.experience} onChange={handleChange} required className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" />
      </div>

      <div>
        <Label htmlFor="availability" className="text-gray-400">Availability (e.g., Weekends, Evenings)</Label>
        <Input id="availability" name="availability" value={formData.availability} onChange={handleChange} required className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" />
      </div>

      <div>
        <Label htmlFor="hourlyRate" className="text-gray-400">Hourly Rate ($)</Label>
        <Input id="hourlyRate" name="hourlyRate" type="number" step="0.01" value={formData.hourlyRate} onChange={handleChange} required className="mt-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500" />
      </div>

      {/* Skills selection section using the new SkillSelector component */}
      <SkillSelector
        allSkills={allSkills}
        selectedSkillIds={selectedSkills}
        onSkillChange={handleSkillChange}
        isLoading={isLoading}
        // Pass theme-related props if SkillSelector is also being themed, otherwise it might look out of place.
        // For now, assuming SkillSelector handles its own theming or is generic enough.
      />

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-800">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white">Cancel</Button>
        <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </form>
  );
};

export default TutorProfileForm;
