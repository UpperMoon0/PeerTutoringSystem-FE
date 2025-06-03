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
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">
          {initialData ? 'Edit Tutor Profile' : 'Create Tutor Profile'}
        </h2>
        <p className="text-gray-400">
          {initialData
            ? 'Update your profile information to keep students informed'
            : 'Create a compelling profile to attract students and showcase your expertise'
          }
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div>
              <Label htmlFor="bio" className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                Bio
                <span className="text-xs text-gray-500">(Tell students about yourself)</span>
              </Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                required
                placeholder="Share your teaching philosophy, background, and what makes you unique as a tutor..."
                className="min-h-[120px] resize-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="experience" className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
                Experience
                <span className="text-xs text-gray-500">(Your qualifications and background)</span>
              </Label>
              <Textarea
                id="experience"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                placeholder="Describe your educational background, certifications, years of experience, and notable achievements..."
                className="min-h-[100px] resize-none bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="availability" className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              Availability
              <span className="text-xs text-gray-500">(When you're available)</span>
            </Label>
            <Input
              id="availability"
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              required
              placeholder="e.g., Weekdays 6-10 PM, Weekends"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="hourlyRate" className="text-sm font-medium text-gray-400 mb-2 flex items-center gap-2">
              Hourly Rate
              <span className="text-xs text-gray-500">(USD per hour)</span>
            </Label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-400">$</span>
              </div>
              <Input
                id="hourlyRate"
                name="hourlyRate"
                type="number"
                step="0.01"
                min="0"
                value={formData.hourlyRate}
                onChange={handleChange}
                required
                placeholder="25.00"
                className="pl-8 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-4 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
              <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Skills & Expertise
            </h3>
            <p className="text-sm text-gray-400">
              Select the skills you can teach. Students will be able to find you based on these skills.
            </p>
          </div>
          <SkillSelector
            allSkills={allSkills}
            selectedSkillIds={selectedSkills}
            onSkillChange={handleSkillChange}
            isLoading={isLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-6 border-t border-gray-800">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="sm:order-1 bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="sm:order-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Saving...
              </>
            ) : (
              initialData ? 'Update Profile' : 'Create Profile'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TutorProfileForm;
