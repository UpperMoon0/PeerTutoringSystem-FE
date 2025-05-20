import React, { useState, useMemo } from 'react';
import type { Skill } from '../../types/skill.types';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import SkillCard from './SkillCard'; 

interface SkillSelectorProps {
  allSkills: Skill[];
  selectedSkillIds: string[];
  onSkillChange: (skillId: string) => void;
  isLoading?: boolean;
}

const SkillSelector: React.FC<SkillSelectorProps> = ({
  allSkills,
  selectedSkillIds,
  onSkillChange,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSkills = useMemo(() => {
    if (!searchTerm) {
      return allSkills;
    }
    return allSkills.filter(skill =>
      skill.skillName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allSkills, searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="space-y-2">
      <Label>Skills</Label>
      <Input
        type="text"
        placeholder="Search skills..."
        value={searchTerm}
        onChange={handleSearchChange}
        className="mb-2"
        disabled={isLoading}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-2 border rounded-md max-h-[400px] overflow-y-auto">
        {filteredSkills.length > 0 ? (
          filteredSkills.map(skill => (
            <SkillCard
              key={skill.skillID}
              skill={skill}
              isSelected={selectedSkillIds.includes(skill.skillID)}
              onSelect={onSkillChange}
              disabled={isLoading}
            />
          ))
        ) : (
          <p className="text-sm text-muted-foreground col-span-full text-center">No skills found.</p>
        )}
      </div>
    </div>
  );
};

export default SkillSelector;
