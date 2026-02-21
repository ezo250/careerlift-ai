import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, ClipboardList, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    criteria: [{ name: '', weight: 10, description: '' }]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getChecklists();
      setChecklists(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const addCriterion = () => {
    setFormData({
      ...formData,
      criteria: [...formData.criteria, { name: '', weight: 10, description: '' }]
    });
  };

  const removeCriterion = (index: number) => {
    setFormData({
      ...formData,
      criteria: formData.criteria.filter((_, i) => i !== index)
    });
  };

  const updateCriterion = (index: number, field: string, value: any) => {
    const updated = [...formData.criteria];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, criteria: updated });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate total weight is 100
    const totalWeight = formData.criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
    if (totalWeight !== 100) {
      toast.error(`Total weight must be 100% (currently ${totalWeight}%)`);
      return;
    }

    try {
      await api.createChecklist(formData);
      toast.success('Checklist created successfully');
      setFormData({
        name: '',
        criteria: [{ name: '', weight: 10, description: '' }]
      });
      setShowCreate(false);
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

  const totalWeight = formData.criteria.reduce((sum, c) => sum + (c.weight || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Grading Checklists</h1>
          <p className="text-muted-foreground mt-1">Manage criteria for AI grading</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Create Checklist
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card-elevated p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">Create New Checklist</h3>
          <form onSubmit={handleCreate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Checklist Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="kepler-input"
                placeholder="e.g., Standard Resume & Cover Letter Checklist"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-foreground">
                  Grading Criteria (Total: {totalWeight}%)
                </label>
                <Button type="button" size="sm" onClick={addCriterion} variant="outline">
                  <Plus className="w-3 h-3 mr-1" /> Add Criterion
                </Button>
              </div>

              {totalWeight !== 100 && (
                <p className="text-xs text-destructive mb-3">
                  ⚠️ Total weight must equal 100%
                </p>
              )}

              <div className="space-y-4">
                {formData.criteria.map((criterion, index) => (
                  <div key={index} className="p-4 rounded-lg border border-border bg-muted/20">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                          <div>
                            <input
                              type="text"
                              value={criterion.name}
                              onChange={e => updateCriterion(index, 'name', e.target.value)}
                              className="kepler-input text-sm"
                              placeholder="Criterion name"
                              required
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min="1"
                                max="100"
                                value={criterion.weight}
                                onChange={e => updateCriterion(index, 'weight', parseInt(e.target.value) || 0)}
                                className="kepler-input text-sm"
                                placeholder="Weight"
                                required
                              />
                              <span className="text-sm text-muted-foreground">%</span>
                            </div>
                          </div>
                        </div>
                        <textarea
                          value={criterion.description}
                          onChange={e => updateCriterion(index, 'description', e.target.value)}
                          className="kepler-input text-sm"
                          rows={2}
                          placeholder="Description of this criterion..."
                          required
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCriterion(index)}
                        className="text-destructive hover:bg-destructive/10"
                        disabled={formData.criteria.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="bg-primary text-primary-foreground" disabled={totalWeight !== 100}>
                Create Checklist
              </Button>
              <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Checklists list */}
      <div className="space-y-6">
        {checklists.map(checklist => (
          <motion.div
            key={checklist._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-elevated p-6"
          >
            <h3 className="font-display text-lg font-semibold text-foreground mb-4">{checklist.name}</h3>
            <div className="space-y-3">
              {checklist.criteria.map((criterion: any, index: number) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-primary">{criterion.weight}%</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground mb-1">{criterion.name}</h4>
                    <p className="text-xs text-muted-foreground">{criterion.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {checklists.length === 0 && !loading && (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No checklists yet. Create your first checklist above.</p>
        </div>
      )}
    </div>
  );
}
