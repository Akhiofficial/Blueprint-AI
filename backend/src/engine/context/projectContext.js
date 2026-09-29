/**
 * projectContext.js
 *
 * Builds the project-level context object from the Project model.
 * Extracts: title, description, category, tech stack, etc.
 */

import Project from '../../models/Project.js';

export const buildProjectContext = async (projectId) => {
  const project = await Project.findById(projectId).lean();
  if (!project) return null;

  return {
    title: project.title || '',
    description: project.description || '',
    category: project.category || '',
    techStack: project.techStack || [],
    projectType: project.projectType || '',
    businessGoal: project.businessGoal || ''
  };
};
