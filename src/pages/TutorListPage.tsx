import React, { useEffect, useState } from 'react';
import type { User } from '../types/user.types';
import { TutorService } from '../services/TutorService';
import TutorCard from '@/components/tutor/TutorCard';
import { UserSkillService } from '@/services/UserSkillService'; // Added
import type { UserSkill } from '@/types/skill.types'; // Added

const TutorListPage: React.FC = () => {
  const [allTutors, setAllTutors] = useState<User[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  // Store skills for all tutors to avoid re-fetching in TutorCard if already fetched here
  // This is an optional optimization. For now, TutorCard fetches its own skills.
  // const [tutorSkillsMap, setTutorSkillsMap] = useState<Record<string, UserSkill[]>>({});

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const result = await TutorService.getAllTutors();
        if (result.success && result.data) {
          setAllTutors(result.data);
          setFilteredTutors(result.data);
          // Optional: Pre-fetch skills for all tutors
          // await fetchAllTutorSkills(result.data);
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

  // Optional: Function to pre-fetch all tutor skills
  // const fetchAllTutorSkills = async (tutors: User[]) => {
  //   const skillsMap: Record<string, UserSkill[]> = {};
  //   for (const tutor of tutors) {
  //     if (tutor.userID) {
  //       const skillsResult = await UserSkillService.getUserSkills(tutor.userID);
  //       if (skillsResult.success && skillsResult.data) {
  //         skillsMap[tutor.userID] = skillsResult.data;
  //       }
  //     }
  //   }
  //   setTutorSkillsMap(skillsMap);
  // };

  useEffect(() => {
    if (!searchTerm) {
      setFilteredTutors(allTutors);
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    // Basic search by name and email. Skill search can be added here if skills are pre-fetched.
    const filtered = allTutors.filter(tutor => 
      tutor.fullName.toLowerCase().includes(lowerSearchTerm) ||
      tutor.email.toLowerCase().includes(lowerSearchTerm)
      // Example: Search by skill name if skillsMap is populated
      // (tutorSkillsMap[tutor.userID] && tutorSkillsMap[tutor.userID].some(us => us.skill.skillName.toLowerCase().includes(lowerSearchTerm)))
    );
    setFilteredTutors(filtered);
  }, [searchTerm, allTutors]); // Removed tutorSkillsMap from dependencies for now

  if (loading) {
    return <div className="container mx-auto p-4">Loading tutors...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-4 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-700">Available Tutors</h1>
      
      <div className="mb-6 max-w-lg mx-auto">
        <input 
          type="text"
          placeholder="Search tutors by name, email or skills..." // Updated placeholder
          className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredTutors.length === 0 ? (
        <p className="text-center text-gray-600 py-4">
          {searchTerm ? `No tutors found matching "${searchTerm}".` : 'No tutors available at the moment.'}
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredTutors.map((tutor) => (
            <TutorCard key={tutor.userID} tutor={tutor} />
            // Optional: Pass pre-fetched skills to TutorCard
            // <TutorCard key={tutor.userID} tutor={tutor} initialSkills={tutorSkillsMap[tutor.userID]} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorListPage;
