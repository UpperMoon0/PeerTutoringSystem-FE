import React, { useState, useMemo } from 'react';
import type { Skill } from '../../types/skill.types';
import { generateBrightColor } from '@/lib/utils';
import { Input } from '../ui/input';

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
        
        <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto">
          {filteredSkills.length > 0 ? (
            filteredSkills.map(skill => {
              const isSelected = selectedSkillIds.includes(skill.skillID);
              const bgColor = generateBrightColor(skill.skillName);
              return (
                <div
                  key={skill.skillID}
                  onClick={() => !isLoading && onSkillChange(skill.skillID)}
                  className={`
                    px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-all duration-200
                    ${isLoading ? 'cursor-not-allowed opacity-60' : 'hover:opacity-80'}
                    ${isSelected ? 'ring-2 ring-offset-2 ring-offset-background' : ''}
                  `}
                  style={{
                    backgroundColor: bgColor,
                    color: 'white',
                    ringColor: bgColor
                  }}
                >
                  {skill.skillName}
                </div>
              );
            })
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

    </div>
  );
};

export default SkillSelector;
