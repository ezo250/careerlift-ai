import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Briefcase, Calendar, Users, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function JobsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewJob, setViewJob] = useState<any>(null);
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
                <Select
                  value={formData.sectionId}
                  onValueChange={(value) => setFormData({ ...formData, sectionId: value })}
                  required
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select section..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {sections.map(s => (
                      <SelectItem key={s._id} value={s._id} className="cursor-pointer hover:bg-primary/10">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Checklist</label>
                <Select
                  value={formData.checklistId}
                  onValueChange={(value) => setFormData({ ...formData, checklistId: value })}
                  required
                >
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue placeholder="Select checklist..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {checklists.map(c => (
                      <SelectItem key={c._id} value={c._id} className="cursor-pointer hover:bg-primary/10">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  onClick={() => setViewJob(job)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-1" /> View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toggleStatus(job)}
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

      {/* View Job Modal */}
      {viewJob && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 backdrop-blur-sm p-4"
          onClick={() => setViewJob(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-card rounded-xl p-6 max-w-2xl w-full border border-border shadow-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-2xl font-bold text-foreground">{viewJob.title}</h3>
                <p className="text-muted-foreground">{viewJob.company}</p>
              </div>
              <button
                onClick={() => setViewJob(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Status</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  viewJob.status === 'active' 
                    ? 'bg-secondary/10 text-secondary' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {viewJob.status}
                </span>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Job Description</h4>
                <p className="text-muted-foreground whitespace-pre-wrap">{viewJob.description}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Section</h4>
                  <p className="text-muted-foreground">
                    {sections.find(s => s._id === viewJob.sectionId?._id || s._id === viewJob.sectionId)?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Deadline</h4>
                  <p className="text-muted-foreground">{new Date(viewJob.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Max Submissions</h4>
                  <p className="text-muted-foreground">{viewJob.maxSubmissions} per student</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Checklist</h4>
                  <p className="text-muted-foreground">
                    {checklists.find(c => c._id === viewJob.checklistId?._id || c._id === viewJob.checklistId)?.name || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-foreground mb-2">Created</h4>
                <p className="text-muted-foreground">{new Date(viewJob.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button
                onClick={() => toggleStatus(viewJob)}
                variant="outline"
                className="flex-1"
              >
                {viewJob.status === 'active' ? 'Close Job' : 'Activate Job'}
              </Button>
              <Button onClick={() => setViewJob(null)} className="flex-1">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
