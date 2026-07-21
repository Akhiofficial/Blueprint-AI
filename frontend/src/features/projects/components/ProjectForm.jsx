import { useState, useEffect } from 'react';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import ErrorMessage from '../../../components/ErrorMessage';

const CATEGORIES = ['Web App', 'Mobile', 'API', 'DevOps', 'AI / ML', 'Other'];

// Reusable form for both Create and Edit.
// Props: onSubmit, defaultValues, isLoading, error, submitLabel
const ProjectForm = ({ onSubmit, defaultValues = {}, isLoading, error, submitLabel = 'Save Project' }) => {
  const [form, setForm] = useState({
    title:       defaultValues.title       || '',
    description: defaultValues.description || '',
    category:    defaultValues.category    || '',
    techStack:   defaultValues.techStack   || [],
  });
  const [tagInput, setTagInput] = useState('');

  // Sync when defaultValues change (edit mode)
  useEffect(() => {
    if (defaultValues.title) {
      setForm({
        title:       defaultValues.title       || '',
        description: defaultValues.description || '',
        category:    defaultValues.category    || '',
        techStack:   defaultValues.techStack   || [],
      });
    }
  }, [defaultValues.title]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Tag chip logic
  const addTag = (value) => {
    const tag = value.trim().replace(/,+$/, '');
    if (tag && !form.techStack.includes(tag)) {
      setForm({ ...form, techStack: [...form.techStack, tag] });
    }
    setTagInput('');
  };

  const removeTag = (tag) =>
    setForm({ ...form, techStack: form.techStack.filter((t) => t !== tag) });

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
    if (e.key === 'Backspace' && !tagInput && form.techStack.length) {
      removeTag(form.techStack[form.techStack.length - 1]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form id="project-form" onSubmit={handleSubmit} className="space-y-5">
      <ErrorMessage message={error} />

      <Input
        id="title"
        label="Project title"
        placeholder="e.g. E-commerce Platform"
        value={form.title}
        onChange={handleChange}
        required
      />

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="description" className="text-sm font-medium text-slate-300">
          Idea description <span className="text-brand-400">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe your software idea in detail — what it does, who it's for, key features…"
          rows={4}
          required
          className="w-full rounded-xl bg-surface border border-surface-border px-4 py-2.5
                     text-sm text-slate-100 placeholder-slate-500 resize-none
                     focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500
                     hover:border-slate-500 transition-all duration-200"
        />
      </div>

      {/* Category */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="category" className="text-sm font-medium text-slate-300">Category</label>
        <select
          id="category"
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full rounded-xl bg-surface border border-surface-border px-4 py-2.5
                     text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500
                     focus:border-brand-500 hover:border-slate-500 transition-all duration-200"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Tech Stack — tag chip input */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-300">Tech stack</label>
        <div
          className="flex flex-wrap items-center gap-2 min-h-[46px] rounded-xl bg-surface
                     border border-surface-border px-3 py-2 hover:border-slate-500
                     focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500
                     transition-all duration-200"
        >
          {form.techStack.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-lg bg-brand-500/15 border border-brand-500/30
                         px-2 py-0.5 text-xs font-medium text-brand-300"
            >
              {tag}
              <button
                type="button"
                id={`remove-tag-${tag}`}
                onClick={() => removeTag(tag)}
                className="ml-0.5 text-brand-400/60 hover:text-red-400 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
          <input
            id="techStackInput"
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => tagInput && addTag(tagInput)}
            placeholder={form.techStack.length ? '' : 'React, Node.js, MongoDB… (Enter to add)'}
            className="flex-1 min-w-[140px] bg-transparent text-sm text-slate-100
                       placeholder-slate-500 focus:outline-none"
          />
        </div>
        <p className="text-xs text-slate-500">Press Enter or comma to add a tag</p>
      </div>

      <Button
        id="project-submit"
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        {submitLabel}
      </Button>
    </form>
  );
};

export default ProjectForm;
