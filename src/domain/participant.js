export const countryCodes = {
  Nigeria: 'NG',
  Ghana: 'GH',
  Kenya: 'KE',
};

const telephonePrefixes = {
  Nigeria: '+234',
  Ghana: '+233',
  Kenya: '+254',
};

export function normalizePhoneNumber(value) {
  return value.trim().replace(/[\s()-]/g, '');
}

export function validateParticipant(input) {
  const errors = {};

  if (!input.firstName?.trim()) errors.firstName = 'Enter a first name.';
  if (!input.lastName?.trim()) errors.lastName = 'Enter a last name.';
  if (!countryCodes[input.country]) errors.country = 'Choose a supported country.';
  if (!input.location?.trim()) errors.location = 'Enter a location.';
  if (input.firstName?.trim().length > 100) errors.firstName = 'First name must be 100 characters or fewer.';
  if (input.lastName?.trim().length > 100) errors.lastName = 'Last name must be 100 characters or fewer.';
  if (input.location?.trim().length > 200) errors.location = 'Location must be 200 characters or fewer.';
  if (input.enterprise?.trim().length > 200) errors.enterprise = 'Enterprise must be 200 characters or fewer.';
  if (input.phone?.trim()) {
    const phone = normalizePhoneNumber(input.phone);
    const prefix = telephonePrefixes[input.country];
    const nationalNumber = phone.startsWith(prefix) ? phone.slice(prefix.length) : '';
    if (!prefix || !/^[1-9]\d{7,10}$/.test(nationalNumber)) {
      errors.phone = `Enter a valid ${input.country} number in international format (${prefix || 'country code'}…).`;
    }
  }
  if (!input.consent) errors.consent = 'Record participant consent before registration.';

  return errors;
}

export function toParticipantRecord(record) {
  const stages = {
    applicant: 'Applicant',
    enrolled: 'Enrolled',
    active: 'Active',
    follow_up: 'Follow-up',
    completed: 'Completed',
    withdrawn: 'Withdrawn',
  };
  return {
    id: record.participant_code,
    name: `${record.first_name} ${record.last_name}`,
    initials: `${record.first_name[0]}${record.last_name[0]}`.toUpperCase(),
    age: null,
    country: { NG: 'Nigeria', GH: 'Ghana', KE: 'Kenya' }[record.country_code],
    location: record.location,
    enterprise: record.enterprise || 'Not yet assigned',
    stage: stages[record.status] || record.status,
    service: 'No service recorded',
    updated: new Date(record.updated_at).toLocaleString(),
    color: 'mint',
  };
}
