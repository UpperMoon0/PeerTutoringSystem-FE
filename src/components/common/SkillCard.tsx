import React from 'react';
import { XIcon, CheckCircleIcon } from 'lucide-react';
import type { Skill } from '../../types/skill.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface SkillCardProps {
  skill: Skill;
  isSelected?: boolean; 
  onSelect?: (skillId: string) => void; 
  onRemove?: (skillId: string) => void; 
  disabled?: boolean;
  isDisplayMode?: boolean;
}

const SkillCard: React.FC<SkillCardProps> = ({
  skill,
  isSelected = false,
  onSelect,
  onRemove,
  disabled = false,
  isDisplayMode = false,
}) => {
  const canSelect = !!onSelect && !isDisplayMode;
  const canRemove = !!onRemove && !isDisplayMode;

  return (
    <Card
      className={cn(
        'relative transition-all duration-200 group bg-card border-border',
        canSelect && 'cursor-pointer hover:shadow-md',
        isSelected && !isDisplayMode && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-[1.02]',
        !isSelected && canSelect && 'hover:scale-[1.01]',
        disabled && !isDisplayMode && 'opacity-60 cursor-not-allowed',
        isDisplayMode && 'shadow-sm hover:shadow-md', // Clean style for display mode
      )}
      onClick={() => !disabled && canSelect && onSelect(skill.skillID)}
    >
      {!isDisplayMode && isSelected && (
        <div className="absolute -top-2.5 -right-2.5 bg-primary text-primary-foreground rounded-full p-0.5 z-10 shadow-md">
          <CheckCircleIcon className="h-5 w-5" />
        </div>
      )}

      {canRemove && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-7 w-7 z-10 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            if (!disabled) onRemove(skill.skillID);
          }}
          disabled={disabled}
          aria-label={`Remove ${skill.skillName}`}
        >
          <XIcon className="h-4 w-4" />
        </Button>
      )}
      
      <CardHeader className={cn("pb-2", isDisplayMode && "mb-1")}>
        <CardTitle className={cn("text-md font-semibold leading-tight", isDisplayMode && "text-lg")}>
          {skill.skillName}
        </CardTitle>
        {!isDisplayMode && (
          <CardDescription className="text-sm pt-1">
            Level: <Badge variant="secondary" className="ml-1">{skill.skillLevel}</Badge>
          </CardDescription>
        )}
      </CardHeader>
      
      <CardContent className={cn("pt-0", isDisplayMode && "")}>
        {isDisplayMode && (
           <Badge variant="secondary" className="text-xs mb-2">Level: {skill.skillLevel}</Badge>
        )}
        <p className={cn(
            "text-sm text-muted-foreground leading-relaxed",
            isDisplayMode ? "line-clamp-none" : "line-clamp-3 h-[3.75rem]" // 3 lines * 1.25rem line-height
        )}>
          {skill.description}
        </p>
      </CardContent>
    </Card>
  );
};

export default SkillCard;
