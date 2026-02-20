/**
 * Validates a single step of the EventForm.
 * @param {number} step - 1, 2, or 3
 * @param {object} formData - current form state
 * @returns {object} errors map (empty = valid)
 */
export function validateEventStep(step, formData) {
  const errors = {};

  if (step === 1) {
    if (!formData.name?.trim()) errors.name = 'Event name is required';
    if (!formData.contactEmail?.trim()) errors.contactEmail = 'Contact email is required';
  }

  if (step === 2) {
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.endDate) errors.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && formData.endDate <= formData.startDate) {
      errors.endDate = 'End date must be after start date';
    }
    if (formData.registrationStartDate && formData.registrationEndDate
        && formData.registrationEndDate <= formData.registrationStartDate) {
      errors.registrationEndDate = 'Registration end must be after registration start';
    }
    if (formData.registrationEndDate && formData.startDate
        && formData.registrationEndDate > formData.startDate) {
      errors.registrationEndDate = 'Registration must close before the event starts';
    }
  }

  return errors;
}
