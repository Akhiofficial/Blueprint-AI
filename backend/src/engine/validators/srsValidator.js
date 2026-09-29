/**
 * srsValidator.js
 *
 * Validates AI-generated Software Requirements Specification (SRS) output
 * against the expected IEEE-compliant Zod schema structure.
 */

import { z } from 'zod';

export const userRoleSchema = z.object({
  roleName: z.string().min(1, 'Role name is required'),
  description: z.string().min(1, 'Role description is required'),
  permissions: z.array(z.string()).default([]),
});

export const srsFunctionalReqSchema = z.object({
  id: z.string().min(1, 'Requirement ID is required (e.g. FR-001)'),
  category: z.string().min(1, 'Category is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  priority: z.enum(['High', 'Medium', 'Low', 'Critical']).default('High'),
});

export const srsNonFunctionalReqSchema = z.object({
  category: z.string().min(1, 'NFR Category is required (e.g. Performance, Security)'),
  requirement: z.string().min(1, 'Requirement statement is required'),
  metric: z.string().default('Target SLA/Benchmark'),
});

export const systemFeatureSchema = z.object({
  featureName: z.string().min(1, 'Feature name is required'),
  description: z.string().min(1, 'Feature description is required'),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
});

export const externalInterfaceSchema = z.object({
  interfaceType: z.string().min(1, 'Interface type is required (e.g. User, Hardware, Software/API)'),
  description: z.string().min(1, 'Interface description is required'),
  protocolOrFormat: z.string().default('REST/JSON'),
});

export const srsSchema = z.object({
  title: z.string().min(1, 'SRS Title is required'),
  documentVersion: z.string().default('1.0'),
  systemOverview: z.string().min(1, 'System overview is required'),
  userRoles: z.array(userRoleSchema).min(1, 'At least one user role is required'),
  functionalRequirements: z.array(srsFunctionalReqSchema).min(1, 'At least one functional requirement is required'),
  nonFunctionalRequirements: z.array(srsNonFunctionalReqSchema).min(1, 'At least one non-functional requirement is required'),
  systemFeatures: z.array(systemFeatureSchema).min(1, 'At least one system feature is required'),
  externalInterfaces: z.array(externalInterfaceSchema).default([]),
  systemConstraints: z.array(z.string()).default([]),
  assumptionsAndDependencies: z.array(z.string()).default([]),
  securityRequirements: z.array(z.string()).default([]),
  performanceRequirements: z.array(z.string()).default([]),
  acceptanceCriteria: z.array(z.string()).default([]),
});
