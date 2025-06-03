import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export interface SectionHeaderProps {
  title: string;
  showSearch?: boolean;
  onSearchChange?: (searchTerm: string) => void;
  searchTerm?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, showSearch = false, onSearchChange, searchTerm }) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-4 md:mb-0">
          {title}
        </h2>
        {showSearch && onSearchChange && (
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 bg-gray-900 border-gray-800 text-white focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;
