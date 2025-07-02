import React, { useState, useMemo } from 'react';
import type { Skill } from '../../types/skill.types';
import { Input } from '../ui/input';
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
    <div className="space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search skills by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          disabled={isLoading}
          className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="bg-secondary/30 border border-border rounded-lg p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            Available Skills ({filteredSkills.length})
          </p>
          {selectedSkillIds.length > 0 && (
            <p className="text-xs text-muted-foreground">
              {selectedSkillIds.length} selected
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[400px] overflow-y-auto">
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
            <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                <svg
                  className="h-6 w-6 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No skills found</p>
              <p className="text-xs text-muted-foreground">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedSkillIds.length > 0 && (
        <div className="bg-primary/20 border border-primary/30 rounded-lg p-3">
          <p className="text-sm font-medium text-foreground mb-2">Selected Skills:</p>
          <div className="flex flex-wrap gap-2">
            {selectedSkillIds.map(skillId => {
              const skill = allSkills.find(s => s.skillID === skillId);
              return skill ? (
                <span
                  key={skillId}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary border border-primary/30 rounded-md text-xs font-medium"
                >
                  {skill.skillName}
                  <button
                    type="button"
                    onClick={() => onSkillChange(skillId)}
                    className="hover:bg-primary/30 rounded-full p-0.5 transition-colors"
                    disabled={isLoading}
                  >
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillSelector;
