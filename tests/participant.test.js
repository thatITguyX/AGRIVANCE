import test from 'node:test';
import assert from 'node:assert/strict';
import { countryCodes, normalizePhoneNumber, toParticipantRecord, validateParticipant } from '../src/domain/participant.js';

test('valid participant requires names, supported country, location, and consent', () => {
  assert.deepEqual(validateParticipant({
    firstName: ' Amina ',
    lastName: ' Yusuf ',
    country: 'Nigeria',
    location: 'Kaduna',
    consent: true,
  }), {});
});

test('participant validation reports missing and unsupported fields', () => {
  assert.deepEqual(validateParticipant({
    firstName: ' ',
    lastName: '',
    country: 'Narnia',
    location: '',
    consent: false,
  }), {
    firstName: 'Enter a first name.',
    lastName: 'Enter a last name.',
    country: 'Choose a supported country.',
    location: 'Enter a location.',
    consent: 'Record participant consent before registration.',
  });
});

test('country identifiers match the supported program countries', () => {
  assert.deepEqual(countryCodes, { Nigeria: 'NG', Ghana: 'GH', Kenya: 'KE' });
});

test('country-aware phone validation normalizes accepted international formats', () => {
  assert.equal(normalizePhoneNumber('+234 801-234-5678'), '+2348012345678');
  assert.deepEqual(validateParticipant({
    firstName: 'Amina',
    lastName: 'Yusuf',
    country: 'Nigeria',
    location: 'Kaduna',
    phone: '+233 801 234 5678',
    consent: true,
  }), {
    phone: 'Enter a valid Nigeria number in international format (+234…).',
  });
});

test('database participants map to the directory without inventing profile data', () => {
  const person = toParticipantRecord({
    participant_code: 'AGR-ABC123',
    country_code: 'GH',
    first_name: 'Kojo',
    last_name: 'Mensah',
    location: 'Tamale',
    enterprise: null,
    status: 'follow_up',
    updated_at: '2026-10-22T10:00:00.000Z',
  });

  assert.equal(person.id, 'AGR-ABC123');
  assert.equal(person.country, 'Ghana');
  assert.equal(person.age, null);
  assert.equal(person.enterprise, 'Not yet assigned');
  assert.equal(person.stage, 'Follow-up');
});
