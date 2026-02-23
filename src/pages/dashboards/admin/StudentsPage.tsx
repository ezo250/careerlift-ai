import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Mail, GraduationCap, Edit, Trash2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export default function StudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState<string>('all');
  const [editStudent, setEditStudent] = useState<any>(null);
  const [deleteStudent, setDeleteStudent] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, sectionsData] = await Promise.all([
        api.getUsers(),
        api.getSections()
      ]);
      setStudents(usersData.filter((u: any) => u.role === 'student'));
      setSections(sectionsData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.updateUser(editStudent._id, {
        name: editStudent.name,
        email: editStudent.email,
        sectionId: editStudent.sectionId
      });
      toast.success('Student updated successfully');
      setEditStudent(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await api.deleteUser(deleteStudent._id);
      toast.success('Student deleted successfully');
      setDeleteStudent(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const filteredStudents = filterSection === 'all' 
    ? students 
    : students.filter(s => {
        const sectionId = s.sectionId?._id?.toString() || s.sectionId?.toString() || s.sectionId;
        return sectionId === filterSection;
      });

  const groupedBySection = sections.map(section => ({
    section,
    students: students.filter(s => {
      const sectionId = s.sectionId?._id?.toString() || s.sectionId?.toString() || s.sectionId;
      return sectionId === section._id;
    })
  }));

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
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1">View all students by section</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterSection} onValueChange={setFilterSection}>
            <SelectTrigger className="w-48 h-11 rounded-xl">
              <SelectValue placeholder="Filter by section" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="all">All Sections</SelectItem>
              {sections.map(s => (
                <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card-elevated p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-foreground">
            {filterSection === 'all' ? 'All Students' : sections.find(s => s._id === filterSection)?.name} 
            <span className="text-muted-foreground ml-2">({filteredStudents.length})</span>
          </h3>
        </div>

        <div className={`${filteredStudents.length > 4 ? 'max-h-[400px] overflow-y-auto' : ''}`}>
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card z-10 border-b border-border">
              <tr className="text-left">
                <th className="py-3 font-medium text-muted-foreground bg-card">Student</th>
                <th className="py-3 font-medium text-muted-foreground bg-card">Email</th>
                <th className="py-3 font-medium text-muted-foreground bg-card">Section</th>
                <th className="py-3 font-medium text-muted-foreground bg-card">Joined</th>
                <th className="py-3 font-medium text-muted-foreground bg-card">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const section = sections.find(s => s._id === (student.sectionId?._id || student.sectionId));
                return (
                  <tr key={student._id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                          {student.name.split(' ').map((n: string) => n[0]).join('')}
                        </div>
                        <span className="font-medium text-foreground">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{student.email}</td>
                    <td className="py-3">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-kepler-gold/10 text-kepler-gold">
                        {section?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditStudent(student)}
                          className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteStudent(student)}
                          className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredStudents.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No students found
            </div>
          )}
        </div>
      </motion.div>

      {filterSection === 'all' && (
        <div className="space-y-4 max-h-[800px] overflow-y-auto">
          <h3 className="font-display font-semibold text-foreground sticky top-0 bg-background py-2 z-10">Students by Section</h3>
          {groupedBySection.map(({ section, students: sectionStudents }) => (
            <motion.div
              key={section._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-elevated p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-kepler-gold" />
                  <h4 className="font-display font-semibold text-foreground">{section.name}</h4>
                  <span className="text-sm text-muted-foreground">({sectionStudents.length} students)</span>
                </div>
              </div>
              <div className={`grid md:grid-cols-2 lg:grid-cols-3 gap-3 ${sectionStudents.length > 6 ? 'max-h-[400px] overflow-y-auto' : ''}`}>
                {sectionStudents.map(student => (
                  <div key={student._id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                    <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-semibold">
                      {student.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{student.name}</p>
                      <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {student.email}
                      </p>
                    </div>
                  </div>
                ))}
                {sectionStudents.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full text-center py-4">
                    No students in this section
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editStudent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
          onClick={() => setEditStudent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-xl p-6 max-w-md w-full border border-border shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground">Edit Student</h3>
              <button onClick={() => setEditStudent(null)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Name</label>
                <input
                  type="text"
                  value={editStudent.name}
                  onChange={e => setEditStudent({ ...editStudent, name: e.target.value })}
                  className="kepler-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={editStudent.email}
                  onChange={e => setEditStudent({ ...editStudent, email: e.target.value })}
                  className="kepler-input"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Section</label>
                <Select
                  value={editStudent.sectionId?._id || editStudent.sectionId}
                  onValueChange={value => setEditStudent({ ...editStudent, sectionId: value })}
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {sections.map(s => (
                      <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="outline" onClick={() => setEditStudent(null)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}

      {/* Delete Modal */}
      {deleteStudent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
          onClick={() => setDeleteStudent(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-xl p-6 max-w-md w-full border border-destructive shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-destructive">Delete Student</h3>
              <button onClick={() => setDeleteStudent(null)} className="p-2 hover:bg-muted rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="mb-6">
              <p className="text-foreground mb-2">Are you sure you want to delete this student?</p>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="font-semibold text-foreground">{deleteStudent.name}</p>
                <p className="text-sm text-muted-foreground">{deleteStudent.email}</p>
              </div>
              <p className="text-sm text-destructive mt-3">This action cannot be undone.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setDeleteStudent(null)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleDelete} className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete Student
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
