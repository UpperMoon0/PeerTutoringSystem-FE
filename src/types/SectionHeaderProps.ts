export interface SectionHeaderProps {
  title: string;
  showSearch?: boolean;
  onSearchChange?: (searchTerm: string) => void;
  searchTerm?: string;
}
