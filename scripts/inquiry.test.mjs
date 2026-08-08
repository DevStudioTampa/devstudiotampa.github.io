import test from 'node:test';
import assert from 'node:assert/strict';
import { validateInquiry } from '../api/inquiry.mjs';

const validInput = {
  submissionId: '0f4f1d7c-fd58-4ef8-b5fc-1e8d64146474',
  name: 'Theodore Castro',
  email: 'THEODORE@example.com',
  phone: '',
  company: 'Developer Studio Tampa',
  projectType: 'automotive',
  cadence: 'one-time',
  projectDate: '2026-08-20',
  location: 'Tampa, FL',
  budgetRange: '1000-2499',
  description: 'Create an automotive image library for a fall launch.',
  website: '',
  'cf-turnstile-response': 'verified-test-token'
};

test('accepts and normalizes a valid inquiry', () => {
  const result = validateInquiry(validInput);
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.inquiry.email, 'theodore@example.com');
});

test('rejects missing required fields and unlisted options', () => {
  const result = validateInquiry({
    ...validInput,
    name: '',
    email: 'invalid',
    projectType: 'anything',
    cadence: '',
    description: 'short'
  });
  assert.equal(result.valid, false);
  assert.deepEqual(Object.keys(result.errors).sort(), ['cadence', 'description', 'email', 'name', 'projectType']);
});

test('keeps optional fields optional', () => {
  const result = validateInquiry({
    ...validInput,
    phone: '',
    company: '',
    projectDate: '',
    location: '',
    budgetRange: ''
  });
  assert.equal(result.valid, true);
});
