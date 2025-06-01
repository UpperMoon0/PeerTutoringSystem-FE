import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ListChecks, Users, Wrench } from 'lucide-react';
import TutorVerificationSection from '@/components/admin/TutorVerificationSection';
import ManageUsersSection from '@/components/admin/ManageUsersSection';
import ManageSkillsSection from '@/components/admin/ManageSkillsSection';

type AdminSection = 'tutor-verifications' | 'manage-users' | 'manage-skills';

const AdminDashboardPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<AdminSection>('tutor-verifications');

  const renderSection = () => {
    switch (activeSection) {
      case 'tutor-verifications':
        return <TutorVerificationSection />;
      case 'manage-users':
        return <ManageUsersSection />;
      case 'manage-skills':
        return <ManageSkillsSection />;
      default:
        return <TutorVerificationSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-xl lg:text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto p-6">
        <nav className="mb-6">
          <ul className="flex flex-wrap gap-4">
            <li>
              <Button
                variant={activeSection === 'tutor-verifications' ? "default" : "outline"}
                onClick={() => setActiveSection('tutor-verifications')}
                className={`${activeSection === 'tutor-verifications' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'} text-white px-4 py-2 text-base`}
              >
                <ListChecks className="mr-2 h-5 w-5" />
                Tutor Verifications
              </Button>
            </li>
            <li>
              <Button
                variant={activeSection === 'manage-users' ? "default" : "outline"}
                onClick={() => setActiveSection('manage-users')}
                className={`${activeSection === 'manage-users' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'} text-white px-4 py-2 text-base`}
              >
                <Users className="mr-2 h-5 w-5" />
                Manage Users
              </Button>
            </li>
            <li>
              <Button
                variant={activeSection === 'manage-skills' ? "default" : "outline"}
                onClick={() => setActiveSection('manage-skills')}
                className={`${activeSection === 'manage-skills' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-800 border-gray-700 hover:bg-gray-700'} text-white px-4 py-2 text-base`}
              >
                <Wrench className="mr-2 h-5 w-5" />
                Manage Skills
              </Button>
            </li>
          </ul>
        </nav>
        <div className="bg-gray-900 border border-gray-800 text-white p-6 rounded-lg shadow-xl">
          {renderSection()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
