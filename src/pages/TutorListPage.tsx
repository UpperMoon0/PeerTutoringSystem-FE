import React, { useEffect, useState } from 'react';
import type { Skill, SkillLevel } from '../types/skill.types';
import type { EnrichedTutor } from '../types/enrichedTutor.types';
import { TutorService } from '../services/TutorService';
import { AdminService } from '../services/AdminService';
import TutorCard from '@/components/tutor/TutorCard';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { X, Filter, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';


const TutorListPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [allTutors, setAllTutors] = useState<EnrichedTutor[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<EnrichedTutor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState<boolean>(false);
  
  // Filter states
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [minHourlyRate, setMinHourlyRate] = useState<string>('');
  const [maxHourlyRate, setMaxHourlyRate] = useState<string>('');
  const [selectedSkillLevels, setSelectedSkillLevels] = useState<SkillLevel[]>([]);
  const [minRating, setMinRating] = useState<string>('any');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Fetch all available skills for filtering
  useEffect(() => {
    const fetchSkills = async () => {
      setSkillsLoading(true);
      try {
        const result = await AdminService.getAllSkills();
        if (result.success && result.data) {
          setAvailableSkills(result.data);
        }
      } catch (err) {
        console.error('Error fetching skills:', err);
      } finally {
        setSkillsLoading(false);
      }
    };

    fetchSkills();
  }, []);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const result = await TutorService.getAllEnrichedTutors();
        if (result.success && result.data) {
          setAllTutors(result.data);
          setFilteredTutors(result.data);
        } else {
          if (typeof result.error === 'string') {
            setError(result.error || 'Failed to fetch tutors');
          } else if (result.error && typeof result.error.message === 'string') {
            setError(result.error.message || 'Failed to fetch tutors');
          } else {
            setError('Failed to fetch tutors');
          }
        }
      } catch (err) {
        setError('An unexpected error occurred.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTutors();
  }, []);

  // Filter and sort logic
  useEffect(() => {
    let tutorsToDisplay = [...allTutors];

    // Filter out the current user if they are a tutor
    if (currentUser && currentUser.role === 'Tutor') {
      tutorsToDisplay = tutorsToDisplay.filter(tutor => tutor.userID !== currentUser.userId);
    }

    // Filter by search term
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      tutorsToDisplay = tutorsToDisplay.filter(tutor => {
        const nameMatch = tutor.fullName.toLowerCase().includes(lowerSearchTerm);
        const emailMatch = tutor.email.toLowerCase().includes(lowerSearchTerm);
        const bioMatch = tutor.bio?.toLowerCase().includes(lowerSearchTerm) || false;
        const skillMatch = tutor.skills?.some(userSkill =>
          userSkill.skill.skillName.toLowerCase().includes(lowerSearchTerm)
        ) || false;
        return nameMatch || emailMatch || bioMatch || skillMatch;
      });
    }

    // Filter by selected skills
    if (selectedSkills.length > 0) {
      tutorsToDisplay = tutorsToDisplay.filter(tutor =>
        tutor.skills?.some(userSkill => selectedSkills.includes(userSkill.skill.skillID)) || false
      );
    }

    // Filter by hourly rate range
    if (minHourlyRate || maxHourlyRate) {
      tutorsToDisplay = tutorsToDisplay.filter(tutor => {
        const rate = tutor.hourlyRate;
        if (!rate) return false;
        
        const minRate = minHourlyRate ? parseFloat(minHourlyRate) : 0;
        const maxRate = maxHourlyRate ? parseFloat(maxHourlyRate) : Infinity;
        
        return rate >= minRate && rate <= maxRate;
      });
    }

    // Filter by skill levels
    if (selectedSkillLevels.length > 0) {
      tutorsToDisplay = tutorsToDisplay.filter(tutor =>
        tutor.skills?.some(userSkill => selectedSkillLevels.includes(userSkill.skill.skillLevel)) || false
      );
    }

    // Filter by minimum rating
    if (minRating && minRating !== 'any') {
      const minRatingValue = parseFloat(minRating);
      tutorsToDisplay = tutorsToDisplay.filter(tutor =>
        (tutor.averageRating || 0) >= minRatingValue
      );
    }

    // Sort tutors
    tutorsToDisplay.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.fullName.localeCompare(b.fullName);
        case 'rating':
          return (b.averageRating || 0) - (a.averageRating || 0);
        case 'rate-low':
          return (a.hourlyRate || 0) - (b.hourlyRate || 0);
        case 'rate-high':
          return (b.hourlyRate || 0) - (a.hourlyRate || 0);
        case 'reviews':
          return (b.reviewCount || 0) - (a.reviewCount || 0);
        default:
          return 0;
      }
    });
    
    setFilteredTutors(tutorsToDisplay);
  }, [searchTerm, allTutors, currentUser, selectedSkills, minHourlyRate, maxHourlyRate, selectedSkillLevels, minRating, sortBy]);

  // Helper functions for filter management
  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev =>
      prev.includes(skillId)
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  const toggleSkillLevel = (level: SkillLevel) => {
    setSelectedSkillLevels(prev =>
      prev.includes(level)
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedSkills([]);
    setMinHourlyRate('');
    setMaxHourlyRate('');
    setSelectedSkillLevels([]);
    setMinRating('any');
    setSortBy('name');
  };

  const skillLevels: SkillLevel[] = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Expert'];

  if (loading) {
    return (
      <div className="w-full bg-background min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-foreground text-lg font-medium">Loading tutors...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="w-full p-6 bg-background min-h-screen text-destructive">Error: {error}</div>;
  }

  return (
    <div className="w-full p-6 bg-background min-h-screen">
      <h1 className="text-4xl font-bold mb-8 text-center text-foreground">Available Tutors</h1>
      
      {/* Search and Filter Toggle */}
      <div className="mb-6 max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 w-full">
            <Input
              type="text"
              placeholder="Search tutors by name, email, bio, or skills..."
              className="w-full p-4 bg-card border border-input rounded-lg shadow-sm focus:ring-2 focus:ring-primary focus:border-primary text-foreground placeholder-muted-foreground transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="bg-popover border-border text-foreground hover:bg-accent flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-popover border-border text-foreground">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="rate-low">Price: Low to High</SelectItem>
                <SelectItem value="rate-high">Price: High to Low</SelectItem>
                <SelectItem value="reviews">Most Reviews</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && (
        <Card className="mb-6 max-w-6xl mx-auto bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Tutors
              </CardTitle>
              <Button
                variant="ghost"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                Clear All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skills Filter */}
            <div>
              <Label className="text-foreground font-medium mb-3 block">Skills</Label>
              {skillsLoading ? (
                <p className="text-muted-foreground">Loading skills...</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {availableSkills.map((skill) => (
                    <div key={skill.skillID} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill.skillID}`}
                        checked={selectedSkills.includes(skill.skillID)}
                        onCheckedChange={() => toggleSkill(skill.skillID)}
                        className="border-border"
                      />
                      <Label
                        htmlFor={`skill-${skill.skillID}`}
                        className="text-sm text-muted-foreground cursor-pointer"
                      >
                        {skill.skillName}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
              {selectedSkills.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedSkills.map((skillId) => {
                    const skill = availableSkills.find(s => s.skillID === skillId);
                    return skill ? (
                      <Badge
                        key={skillId}
                        variant="secondary"
                        className="bg-primary text-primary-foreground hover:bg-primary cursor-pointer flex items-center gap-1"
                        onClick={() => toggleSkill(skillId)}
                      >
                        {skill.skillName}
                        <X className="h-3 w-3" />
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Hourly Rate Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-foreground font-medium mb-2 block">Min Hourly Rate (VND)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={minHourlyRate}
                  onChange={(e) => setMinHourlyRate(e.target.value)}
                  className="bg-popover border-border text-foreground"
                />
              </div>
              <div>
                <Label className="text-foreground font-medium mb-2 block">Max Hourly Rate (VND)</Label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={maxHourlyRate}
                  onChange={(e) => setMaxHourlyRate(e.target.value)}
                  className="bg-popover border-border text-foreground"
                />
              </div>
            </div>

            {/* Skill Levels Filter */}
            <div>
              <Label className="text-foreground font-medium mb-3 block">Skill Levels</Label>
              <div className="flex flex-wrap gap-2">
                {skillLevels.map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={selectedSkillLevels.includes(level)}
                      onCheckedChange={() => toggleSkillLevel(level)}
                      className="border-border"
                    />
                    <Label
                      htmlFor={`level-${level}`}
                      className="text-sm text-muted-foreground cursor-pointer"
                    >
                      {level}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedSkillLevels.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {selectedSkillLevels.map((level) => (
                    <Badge
                      key={level}
                      variant="secondary"
                      className="bg-primary text-primary-foreground hover:bg-primary cursor-pointer flex items-center gap-1"
                      onClick={() => toggleSkillLevel(level)}
                    >
                      {level}
                      <X className="h-3 w-3" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Rating Filter */}
            <div>
              <Label className="text-foreground font-medium mb-2 block">Minimum Rating</Label>
              <Select value={minRating} onValueChange={setMinRating}>
                <SelectTrigger className="w-48 bg-popover border-border text-foreground">
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="any">Any rating</SelectItem>
                  <SelectItem value="1">1+ stars</SelectItem>
                  <SelectItem value="2">2+ stars</SelectItem>
                  <SelectItem value="3">3+ stars</SelectItem>
                  <SelectItem value="4">4+ stars</SelectItem>
                  <SelectItem value="4.5">4.5+ stars</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      <div className="mb-6 max-w-6xl mx-auto">
        <p className="text-muted-foreground text-center">
          {filteredTutors.length === 0
            ? searchTerm || selectedSkills.length > 0 || minHourlyRate || maxHourlyRate || selectedSkillLevels.length > 0 || (minRating && minRating !== 'any')
              ? 'No tutors match your current filters.'
              : 'No tutors available at the moment.'
            : `Showing ${filteredTutors.length} tutor${filteredTutors.length !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {/* Tutors Grid */}
      {filteredTutors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {filteredTutors.map((tutor) => (
            <TutorCard key={tutor.userID} tutor={tutor} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorListPage;
