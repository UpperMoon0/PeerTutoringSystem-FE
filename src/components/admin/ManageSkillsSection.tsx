import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AdminSkillService } from '../../services/AdminSkillService';
import type { Skill, CreateSkillDto, UpdateSkillDto, SkillLevel } from '../../types/skill.types';
import { useAuth } from '../../contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert, CheckCircle, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ManageSkillsSection: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  const [newSkillName, setNewSkillName] = useState<string>('');
  const [newSkillDescription, setNewSkillDescription] = useState<string>('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel | ''>('');
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null);
  const [deletingSkillId, setDeletingSkillId] = useState<string | null>(null);

  const { accessToken } = useAuth();

  const fetchSkills = useCallback(async () => {
    if (!accessToken) {
      setError('Authentication token not found. Please log in again.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const result = await AdminSkillService.getAllSkills();
    if (result.success && result.data) {
      setSkills(result.data);
    } else {
      setError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to fetch skills.');
    }
    setLoading(false);
  }, [accessToken]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) {
      setActionError('Skill name cannot be empty.');
      return;
    }
    if (!newSkillLevel.trim()) {
      setActionError('Skill level cannot be empty.');
      return;
    }
    if (!accessToken) {
      setActionError('Authentication token not found.');
      return;
    }
    setActionError(null);
    setActionSuccess(null);

    const payload: CreateSkillDto = {
      skillName: newSkillName,
      description: newSkillDescription,
      skillLevel: newSkillLevel as SkillLevel
    };

    const result = await AdminSkillService.addSkill(payload);
    if (result.success) {
      setActionSuccess('Skill added successfully!');
      fetchSkills();
      setIsAddModalOpen(false);
      setNewSkillName('');
      setNewSkillDescription('');
      setNewSkillLevel('');
    } else {
      setActionError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to add skill.');
    }
  };

  const handleEditSkill = async () => {
    if (!editingSkill || !editingSkill.skillName.trim()) {
      setActionError('Skill name cannot be empty.');
      return;
    }
    if (!accessToken) {
      setActionError('Authentication token not found.');
      return;
    }
    setActionError(null);
    setActionSuccess(null);

    const payload: UpdateSkillDto = {
      skillID: editingSkill.skillID, // Ensure skillID is included
      skillName: editingSkill.skillName,
      description: editingSkill.description,
      skillLevel: editingSkill.skillLevel as SkillLevel
    };

    const result = await AdminSkillService.updateSkill(editingSkill.skillID, payload);
    if (result.success) {
      setActionSuccess('Skill updated successfully!');
      fetchSkills();
      setIsEditModalOpen(false);
      setEditingSkill(null);
    } else {
      setActionError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to update skill.');
    }
  };

  const handleDeleteSkill = async () => {
    if (!deletingSkillId || !accessToken) {
      setActionError('Skill ID or token not found for deletion.');
      return;
    }
    setActionError(null);
    setActionSuccess(null);

    const result = await AdminSkillService.deleteSkill(deletingSkillId);
    if (result.success) {
      setActionSuccess('Skill deleted successfully!');
      fetchSkills();
      setIsDeleteModalOpen(false);
      setDeletingSkillId(null);
    } else {
      setActionError(typeof result.error === 'string' ? result.error : result.error?.message || 'Failed to delete skill.');
    }
  };

  const openEditModal = (skill: Skill) => {
    setEditingSkill({ ...skill });
    setIsEditModalOpen(true);
    setActionError(null);
    setActionSuccess(null);
  };

  const openDeleteModal = (skillId: string) => {
    setDeletingSkillId(skillId);
    setIsDeleteModalOpen(true);
    setActionError(null);
    setActionSuccess(null);
  };

  if (loading && skills.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        <p className="ml-2 text-lg text-gray-400">Loading skills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4 bg-red-500/10 text-red-400 border-red-500">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-gray-950 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Manage Skills</h1>
        <Button onClick={() => {
          setIsAddModalOpen(true);
          setActionError(null);
          setActionSuccess(null);
          setNewSkillName('');
          setNewSkillDescription('');
          setNewSkillLevel('');
        }} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Skill
        </Button>
      </div>

      {actionError && (
        <Alert variant="destructive" className="mb-4 bg-red-500/10 text-red-400 border-red-500">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Action Failed</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}
      {actionSuccess && (
        <Alert variant="default" className="mb-4 bg-green-700/30 border-green-500 text-green-400">
          <CheckCircle className="h-4 w-4 text-green-400" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}

      {skills.length === 0 && !loading && (
        <p className="text-center text-gray-400 text-lg">No skills found. Click "Add New Skill" to create one.</p>
      )}

      {skills.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-5 py-3 border-b-2 border-gray-800 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-800 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-800 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Skill Level
                </th>
                <th className="px-5 py-3 border-b-2 border-gray-800 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-white">
              {skills.map((skill) => (
                <tr key={skill.skillID} className="hover:bg-gray-800/50">
                  <td className="px-5 py-4 border-b border-gray-800 bg-gray-900 text-sm">
                    <p className="text-white whitespace-no-wrap">{skill.skillName}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-800 bg-gray-900 text-sm">
                    <p className="text-white whitespace-no-wrap">{skill.description || 'N/A'}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-800 bg-gray-900 text-sm">
                    <p className="text-white whitespace-no-wrap">{skill.skillLevel}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-gray-800 bg-gray-900 text-sm">
                    <button
                      onClick={() => openEditModal(skill)}
                      className="text-blue-400 hover:text-blue-300 mr-3 transition duration-150 ease-in-out"
                      aria-label="Edit skill"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(skill.skillID)}
                      className="text-red-400 hover:text-red-300 transition duration-150 ease-in-out"
                      aria-label="Delete skill"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Skill Modal */}
      {isAddModalOpen && (
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Add New Skill</DialogTitle>
              <DialogDescription className="text-gray-400">
                Enter the details for the new skill.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="newSkillName"
                placeholder="Skill Name (e.g., React, Python)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="col-span-3 bg-gray-800 text-white border-gray-700 placeholder:text-gray-400"
              />
              <Textarea
                id="newSkillDescription"
                placeholder="Skill Description (optional)"
                value={newSkillDescription}
                onChange={(e) => setNewSkillDescription(e.target.value)}
                className="col-span-3 bg-gray-800 text-white border-gray-700 placeholder:text-gray-400"
              />
              <Select onValueChange={(value) => setNewSkillLevel(value as SkillLevel)} value={newSkillLevel}>
                <SelectTrigger className="col-span-3 bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Select Skill Level" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Elementary">Elementary</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-gray-700 hover:bg-gray-800 hover:text-gray-300 text-white">Cancel</Button>
              <Button onClick={handleAddSkill} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Add Skill</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Skill Modal */}
      {editingSkill && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Skill</DialogTitle>
              <DialogDescription className="text-gray-400">
                Update the details for the skill: {editingSkill.skillName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="editSkillName"
                placeholder="Skill Name"
                value={editingSkill.skillName}
                onChange={(e) => setEditingSkill({ ...editingSkill, skillName: e.target.value })}
                className="col-span-3 bg-gray-800 text-white border-gray-700 placeholder:text-gray-400"
              />
              <Textarea
                id="editSkillDescription"
                placeholder="Skill Description (optional)"
                value={editingSkill.description || ''}
                onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                className="col-span-3 bg-gray-800 text-white border-gray-700 placeholder:text-gray-400"
              />
              <Select onValueChange={(value) => setEditingSkill({ ...editingSkill, skillLevel: value as SkillLevel })} value={editingSkill.skillLevel || ''}>
                <SelectTrigger className="col-span-3 bg-gray-800 text-white border-gray-700">
                  <SelectValue placeholder="Select Skill Level" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 text-white border-gray-700">
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Elementary">Elementary</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingSkill(null); }} className="border-gray-700 hover:bg-gray-800 hover:text-gray-300 text-white">Cancel</Button>
              <Button onClick={handleEditSkill} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Skill Confirmation Modal */}
      {deletingSkillId && (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-gray-400">
                Are you sure you want to delete this skill? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsDeleteModalOpen(false); setDeletingSkillId(null); }} className="border-gray-700 hover:bg-gray-800 hover:text-gray-300 text-white">Cancel</Button>
              <Button onClick={handleDeleteSkill} variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">Delete Skill</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManageSkillsSection;