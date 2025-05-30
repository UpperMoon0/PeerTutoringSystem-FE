import React, { useEffect, useState } from 'react';
import type { User } from '../types/user.types';
import { TutorService } from '../services/TutorService';
import TutorCard from '@/components/tutor/TutorCard'; 

const TutorListPage: React.FC = () => {
  const [allTutors, setAllTutors] = useState<User[]>([]);
  const [filteredTutors, setFilteredTutors] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        setLoading(true);
        const result = await TutorService.getAllTutors();
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

  useEffect(() => {
    if (!searchTerm) {
      setFilteredTutors(allTutors);
      return;
    }
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allTutors.filter(tutor => 
      tutor.fullName.toLowerCase().includes(lowerSearchTerm) ||
      tutor.email.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredTutors(filtered);
  }, [searchTerm, allTutors]); 

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
          placeholder="Search tutors by name or skills..." 
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTutors.map((tutor) => (
            <TutorCard key={tutor.userID} tutor={tutor} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TutorListPage;
