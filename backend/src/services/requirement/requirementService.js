import Requirement from '../../models/Requirement.js';
import Project from '../../models/Project.js';
import KnowledgeDocument from '../../models/KnowledgeDocument.js';
import { extractText } from './extractTextService.js';
import { indexDocument } from '../../engine/rag/ragService.js';

/**
 * Creates a new requirement.
 * @param {string} projectId - Project ID
 * @param {string} ownerId - Owner's user ID
 * @param {Object} data - Requirement attributes
 * @returns {Promise<Object|null>} The created Requirement model instance or null if project not found/not owned
 */
export const createRequirement = async (projectId, ownerId, data) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) return null;

  return await Requirement.create({
    ...data,
    project: projectId,
  });
};

/**
 * Retrieves all requirements for a specific project.
 * @param {string} projectId - Project ID
 * @param {string} ownerId - Owner's user ID
 * @returns {Promise<Array|null>} List of Requirement documents or null if project not found/not owned
 */
export const getRequirements = async (projectId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) return null;

  // Sorting by creation date ascending (or requirementId) to keep consistent order
  return await Requirement.find({ project: projectId }).sort({ createdAt: 1 });
};

/**
 * Retrieves a single requirement by ID.
 * @param {string} projectId - Project ID
 * @param {string} requirementId - Requirement ID
 * @param {string} ownerId - Owner's user ID
 * @returns {Promise<Object|null>} The Requirement document or null if not found
 */
export const getRequirementById = async (projectId, requirementId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) return null;

  return await Requirement.findOne({ _id: requirementId, project: projectId });
};

/**
 * Updates a requirement.
 * @param {string} projectId - Project ID
 * @param {string} requirementId - Requirement ID
 * @param {string} ownerId - Owner's user ID
 * @param {Object} updateData - Fields to update
 * @returns {Promise<Object|null>} The updated Requirement document or null if not found
 */
export const updateRequirement = async (projectId, requirementId, ownerId, updateData) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) return null;

  const requirement = await Requirement.findOne({ _id: requirementId, project: projectId });
  if (!requirement) return null;

  // Prevent project overriding from updateData
  delete updateData.project;
  
  Object.assign(requirement, updateData);
  return await requirement.save();
};

/**
 * Deletes a requirement.
 * @param {string} projectId - Project ID
 * @param {string} requirementId - Requirement ID
 * @param {string} ownerId - Owner's user ID
 * @returns {Promise<boolean>} True if requirement deleted, false otherwise
 */
export const deleteRequirement = async (projectId, requirementId, ownerId) => {
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) return false;

  const requirement = await Requirement.findOne({ _id: requirementId, project: projectId });
  if (!requirement) return false;

  await requirement.deleteOne();
  return true;
};

/**
 * Handles a requirement document upload for a project.
 *
 * Flow:
 *  1. Verify the authenticated user owns the project.
 *  2. Extract plain text from the uploaded file buffer.
 *  3. Persist a KnowledgeDocument record as the source document.
 *  4. Return the created record and the extracted text.
 *
 * @param {string} projectId          - Project ID
 * @param {string} ownerId            - Authenticated user's ID
 * @param {{ originalname, mimetype, size, buffer }} fileInfo  - From req.file (multer memoryStorage)
 * @returns {Promise<{ knowledgeDoc: Object, extractedText: string } | null>}
 *          null when project not found or user is not the owner.
 */
export const uploadRequirementDocument = async (projectId, ownerId, fileInfo) => {
  // Step 1 — ownership gate (same pattern used by every other function in this file)
  const project = await Project.findOne({ _id: projectId, owner: ownerId });
  if (!project) return null;

  // Step 2 — extract text (throws descriptive errors on failure / empty doc)
  const extractedText = await extractText(fileInfo.buffer, fileInfo.mimetype);

  // Step 3 — persist source document metadata with 'processing' status
  let knowledgeDoc = await KnowledgeDocument.create({
    project: projectId,
    name: fileInfo.originalname,
    fileType: fileInfo.mimetype,
    source: 'upload',
    status: 'processing',
    chunkCount: 0,
  });

  // Step 4 — index the document into vector store
  try {
    const indexResult = await indexDocument(projectId, knowledgeDoc._id, extractedText);
    const updatedDoc = await KnowledgeDocument.findById(knowledgeDoc._id);
    if (updatedDoc) knowledgeDoc = updatedDoc;
  } catch (indexErr) {
    console.error(`[RequirementService] Indexing failed for document ${knowledgeDoc._id}:`, indexErr.message);
    const updatedDoc = await KnowledgeDocument.findById(knowledgeDoc._id);
    if (updatedDoc) knowledgeDoc = updatedDoc;
  }

  return { knowledgeDoc, extractedText };
};

