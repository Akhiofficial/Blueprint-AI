/**
 * databaseValidator.js
 *
 * Validates AI-generated Database Schema output against the expected Zod schema.
 * Located in engine/validators/ following the established validator convention.
 */

import { z } from 'zod';

// Normalize boolean fields that LLMs might return as strings or truthy values
const normalizeBoolean = (val) => {
  if (typeof val === 'string') {
    return val.toLowerCase() === 'true' || val.toLowerCase() === 'yes';
  }
  return Boolean(val);
};

// Normalize relationship types into clean representations
const normalizeRelationshipType = (val) => {
  if (typeof val !== 'string') return '1:N';
  const s = val.trim().toLowerCase();
  if (s.includes('one-to-many') || s === '1:n' || s === '1-to-n' || s === '1:*' || s === 'one to many') return '1:N';
  if (s.includes('many-to-one') || s === 'n:1' || s === 'n-to-1' || s === '*:1' || s === 'many to one') return 'N:1';
  if (s.includes('one-to-one') || s === '1:1' || s === '1-to-1' || s === 'one to one') return '1:1';
  if (s.includes('many-to-many') || s === 'n:m' || s === 'm:n' || s === 'n-to-m' || s === '*:*' || s === 'many to many') return 'N:M';
  return val.trim();
};

// Normalize default value (numbers/booleans from LLMs converted cleanly to string or null)
const normalizeDefaultValue = (val) => {
  if (val === null || val === undefined) return null;
  return String(val);
};

const fieldSchema = z.object({
  name: z.string().min(1, 'Field name is required'),
  type: z.string().min(1, 'Field type is required'),
  required: z.preprocess(normalizeBoolean, z.boolean()).default(false),
  isPrimaryKey: z.preprocess(normalizeBoolean, z.boolean()).default(false),
  unique: z.preprocess(normalizeBoolean, z.boolean()).default(false),
  defaultValue: z.preprocess(normalizeDefaultValue, z.string().nullable().optional().default(null)),
  enumValues: z.array(z.string()).default([]),
  description: z.string().default(''),
});

const indexSchema = z.object({
  name: z.string().min(1, 'Index name is required'),
  fields: z.array(z.string().min(1)).min(1, 'At least one indexed field is required'),
  unique: z.preprocess(normalizeBoolean, z.boolean()).default(false),
  type: z.string().default('BTREE'),
});

const relationshipSchema = z.object({
  targetEntity: z.string().min(1, 'Target entity is required'),
  type: z.preprocess(normalizeRelationshipType, z.string()),
  foreignKey: z.string().default(''),
  description: z.string().default(''),
});

const entitySchema = z.object({
  name: z.string().min(1, 'Entity name is required'),
  purpose: z.string().min(1, 'Entity purpose/description is required'),
  fields: z.array(fieldSchema).min(1, 'At least one field is required per entity'),
  indexes: z.array(indexSchema).default([]),
  relationships: z.array(relationshipSchema).default([]),
});

export const databaseSchemaValidator = z.object({
  title: z.string().min(1, 'Database schema title is required'),
  databaseType: z.string().min(1, 'Database type is required (e.g. PostgreSQL, MongoDB)'),
  strategy: z.string().default('Relational'),
  description: z.string().default(''),
  entities: z.array(entitySchema).min(1, 'At least one entity/collection is required'),
  mermaidDiagram: z.string().default(''),
});
