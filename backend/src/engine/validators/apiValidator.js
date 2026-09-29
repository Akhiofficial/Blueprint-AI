/**
 * apiValidator.js
 *
 * Validates AI-generated REST API Specification output against the expected Zod schema.
 * Located in engine/validators/ to match the userStoryValidator convention.
 */

import { z } from 'zod';

// Normalize HTTP method — LLMs sometimes return lowercase or mixed case
const normalizeMethod = (val) => {
  if (typeof val !== 'string') return val;
  return val.toUpperCase().trim();
};

// Normalize authentication value
const normalizeAuth = (val) => {
  if (typeof val !== 'string') return 'None';
  const s = val.toLowerCase().trim();
  if (s.includes('bearer') || s.includes('jwt') || s.includes('token')) return 'Bearer Token';
  if (s.includes('api') && s.includes('key')) return 'API Key';
  if (s.includes('session') || s.includes('cookie')) return 'Session';
  if (s === 'none' || s === 'public' || s === 'no auth' || s === 'n/a') return 'None';
  return 'Bearer Token'; // safe default for unknown values
};

// Normalize parameter location
const normalizeParamIn = (val) => {
  if (typeof val !== 'string') return 'query';
  const s = val.toLowerCase().trim();
  if (['path', 'query', 'header', 'body'].includes(s)) return s;
  if (s === 'request body' || s === 'requestbody') return 'body';
  return 'query'; // safe default
};

const parameterSchema = z.object({
  name: z.string().min(1),
  in: z.preprocess(normalizeParamIn, z.enum(['path', 'query', 'header', 'body'])),
  required: z.preprocess(
    (v) => (typeof v === 'string' ? v.toLowerCase() === 'true' : Boolean(v)),
    z.boolean()
  ).default(false),
  type: z.string().default('string'),
  description: z.string().default(''),
});

const responseSchema = z.object({
  statusCode: z.preprocess(
    (v) => (typeof v === 'string' ? parseInt(v, 10) : v),
    z.number().int()
  ),
  description: z.string().min(1),
  schema: z.string().default(''),
});

const requestBodySchema = z.object({
  contentType: z.string().default('application/json'),
  schema: z.record(z.object({
    type: z.string().default('string'),
    required: z.preprocess(
      (v) => (typeof v === 'string' ? v.toLowerCase() === 'true' : Boolean(v)),
      z.boolean()
    ).default(false),
    description: z.string().default(''),
  })).default({}),
}).nullable().optional();

const endpointSchema = z.object({
  endpointId: z.string().min(1, 'Endpoint ID is required (e.g. EP-001)'),
  method: z.preprocess(normalizeMethod, z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])),
  path: z.string().min(1, 'Endpoint path is required'),
  summary: z.string().min(1, 'Summary is required'),
  description: z.string().default(''),
  authentication: z.preprocess(normalizeAuth, z.enum(['Bearer Token', 'API Key', 'None', 'Session'])),
  parameters: z.array(parameterSchema).default([]),
  requestBody: requestBodySchema,
  responses: z.array(responseSchema).min(1, 'At least one response is required'),
});

const resourceGroupSchema = z.object({
  groupName: z.string().min(1, 'Group name is required'),
  description: z.string().default(''),
  endpoints: z.array(endpointSchema).min(1, 'At least one endpoint per group is required'),
});

const globalErrorSchema = z.object({
  statusCode: z.preprocess(
    (v) => (typeof v === 'string' ? parseInt(v, 10) : v),
    z.number().int()
  ),
  description: z.string().min(1),
});

export const apiSpecSchema = z.object({
  title: z.string().min(1, 'API spec title is required'),
  version: z.string().default('v1.0'),
  baseUrl: z.string().default('/api/v1'),
  description: z.string().default(''),
  authSchemes: z.array(z.string()).default([]),
  resourceGroups: z.array(resourceGroupSchema).min(1, 'At least one resource group is required'),
  totalEndpoints: z.preprocess(
    (v) => (typeof v === 'string' ? parseInt(v, 10) : v),
    z.number().int().min(1)
  ),
  globalErrors: z.array(globalErrorSchema).default([]),
});
