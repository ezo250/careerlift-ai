import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, ClipboardList, Trash2, Upload, FileText, Edit3, 
  Sparkles, Loader2, CheckCircle, AlertCircle 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { extractTextFromFile } from '@/lib/puterAI';

type InputMethod = 'manual' | 'paste' | 'upload';

export default function ChecklistsPage() {
  const [checklists, setChecklists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [inputMethod, setInputMethod] = useState<InputMethod>('manual');
  const [pastedText, setPastedText] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
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

  const parseChecklistWithAI = async (text: string) => {
    if (!window.puter) {
      toast.error('AI service not available');
      return null;
    }

    setParsing(true);
    try {
      const prompt = `You are an expert at analyzing grading checklists and rubrics. Extract grading criteria from the following text.

TEXT TO ANALYZE:
${text}

REQUIREMENTS:
1. Identify all grading criteria/categories
2. Extract the weight/percentage for each (if not specified, distribute evenly to total 100%)
3. Extract the description/what to evaluate for each criterion
4. Ensure total weight = 100%
5. Use clear, professional criterion names

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "name": "Suggested checklist name based on content",
  "criteria": [
    {
      "name": "Criterion name",
      "weight": numeric_percentage,
      "description": "What to evaluate for this criterion"
    }
  ]
}

EXAMPLE OUTPUT:
{
  "name": "Resume & Cover Letter Evaluation",
  "criteria": [
    {"name": "Formatting & Presentation", "weight": 20, "description": "Professional layout, consistent fonts, proper spacing"},
    {"name": "Content Relevance", "weight": 30, "description": "Alignment with job requirements, key skills highlighted"},
    {"name": "Achievement Quantification", "weight": 25, "description": "Measurable results, specific numbers and percentages"},
    {"name": "Grammar & Writing Quality", "weight": 15, "description": "No errors, clear communication, strong action verbs"},
    {"name": "ATS Optimization", "weight": 10, "description": "Keywords, standard sections, machine-readable format"}
  ]
}`;

      const response = await window.puter.ai.chat(prompt, {
        model: 'gpt-5.2-chat',
        temperature: 0.2,
        max_tokens: 2000
      });

      // Parse the AI response
      let cleanedResponse = response.trim()
        .replace(/```json\n?/gi, '')
        .replace(/```\n?/g, '')
        .trim();

      const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
      const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(cleanedResponse);

      // Validate
      if (!parsed.criteria || !Array.isArray(parsed.criteria)) {
        throw new Error('Invalid AI response structure');
      }

      // Ensure total weight is 100%
      const totalWeight = parsed.criteria.reduce((sum: number, c: any) => sum + (c.weight || 0), 0);
      if (totalWeight !== 100) {
        // Normalize to 100%
        const factor = 100 / totalWeight;
        parsed.criteria = parsed.criteria.map((c: any) => ({
          ...c,
          weight: Math.round(c.weight * factor)
        }));

        // Adjust last item if rounding caused total != 100
        const newTotal = parsed.criteria.reduce((sum: number, c: any) => sum + c.weight, 0);
        if (newTotal !== 100) {
          parsed.criteria[parsed.criteria.length - 1].weight += (100 - newTotal);
        }
      }

      return parsed;
    } catch (error: any) {
      console.error('AI parsing error:', error);
      toast.error('Failed to parse checklist. Please try manual entry.');
      return null;
    } finally {
      setParsing(false);
    }
  };

  const handlePasteAnalysis = async () => {
    if (!pastedText.trim()) {
      toast.error('Please paste some text first');
      return;
    }

    const parsed = await parseChecklistWithAI(pastedText);
    if (parsed) {
      setFormData({
        name: parsed.name,
        criteria: parsed.criteria
      });
      toast.success('✨ AI successfully extracted criteria from your text!');
      setInputMethod('manual'); // Switch to manual to show the extracted criteria
    }
  };

  const handleFileUpload = async (file: File) => {
    setUploadedFile(file);
    
    try {
      const text = await extractTextFromFile(file);
      const parsed = await parseChecklistWithAI(text);
      
      if (parsed) {
        setFormData({
          name: parsed.name || `Checklist from ${file.name}`,
          criteria: parsed.criteria
        });
        toast.success(`✨ AI successfully extracted criteria from ${file.name}!`);
        setInputMethod('manual'); // Switch to manual to show the extracted criteria
      }
    } catch (error: any) {
      toast.error(`Failed to process file: ${error.message}`);
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
      setPastedText('');
      setUploadedFile(null);
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
          <p className="text-muted-foreground mt-1">Create and manage criteria for AI-powered grading</p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-primary text-primary-foreground">
          <Plus className="w-4 h-4 mr-2" /> Create Checklist
        </Button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-card-elevated p-6"
          >
            <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Create New Checklist
            </h3>

            {/* Input Method Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-foreground mb-3">Choose Input Method:</label>
              <div className="grid md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setInputMethod('manual')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    inputMethod === 'manual'
                      ? 'border-primary bg-primary/5 shadow-lg'
                      : 'border-border hover:border-primary/50 hover:bg-muted/30'
                  }`}
                >
                  <Edit3 className={`w-6 h-6 mx-auto mb-2 ${inputMethod === 'manual' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div className="text-sm font-semibold text-foreground">Manual Entry</div>
                  <div className="text-xs text-muted-foreground mt-1">Add criteria manually</div>
                </button>

                <button
                  type="button"
                  onClick={() => setInputMethod('paste')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    inputMethod === 'paste'
                      ? 'border-secondary bg-secondary/5 shadow-lg'
                      : 'border-border hover:border-secondary/50 hover:bg-muted/30'
                  }`}
                >
                  <FileText className={`w-6 h-6 mx-auto mb-2 ${inputMethod === 'paste' ? 'text-secondary' : 'text-muted-foreground'}`} />
                  <div className="text-sm font-semibold text-foreground">Paste Text</div>
                  <div className="text-xs text-muted-foreground mt-1">AI extracts criteria</div>
                </button>

                <button
                  type="button"
                  onClick={() => setInputMethod('upload')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    inputMethod === 'upload'
                      ? 'border-kepler-gold bg-kepler-gold/5 shadow-lg'
                      : 'border-border hover:border-kepler-gold/50 hover:bg-muted/30'
                  }`}
                >
                  <Upload className={`w-6 h-6 mx-auto mb-2 ${inputMethod === 'upload' ? 'text-kepler-gold' : 'text-muted-foreground'}`} />
                  <div className="text-sm font-semibold text-foreground">Upload Document</div>
                  <div className="text-xs text-muted-foreground mt-1">AI parses file</div>
                </button>
              </div>
            </div>

            {/* Paste Text Input */}
            {inputMethod === 'paste' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="p-4 rounded-lg bg-secondary/5 border border-secondary/20 mb-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-secondary mt-0.5" />
                    <div className="text-sm text-foreground">
                      <p className="font-semibold mb-1">AI-Powered Extraction</p>
                      <p className="text-muted-foreground">Paste your checklist, rubric, or grading criteria. Our AI will automatically extract and structure the criteria for you.</p>
                    </div>
                  </div>
                </div>

                <label className="block text-sm font-medium text-foreground mb-2">Paste Your Checklist:</label>
                <textarea
                  value={pastedText}
                  onChange={e => setPastedText(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-secondary focus:border-secondary transition-all outline-none font-mono text-sm"
                  rows={12}
                  placeholder={`Example:

Resume Grading Rubric

1. Formatting & Layout (20%)
   - Professional appearance
   - Consistent formatting
   - Proper use of white space

2. Content Quality (30%)
   - Relevant to job description
   - Clear accomplishments
   - Strong action verbs

3. Skills Match (25%)
   - Technical skills listed
   - Matches job requirements
   - Certifications included

4. Grammar & Writing (15%)
   - No spelling errors
   - Professional tone
   - Clear communication

5. ATS Compatibility (10%)
   - Standard sections
   - Keyword optimization
   - Machine-readable format`}
                />

                <Button
                  type="button"
                  onClick={handlePasteAnalysis}
                  disabled={!pastedText.trim() || parsing}
                  className="mt-4 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  {parsing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      AI is analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Extract Criteria with AI
                    </>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Upload Document */}
            {inputMethod === 'upload' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <div className="p-4 rounded-lg bg-kepler-gold/5 border border-kepler-gold/20 mb-4">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-kepler-gold mt-0.5" />
                    <div className="text-sm text-foreground">
                      <p className="font-semibold mb-1">Document Upload</p>
                      <p className="text-muted-foreground">Upload a PDF or TXT file containing your checklist. AI will parse and extract the grading criteria.</p>
                    </div>
                  </div>
                </div>

                <label className="block text-sm font-medium text-foreground mb-2">Upload Checklist Document:</label>
                <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-kepler-gold/50 transition-all bg-muted/20">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-foreground font-medium mb-1">
                    {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">PDF, TXT, or DOCX files</p>
                  <input
                    type="file"
                    accept=".pdf,.txt,.doc,.docx"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFileUpload(file);
                    }}
                    className="block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-kepler-gold file:text-white hover:file:bg-kepler-gold/90 file:cursor-pointer"
                    disabled={parsing}
                  />
                  {parsing && (
                    <div className="mt-4 flex items-center justify-center gap-2 text-sm text-kepler-gold">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      AI is processing your document...
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Manual Entry Form */}
            {inputMethod === 'manual' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
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
                        Grading Criteria 
                        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                          totalWeight === 100 
                            ? 'bg-secondary/10 text-secondary' 
                            : 'bg-destructive/10 text-destructive'
                        }`}>
                          {totalWeight === 100 ? (
                            <><CheckCircle className="w-3 h-3 inline mr-1" />Total: {totalWeight}%</>
                          ) : (
                            <><AlertCircle className="w-3 h-3 inline mr-1" />Total: {totalWeight}%</>
                          )}
                        </span>
                      </label>
                      <Button type="button" size="sm" onClick={addCriterion} variant="outline">
                        <Plus className="w-3 h-3 mr-1" /> Add Criterion
                      </Button>
                    </div>

                    {totalWeight !== 100 && (
                      <p className="text-xs text-destructive mb-3 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        Total weight must equal 100% to create checklist
                      </p>
                    )}

                    <div className="space-y-4">
                      {formData.criteria.map((criterion, index) => (
                        <div key={index} className="p-4 rounded-lg border-2 border-border bg-muted/20 hover:border-primary/30 transition-all">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                              #{index + 1}
                            </div>
                            <div className="flex-1 space-y-3">
                              <div className="grid md:grid-cols-2 gap-3">
                                <div>
                                  <input
                                    type="text"
                                    value={criterion.name}
                                    onChange={e => updateCriterion(index, 'name', e.target.value)}
                                    className="kepler-input text-sm"
                                    placeholder="Criterion name (e.g., Formatting & Layout)"
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
                                    <span className="text-sm text-muted-foreground font-semibold">%</span>
                                  </div>
                                </div>
                              </div>
                              <textarea
                                value={criterion.description}
                                onChange={e => updateCriterion(index, 'description', e.target.value)}
                                className="kepler-input text-sm"
                                rows={2}
                                placeholder="Description of what to evaluate for this criterion..."
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
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Create Checklist
                    </Button>
                    <Button type="button" variant="outline" onClick={() => {
                      setShowCreate(false);
                      setPastedText('');
                      setUploadedFile(null);
                    }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Checklists list */}
      <div className="space-y-6">
        {checklists.map(checklist => (
          <motion.div
            key={checklist._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-elevated p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-primary" />
                {checklist.name}
              </h3>
              <div className="text-xs text-muted-foreground">
                {checklist.criteria?.length || 0} criteria
              </div>
            </div>
            <div className="space-y-3">
              {checklist.criteria?.map((criterion: any, index: number) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/20 transition-all">
                  <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
                    <span className="text-lg font-bold text-white">{criterion.weight}%</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-foreground mb-1">{criterion.name}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{criterion.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {checklists.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-display text-lg font-semibold text-foreground mb-2">No checklists yet</h3>
          <p className="text-sm text-muted-foreground mb-4">Create your first grading checklist to start evaluating submissions</p>
          <Button onClick={() => setShowCreate(true)} className="bg-primary text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" /> Create Your First Checklist
          </Button>
        </div>
      )}
    </div>
  );
}
