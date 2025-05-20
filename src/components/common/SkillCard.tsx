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
      className={`cursor-pointer text-white ${isSelected ? 'border-primary border-2' : 'border-transparent border-2'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={gradientStyle}
      onClick={() => !disabled && onSelect(skill.skillID)}
    >
      <CardHeader>
        <CardTitle>{skill.skillName}</CardTitle>
        <CardDescription className="text-white opacity-80">Level: {skill.skillLevel}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-white opacity-90">{skill.description}</p>
      </CardContent>
    </Card>
  );
};

export default SkillCard;
