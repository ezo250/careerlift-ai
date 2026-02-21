import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, UserPlus, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function SectionsPage() {
  const [sections, setSections] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({ name: '', code: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [sectionsData, usersData] = await Promise.all([
        api.getSections(),
        api.request('/users')
      ]);
      setSections(sectionsData);
      setTeachers(usersData.filter((u: any) => u.role === 'teacher'));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createSection(formData);
      toast.success('Section created successfully');
      setFormData({ name: '', code: '', description: '' });
      setShowCreate(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleAssignTeacher = async (sectionId: string, teacherId: string) => {
    try {
      await api.assignTeacher(sectionId, teacherId);
      toast.success('Teacher assigned successfully');
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Sections Management</h1>
          <p className="text-muted-foreground mt-1">Manage student sections and assign teachers</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Create Section
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card-elevated p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Create New Section</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Section Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="kepler-input"
                  placeholder="e.g., KC 2026"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Section Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="kepler-input"
                  placeholder="e.g., KC2026"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="kepler-input"
                rows={3}
                placeholder="Brief description of this section"
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="bg-primary text-primary-foreground">
                Create Section
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Sections list */}
      <div className="grid md:grid-cols-2 gap-6">
        {sections.map(section => {
          const assignedTeachers = teachers.filter(t => 
            t.assignedSections?.some((s: any) => s._id === section._id || s === section._id)
          );
          
          return (
            <motion.div
              key={section._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-elevated p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{section.name}</h3>
                  <p className="text-sm text-muted-foreground">{section.code}</p>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{section.studentCount} students</span>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-4">{section.description}</p>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Assigned Teachers</p>
                  <div className="flex flex-wrap gap-2">
                    {assignedTeachers.map(teacher => (
                      <span
                        key={teacher._id}
                        className="px-3 py-1 rounded-full text-xs bg-secondary/10 text-secondary font-medium"
                      >
                        {teacher.name}
                      </span>
                    ))}
                    {assignedTeachers.length === 0 && (
                      <span className="text-xs text-muted-foreground italic">No teachers assigned</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-2">
                    Assign Teacher
                  </label>
                  <select
                    onChange={e => {
                      if (e.target.value) {
                        handleAssignTeacher(section._id, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="kepler-input text-sm"
                  >
                    <option value="">Select a teacher...</option>
                    {teachers
                      .filter(t => !assignedTeachers.some(at => at._id === t._id))
                      .map(teacher => (
                        <option key={teacher._id} value={teacher._id}>
                          {teacher.name} ({teacher.email})
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {sections.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No sections yet. Create your first section above.</p>
        </div>
      )}
    </div>
  );
}
