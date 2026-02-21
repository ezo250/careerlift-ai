import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Send, Copy, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [invites, setInvites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [showManualAdd, setShowManualAdd] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [manualData, setManualData] = useState({ name: '', email: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersData, invitesData] = await Promise.all([
        api.request('/users'),
        api.getInvites()
      ]);
      setTeachers(usersData.filter((u: any) => u.role === 'teacher'));
      setInvites(invitesData);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvites = async (e: React.FormEvent) => {
    e.preventDefault();
    const emails = inviteEmails.split('\n').map(e => e.trim()).filter(Boolean);
    
    if (emails.length === 0) {
      toast.error('Please enter at least one email');
      return;
    }

    try {
      const result = await api.createInvites(emails);
      toast.success(`Invites sent to ${emails.length} email(s)`);
      setInviteEmails('');
      setShowInvite(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.request('/users/manual-teacher', {
        method: 'POST',
        body: JSON.stringify(manualData)
      });
      toast.success('Teacher added successfully with password: 123');
      setManualData({ name: '', email: '' });
      setShowManualAdd(false);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied to clipboard');
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
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Teachers Management</h1>
          <p className="text-muted-foreground mt-1">Invite teachers or add them manually</p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowManualAdd(!showManualAdd)}
            variant="outline"
            className="border-border"
          >
            <UserPlus className="w-4 h-4 mr-2" /> Add Manually
          </Button>
          <Button
            onClick={() => setShowInvite(!showInvite)}
            className="bg-primary text-primary-foreground"
          >
            <Mail className="w-4 h-4 mr-2" /> Send Invites
          </Button>
        </div>
      </div>

      {/* Manual add form */}
      {showManualAdd && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card-elevated p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Add Teacher Manually</h3>
          <p className="text-sm text-muted-foreground mb-4">
            The teacher will be created with default password: <span className="font-mono font-bold text-foreground">123</span>
            <br />
            They can change it after first login.
          </p>
          <form onSubmit={handleManualAdd} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <input
                  type="text"
                  value={manualData.name}
                  onChange={e => setManualData({ ...manualData, name: e.target.value })}
                  className="kepler-input"
                  placeholder="John Doe"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <input
                  type="email"
                  value={manualData.email}
                  onChange={e => setManualData({ ...manualData, email: e.target.value })}
                  className="kepler-input"
                  placeholder="teacher@kepler.edu"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="bg-primary text-primary-foreground">
                Add Teacher
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowManualAdd(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Invite form */}
      {showInvite && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card-elevated p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Send Teacher Invites</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Enter teacher emails (one per line). Each will receive an invite code via email.
          </p>
          <form onSubmit={handleSendInvites} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Addresses</label>
              <textarea
                value={inviteEmails}
                onChange={e => setInviteEmails(e.target.value)}
                className="kepler-input font-mono text-sm"
                rows={5}
                placeholder="teacher1@kepler.edu&#10;teacher2@kepler.edu&#10;teacher3@kepler.edu"
                required
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="bg-primary text-primary-foreground">
                <Send className="w-4 h-4 mr-2" /> Send Invites
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Teachers list */}
      <div className="glass-card-elevated p-6">
        <h3 className="font-display font-semibold text-foreground mb-4">Active Teachers ({teachers.length})</h3>
        <div className="space-y-3">
          {teachers.map(teacher => (
            <div key={teacher._id} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary font-semibold">
                  {teacher.name.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{teacher.name}</p>
                  <p className="text-xs text-muted-foreground">{teacher.email}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-3">
                <p className="text-xs text-muted-foreground mr-4">
                  {teacher.assignedSections?.length || 0} section(s) assigned
                </p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    const newName = window.prompt('Edit teacher name', teacher.name);
                    if (!newName) return;
                    try {
                      await api.request(`/users/${teacher._id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ name: newName })
                      });
                      toast.success('Teacher updated');
                      loadData();
                    } catch (err: any) {
                      toast.error(err.message || 'Update failed');
                    }
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    if (!window.confirm('Delete this teacher? This action cannot be undone.')) return;
                    try {
                      await api.request(`/users/${teacher._id}`, {
                        method: 'DELETE'
                      });
                      toast.success('Teacher deleted');
                      loadData();
                    } catch (err: any) {
                      toast.error(err.message || 'Delete failed');
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {teachers.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No teachers yet</p>
          )}
        </div>
      </div>

      {/* Invites list */}
      <div className="glass-card-elevated p-6">
        <h3 className="font-display font-semibold text-foreground mb-4">Recent Invites</h3>
        <div className="space-y-2">
          {invites.slice(0, 10).map(invite => (
            <div
              key={invite._id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
            >
              <div>
                <p className="text-sm font-medium text-foreground">{invite.email}</p>
                <p className="text-xs text-muted-foreground font-mono">{invite.code}</p>
              </div>
                <div className="flex items-center gap-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  invite.status === 'accepted'
                    ? 'bg-secondary/10 text-secondary flex items-center gap-1'
                    : 'bg-kepler-gold/10 text-kepler-gold flex items-center gap-1'
                }`}>
                  {invite.status === 'accepted' ? (
                    <><CheckCircle className="w-3 h-3" /> Accepted</>
                  ) : (
                    <><XCircle className="w-3 h-3" /> Pending</>
                  )}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyCode(invite.code)}
                  className="text-primary hover:bg-primary/10"
                >
                  <Copy className="w-3 h-3 mr-1" /> Copy
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    const newEmail = window.prompt('Edit invite email', invite.email);
                    if (!newEmail) return;
                    try {
                      await api.request(`/invites/${invite._id}`, {
                        method: 'PATCH',
                        body: JSON.stringify({ email: newEmail })
                      });
                      toast.success('Invite updated');
                      loadData();
                    } catch (err: any) {
                      toast.error(err.message || 'Update failed');
                    }
                  }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    if (!window.confirm('Delete this invite?')) return;
                    try {
                      await api.request(`/invites/${invite._id}`, { method: 'DELETE' });
                      toast.success('Invite deleted');
                      loadData();
                    } catch (err: any) {
                      toast.error(err.message || 'Delete failed');
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {invites.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No invites sent yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
