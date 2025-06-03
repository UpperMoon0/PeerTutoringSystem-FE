import React from 'react';
import type { Skill } from '../../types/skill.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

const PREDEFINED_GRADIENTS = [
  { color1: '#6DD5FA', color2: '#2980B9' }, // Blue
  { color1: '#A8E063', color2: '#56AB2F' }, // Green
  { color1: '#F7971E', color2: '#FFD200' }, // Orange/Yellow
  { color1: '#FF512F', color2: '#DD2476' }, // Red/Pink
  { color1: '#DA22FF', color2: '#9733EE' }, // Purple
  { color1: '#4E54C8', color2: '#8F94FB' }, // Indigo
  { color1: '#00C9FF', color2: '#92FE9D' }, // Light Blue/Green
  { color1: '#f2709c', color2: '#ff9472' }, // Pink/Orange
  { color1: '#43e97b', color2: '#38f9d7' }, // Bright Green/Turquoise
  { color1: '#c471f5', color2: '#fa71cd' }, // Light Purple/Pink
];

// Helper function to get gradient style object
const getGradientStyle = (skill: Skill) => {
  const baseString = `${skill.skillName}-${skill.skillLevel}-${skill.description}`;
  let hash = 0;
  for (let i = 0; i < baseString.length; i++) {
    hash = baseString.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  const index = Math.abs(hash) % PREDEFINED_GRADIENTS.length;
  const selectedGradient = PREDEFINED_GRADIENTS[index];

  return {
    background: `linear-gradient(to right, ${selectedGradient.color1}, ${selectedGradient.color2})`,
  };
};

interface SkillCardProps {
  skill: Skill;
  isSelected: boolean;
  onSelect: (skillId: string) => void;
  disabled?: boolean;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, isSelected, onSelect, disabled }) => {
  const gradientStyle = getGradientStyle(skill);

  return (
    <Card
      className={`
        relative cursor-pointer transition-all duration-200 hover:shadow-md text-white
        ${isSelected
          ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]'
          : 'hover:scale-[1.01]'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}
      `}
      style={gradientStyle}
      onClick={() => !disabled && onSelect(skill.skillID)}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full p-1 z-10">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}
      
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold leading-tight">
          {skill.skillName}
        </CardTitle>
        <CardDescription className="text-white/80 text-sm">
          Level: {skill.skillLevel}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-sm text-white/90 leading-relaxed line-clamp-3">
          {skill.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default SkillCard;
