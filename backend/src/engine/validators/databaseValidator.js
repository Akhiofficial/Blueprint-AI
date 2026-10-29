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

// Normalize enum values (convert numbers/booleans to strings, handle null/undefined, arrays, objects, or comma-separated strings)
const normalizeEnumValues = (val) => {
  if (val === null || val === undefined) return [];
  if (Array.isArray(val)) {
    return val
      .filter((item) => item !== null && item !== undefined)
      .map((item) => {
        if (typeof item === 'object') {
          if (item.value !== undefined) return String(item.value).trim();
          if (item.name !== undefined) return String(item.name).trim();
          if (item.label !== undefined) return String(item.label).trim();
          return JSON.stringify(item);
        }
        return String(item).trim();
      })
      .filter(Boolean);
  }
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        return normalizeEnumValues(parsed);
      }
    } catch {
      // not JSON array string
    }
    return val
      .split(',')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }
  if (typeof val === 'number' || typeof val === 'boolean') {
    return [String(val)];
  }
  return [];
};

// Normalize string arrays (e.g. index fields)
const normalizeStringArray = (val, defaultVal = 'id') => {
  if (Array.isArray(val)) {
    const arr = val
      .filter((item) => item !== null && item !== undefined)
      .map((item) => String(item).trim())
      .filter(Boolean);
    return arr.length > 0 ? arr : [defaultVal];
  }
  if (typeof val === 'string' && val.trim()) {
    return [val.trim()];
  }
  return [defaultVal];
};

const fieldSchema = z.object({
  name: z.preprocess((val) => (val !== null && val !== undefined ? String(val).trim() : ''), z.string().min(1, 'Field name is required')),
  type: z.preprocess((val) => (val !== null && val !== undefined && String(val).trim() ? String(val).trim() : 'VARCHAR(255)'), z.string().min(1, 'Field type is required')),
  required: z.preprocess(normalizeBoolean, z.boolean()).default(false),
  isPrimaryKey: z.preprocess(normalizeBoolean, z.boolean()).default(false),
  unique: z.preprocess(normalizeBoolean, z.boolean()).default(false),
  defaultValue: z.preprocess(normalizeDefaultValue, z.string().nullable().optional().default(null)),
  enumValues: z.preprocess(normalizeEnumValues, z.array(z.string()).default([])),
  description: z.preprocess((val) => (val !== null && val !== undefined ? String(val) : ''), z.string().default('')),
});

const indexSchema = z.object({
  name: z.preprocess(
    (val) => (val !== null && val !== undefined && String(val).trim() ? String(val).trim() : 'idx_' + Math.random().toString(36).substring(2, 8)),
    z.string().min(1, 'Index name is required')
  ),
  fields: z.preprocess(
    (v) => normalizeStringArray(v, 'id'),
    z.array(z.string().min(1)).min(1, 'At least one indexed field is required')
  ),
  unique: z.preprocess(normalizeBoolean, z.boolean()).default(false),
  type: z.preprocess((val) => (val !== null && val !== undefined && String(val).trim() ? String(val).trim() : 'BTREE'), z.string().default('BTREE')),
});

const relationshipSchema = z.object({
  targetEntity: z.preprocess((val) => (val !== null && val !== undefined ? String(val).trim() : ''), z.string().min(1, 'Target entity is required')),
  type: z.preprocess(normalizeRelationshipType, z.string()),
  foreignKey: z.preprocess((val) => (val !== null && val !== undefined ? String(val) : ''), z.string().default('')),
  description: z.preprocess((val) => (val !== null && val !== undefined ? String(val) : ''), z.string().default('')),
});

const entitySchema = z.object({
  name: z.preprocess((val) => (val !== null && val !== undefined ? String(val).trim() : ''), z.string().min(1, 'Entity name is required')),
  purpose: z.preprocess(
    (val) => (val !== null && val !== undefined && String(val).trim() ? String(val).trim() : 'Entity data store'),
    z.string().min(1, 'Entity purpose/description is required')
  ),
  fields: z.array(fieldSchema).min(1, 'At least one field is required per entity'),
  indexes: z.preprocess((val) => (Array.isArray(val) ? val.filter(Boolean) : []), z.array(indexSchema).default([])),
  relationships: z.preprocess((val) => (Array.isArray(val) ? val.filter(Boolean) : []), z.array(relationshipSchema).default([])),
});

export const databaseSchemaValidator = z.object({
  title: z.preprocess((val) => (val !== null && val !== undefined && String(val).trim() ? String(val).trim() : 'Database Schema'), z.string().min(1, 'Database schema title is required')),
  databaseType: z.preprocess((val) => (val !== null && val !== undefined && String(val).trim() ? String(val).trim() : 'PostgreSQL'), z.string().min(1, 'Database type is required (e.g. PostgreSQL, MongoDB)')),
  strategy: z.preprocess((val) => (val !== null && val !== undefined && String(val).trim() ? String(val).trim() : 'Relational'), z.string().default('Relational')),
  description: z.preprocess((val) => (val !== null && val !== undefined ? String(val) : ''), z.string().default('')),
  entities: z.array(entitySchema).min(1, 'At least one entity/collection is required'),
  mermaidDiagram: z.preprocess((val) => (val !== null && val !== undefined ? String(val) : ''), z.string().default('')),
});
