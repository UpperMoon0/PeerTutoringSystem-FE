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
      <div className="flex justify-center items-center h-64 bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-2 text-lg text-muted-foreground">Loading skills...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-4 bg-destructive/10 text-destructive border-destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-background text-foreground">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Manage Skills</h1>
        <Button onClick={() => {
          setIsAddModalOpen(true);
          setActionError(null);
          setActionSuccess(null);
          setNewSkillName('');
          setNewSkillDescription('');
          setNewSkillLevel('');
        }} className="bg-gradient-to-r from-primary to-ring hover:from-primary/90 hover:to-ring/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Skill
        </Button>
      </div>

      {actionError && (
        <Alert variant="destructive" className="mb-4 bg-destructive/10 text-destructive border-destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Action Failed</AlertTitle>
          <AlertDescription>{actionError}</AlertDescription>
        </Alert>
      )}
      {actionSuccess && (
        <Alert variant="default" className="mb-4 bg-primary/10 border-primary text-primary">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{actionSuccess}</AlertDescription>
        </Alert>
      )}

      {skills.length === 0 && !loading && (
        <p className="text-center text-muted-foreground text-lg">No skills found. Click "Add New Skill" to create one.</p>
      )}

      {skills.length > 0 && (
        <div className="bg-card border border-border shadow-lg rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead className="bg-card">
              <tr>
                <th className="px-5 py-3 border-b-2 border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Name
                </th>
                <th className="px-5 py-3 border-b-2 border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Description
                </th>
                <th className="px-5 py-3 border-b-2 border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Skill Level
                </th>
                <th className="px-5 py-3 border-b-2 border-border text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="text-foreground">
              {skills.map((skill) => (
                <tr key={skill.skillID} className="hover:bg-muted/50">
                  <td className="px-5 py-4 border-b border-border bg-card text-sm">
                    <p className="text-foreground whitespace-no-wrap">{skill.skillName}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-border bg-card text-sm">
                    <p className="text-foreground whitespace-no-wrap">{skill.description || 'N/A'}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-border bg-card text-sm">
                    <p className="text-foreground whitespace-no-wrap">{skill.skillLevel}</p>
                  </td>
                  <td className="px-5 py-4 border-b border-border bg-card text-sm">
                    <button
                      onClick={() => openEditModal(skill)}
                      className="text-primary hover:text-primary-foreground mr-3 transition duration-150 ease-in-out"
                      aria-label="Edit skill"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => openDeleteModal(skill.skillID)}
                      className="text-destructive hover:text-destructive-foreground transition duration-150 ease-in-out"
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
          <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-foreground">Add New Skill</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Enter the details for the new skill.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="newSkillName"
                placeholder="Skill Name (e.g., React, Python)"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                className="col-span-3 bg-input text-foreground border-border placeholder:text-muted-foreground"
              />
              <Textarea
                id="newSkillDescription"
                placeholder="Skill Description (optional)"
                value={newSkillDescription}
                onChange={(e) => setNewSkillDescription(e.target.value)}
                className="col-span-3 bg-input text-foreground border-border placeholder:text-muted-foreground"
              />
              <Select onValueChange={(value) => setNewSkillLevel(value as SkillLevel)} value={newSkillLevel}>
                <SelectTrigger className="col-span-3 bg-input text-foreground border-border">
                  <SelectValue placeholder="Select Skill Level" />
                </SelectTrigger>
                <SelectContent className="bg-input text-foreground border-border">
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Elementary">Elementary</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-border hover:bg-muted hover:text-muted-foreground">Cancel</Button>
              <Button onClick={handleAddSkill} className="bg-gradient-to-r from-primary to-ring hover:from-primary/90 hover:to-ring/90 text-primary-foreground">Add Skill</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Skill Modal */}
      {editingSkill && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-foreground">Edit Skill</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Update the details for the skill: {editingSkill.skillName}.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Input
                id="editSkillName"
                placeholder="Skill Name"
                value={editingSkill.skillName}
                onChange={(e) => setEditingSkill({ ...editingSkill, skillName: e.target.value })}
                className="col-span-3 bg-input text-foreground border-border placeholder:text-muted-foreground"
              />
              <Textarea
                id="editSkillDescription"
                placeholder="Skill Description (optional)"
                value={editingSkill.description || ''}
                onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                className="col-span-3 bg-input text-foreground border-border placeholder:text-muted-foreground"
              />
              <Select onValueChange={(value) => setEditingSkill({ ...editingSkill, skillLevel: value as SkillLevel })} value={editingSkill.skillLevel || ''}>
                <SelectTrigger className="col-span-3 bg-input text-foreground border-border">
                  <SelectValue placeholder="Select Skill Level" />
                </SelectTrigger>
                <SelectContent className="bg-input text-foreground border-border">
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Elementary">Elementary</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                  <SelectItem value="Expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditModalOpen(false); setEditingSkill(null); }} className="border-border hover:bg-muted hover:text-muted-foreground">Cancel</Button>
              <Button onClick={handleEditSkill} className="bg-gradient-to-r from-primary to-ring hover:from-primary/90 hover:to-ring/90 text-primary-foreground">Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Skill Confirmation Modal */}
      {deletingSkillId && (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="sm:max-w-[425px] bg-card border-border text-foreground">
            <DialogHeader>
              <DialogTitle className="text-foreground">Confirm Deletion</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Are you sure you want to delete this skill? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsDeleteModalOpen(false); setDeletingSkillId(null); }} className="border-border hover:bg-muted hover:text-muted-foreground">Cancel</Button>
              <Button onClick={handleDeleteSkill} variant="destructive" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Delete Skill</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default ManageSkillsSection;