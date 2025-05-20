import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AdminSkillService } from '../../services/AdminSkillService';
import type { Skill, CreateSkillDto, UpdateSkillDto, SkillLevel } from '../../types/skill.types'; 
import { useAuth } from '../../contexts/AuthContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ShieldAlert, CheckCircle, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'; 

const ManageSkillsPage: React.FC = () => {
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
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel | '' >(''); 
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
      skillName: editingSkill.skillName,
      description: editingSkill.Description,
      skillLevel: editingSkill.SkillLevel as SkillLevel 
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
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="ml-2 text-lg">Loading skills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Skills</h1>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600 text-white">
              <PlusCircle className="mr-2 h-5 w-5" /> Add New Skill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Skill</DialogTitle>
              <DialogDescription>
                Enter the details for the new skill.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="newSkillName"
                placeholder="Skill Name (e.g., React, Python)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="col-span-3"
              />
              <Textarea
                id="newSkillDescription"
                placeholder="Skill Description (optional)"
                value={newSkillDescription}
                onChange={(e) => setNewSkillDescription(e.target.value)}
                className="col-span-3"
              />
              <Select onValueChange={(value) => setNewSkillLevel(value as SkillLevel)} value={newSkillLevel}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Skill Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Elementary">Elementary</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
              <Button onClick={handleAddSkill} className="bg-green-500 hover:bg-green-600 text-white">Add Skill</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {actionError && (
        <Alert variant="destructive" className="mb-4">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Action Failed</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}
      {actionSuccess && (
        <Alert variant="default" className="mb-4 bg-green-100 border-green-400 text-green-700">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}

      {skills.length === 0 && !loading && (
        <p className="text-center text-gray-500 text-lg">No skills found. Click "Add New Skill" to create one.</p>
      )}

      {skills.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skills.map((skill) => (
              <TableRow key={skill.skillID}>
                <TableCell className="font-medium">{skill.skillName}</TableCell>
                <TableCell>{skill.Description || 'N/A'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditModal(skill)} className="mr-2">
                    <Edit3 className="h-4 w-4 text-blue-500" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => openDeleteModal(skill.skillID)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Edit Skill Modal */}
      {editingSkill && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Skill</DialogTitle>
              <DialogDescription>
                Update the details for the skill: {editingSkill.skillName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="editSkillName"
                placeholder="Skill Name"
                value={editingSkill.skillName}
                onChange={(e) => setEditingSkill({ ...editingSkill, skillName: e.target.value })}
                className="col-span-3"
              />
              <Textarea
                id="editSkillDescription"
                placeholder="Skill Description (optional)"
                value={editingSkill.Description || ''}
                onChange={(e) => setEditingSkill({ ...editingSkill, Description: e.target.value })}
                className="col-span-3"
              />
              <Select onValueChange={(value) => setEditingSkill({ ...editingSkill, SkillLevel: value as SkillLevel })} value={editingSkill.SkillLevel || ''}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select Skill Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Elementary">Elementary</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingSkill(null); }}>Cancel</Button>
              <Button onClick={handleEditSkill} className="bg-blue-500 hover:bg-blue-600 text-white">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Skill Confirmation Modal */}
      {deletingSkillId && (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this skill? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsDeleteModalOpen(false); setDeletingSkillId(null); }}>Cancel</Button>
              <Button onClick={handleDeleteSkill} variant="destructive">Delete Skill</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManageSkillsPage;

