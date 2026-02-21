import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Calendar, Users, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    sectionId: '',
    maxSubmissions: 2,
    checklistId: '',
    deadline: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [jobsData, sectionsData, checklistsData] = await Promise.all([
        api.getJobs(),
        api.getSections(),
        api.getChecklists()
      ]);
      setJobs(jobsData);
      setSections(sectionsData);
      setChecklists(checklistsData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createJob(formData);
      toast.success('Job created successfully');
      setFormData({
        title: '',
        company: '',
        description: '',
        sectionId: '',
        maxSubmissions: 2,
        checklistId: '',
        deadline: ''
      });
      setShowCreate(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const toggleStatus = async (job: any) => {
    try {
      await api.updateJob(job._id, { status: job.status === 'active' ? 'closed' : 'active' });
      toast.success(`Job ${job.status === 'active' ? 'closed' : 'activated'}`);
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
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Job Submissions Management</h1>
          <p className="text-muted-foreground mt-1">Create and manage job opportunities for students</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Create Job
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card-elevated p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Create New Job Opportunity</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Job Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="kepler-input"
                  placeholder="e.g., Junior Software Developer"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Company</label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={e => setFormData({ ...formData, company: e.target.value })}
                  className="kepler-input"
                  placeholder="e.g., TechRwanda Ltd."
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Job Description</label>
              <textarea
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="kepler-input"
                rows={4}
                placeholder="Describe the job requirements, responsibilities, and qualifications..."
                required
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Section</label>
                <select
                  value={formData.sectionId}
                  onChange={e => setFormData({ ...formData, sectionId: e.target.value })}
                  className="kepler-input"
                  required
                >
                  <option value="">Select section...</option>
                  {sections.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Checklist</label>
                <select
                  value={formData.checklistId}
                  onChange={e => setFormData({ ...formData, checklistId: e.target.value })}
                  className="kepler-input"
                  required
                >
                  <option value="">Select checklist...</option>
                  {checklists.map(c => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Max Submissions</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={formData.maxSubmissions}
                  onChange={e => setFormData({ ...formData, maxSubmissions: parseInt(e.target.value) })}
                  className="kepler-input"
                  required
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  className="kepler-input"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="bg-primary text-primary-foreground">
                Create Job
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Jobs list */}
      <div className="grid md:grid-cols-2 gap-6">
        {jobs.map(job => {
          const section = sections.find(s => s._id === job.sectionId?._id || s._id === job.sectionId);
          
          return (
            <motion.div
              key={job._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card-elevated p-6"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-display text-lg font-semibold text-foreground">{job.title}</h3>
                  <p className="text-sm text-muted-foreground">{job.company}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  job.status === 'active' 
                    ? 'bg-secondary/10 text-secondary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {job.status}
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{job.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>Section: {section?.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  <span>Max Submissions: {job.maxSubmissions}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleStatus(job)}
                  className="flex-1"
                >
                  {job.status === 'active' ? 'Close' : 'Activate'}
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {jobs.length === 0 && !loading && (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No jobs yet. Create your first job opportunity above.</p>
        </div>
      )}
    </div>
  );
}
