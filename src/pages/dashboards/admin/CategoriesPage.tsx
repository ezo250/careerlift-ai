import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await api.getJobCategories();
      setCategories(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateJobCategory(editingId, formData);
        toast.success('Category updated');
      } else {
        await api.createJobCategory(formData);
        toast.success('Category created');
      }
      setFormData({ name: '', description: '' });
      setShowCreate(false);
      setEditingId(null);
      loadData();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEdit = (category: any) => {
    setFormData({ name: category.name, description: category.description || '' });
    setEditingId(category._id);
    setShowCreate(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.deleteJobCategory(id);
      toast.success('Category deleted');
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
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">Job Categories</h1>
          <p className="text-muted-foreground mt-1">Manage job categories for organization</p>
        </div>
        <Button onClick={() => { setShowCreate(!showCreate); setEditingId(null); setFormData({ name: '', description: '' }); }} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Create Category
        </Button>
      </div>

      {showCreate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass-card-elevated p-6"
        >
          <h3 className="font-display font-semibold text-foreground mb-4">{editingId ? 'Edit' : 'Create'} Category</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Category Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="kepler-input"
                placeholder="e.g., Software Development"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Description (Optional)</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="kepler-input"
                placeholder="Brief description"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="bg-primary text-primary-foreground">
                {editingId ? 'Update' : 'Create'} Category
              </Button>
              <Button type="button" variant="outline" onClick={() => { setShowCreate(false); setEditingId(null); setFormData({ name: '', description: '' }); }}>
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, idx) => (
          <motion.div
            key={category._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="glass-card-elevated p-6"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">{category.name}</h3>
                  {category.description && (
                    <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(category._id)}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No categories yet. Create your first category above.</p>
        </div>
      )}
    </div>
  );
}
