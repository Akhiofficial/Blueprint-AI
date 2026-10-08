/**
 * srsValidator.js
 *
 * Zod validation schema for AI-generated Software Requirements Specification (SRS).
 * Ensures structured JSON responses conform strictly to SRS expectations while robustly
 * handling string/array variations from different LLM providers.
 */

import { z } from 'zod';

const stringOrArray = z.union([
  z.array(z.union([
    z.string(),
    z.record(z.any()).transform((o) => o.criteria || o.title || o.description || o.name || JSON.stringify(o))
  ])),
  z.string().transform((val) => [val]),
  z.record(z.any()).transform((o) => [o.criteria || o.description || JSON.stringify(o)])
]).default([]);

const stringOrObject = z.union([
  z.string(),
  z.record(z.any()).transform((obj) => obj.summary || obj.description || JSON.stringify(obj)),
]).default('');

export const userRoleSchema = z.object({
  roleName: z.string().min(1, 'Role name is required'),
  description: z.string().min(1, 'Role description is required'),
  permissions: stringOrArray,
});

export const srsFunctionalReqSchema = z.object({
  id: z.string().default(''),
  category: z.string().default('Core'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.string().default('High'),
});

export const srsNonFunctionalReqSchema = z.object({
  category: z.string().default('Performance'),
  requirement: z.string().min(1, 'Requirement statement is required'),
  metric: z.string().default('Standard'),
});

export const systemFeatureSchema = z.object({
  featureName: z.string().min(1, 'Feature name is required'),
  description: z.string().min(1, 'Feature description is required'),
  inputs: stringOrArray,
  outputs: stringOrArray,
});

export const externalInterfaceSchema = z.object({
  interfaceType: z.string().default('Software Interface'),
  description: z.string().min(1, 'Interface description is required'),
  protocolOrFormat: z.string().default('REST/JSON'),
});

export const srsSchema = z.object({
  title: z.string().min(1, 'SRS Title is required'),
  documentVersion: z.string().default('1.0'),
  systemOverview: stringOrObject,
  userRoles: z.array(userRoleSchema).default([]),
  functionalRequirements: z.array(srsFunctionalReqSchema).default([]),
  nonFunctionalRequirements: z.array(srsNonFunctionalReqSchema).default([]),
  systemFeatures: z.array(systemFeatureSchema).default([]),
  externalInterfaces: z.array(externalInterfaceSchema).default([]),
  systemConstraints: stringOrArray,
  assumptionsAndDependencies: stringOrArray,
  securityRequirements: stringOrArray,
  performanceRequirements: stringOrArray,
  acceptanceCriteria: stringOrArray,
});
