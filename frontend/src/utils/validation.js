/**
 * Form Validation Utility
 * Helper functions for form validation across the application
 */

/**
 * Validates an email address format
 * @param {string} email - The email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password meets minimum security requirements
 * @param {string} password - The password to validate
 * @param {number} minLength - Minimum password length (default: 6)
 * @returns {boolean} True if valid
 */
export const isValidPassword = (password, minLength = 6) => {
  if (!password) return false;
  return password.length >= minLength;
};

/**
 * Validates two passwords match
 * @param {string} password - The password
 * @param {string} confirmPassword - The confirmation password
 * @returns {boolean} True if they match
 */
export const passwordsMatch = (password, confirmPassword) => {
  return password === confirmPassword;
};

/**
 * Validates phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  if (!phone) return false;
  // Basic phone validation - allows various formats
  const phoneRegex = /^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates a required field is not empty
 * @param {string} value - Field value
 * @returns {boolean} True if not empty
 */
export const isNotEmpty = (value) => {
  if (value === null || value === undefined) return false;
  return value.toString().trim() !== '';
};

/**
 * Validates input is a number
 * @param {string} value - Value to check
 * @returns {boolean} True if is a number
 */
export const isNumber = (value) => {
  if (value === null || value === undefined) return false;
  return !isNaN(Number(value));
};

/**
 * Validated a field against minimum length
 * @param {string} value - Field value
 * @param {number} minLength - Minimum required length
 * @returns {boolean} True if valid
 */
export const hasMinLength = (value, minLength) => {
  if (!value) return false;
  return value.length >= minLength;
};

/**
 * Validates a date is in the future
 * @param {string|Date} date - Date to validate
 * @returns {boolean} True if date is in the future
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  const dateObj = new Date(date);
  const now = new Date();
  return dateObj > now;
};

/**
 * Validates a form object and returns errors
 * @param {Object} data - Form data to validate
 * @param {Object} validations - Validation rules object
 * @returns {Object} Object with field errors
 * 
 * Example usage:
 * const errors = validateForm(
 *   { email: 'test@example.com', password: 'short' },
 *   { 
 *     email: { isRequired: true, isEmail: true },
 *     password: { isRequired: true, minLength: 8 }
 *   }
 * );
 */
export const validateForm = (data, validations) => {
  const errors = {};
  
  Object.keys(validations).forEach(field => {
    const value = data[field];
    const rules = validations[field];
    
    // Required field validation
    if (rules.isRequired && !isNotEmpty(value)) {
      errors[field] = `${field} is required`;
    }
    
    // If field has a value, check other validations
    if (value) {
      // Email validation
      if (rules.isEmail && !isValidEmail(value)) {
        errors[field] = 'Please enter a valid email address';
      }
      
      // Password validation
      if (rules.minLength && !hasMinLength(value, rules.minLength)) {
        errors[field] = `Must be at least ${rules.minLength} characters`;
      }
      
      // Phone validation
      if (rules.isPhone && !isValidPhone(value)) {
        errors[field] = 'Please enter a valid phone number';
      }
      
      // Number validation
      if (rules.isNumber && !isNumber(value)) {
        errors[field] = 'Please enter a valid number';
      }
      
      // Future date validation
      if (rules.isFutureDate && !isFutureDate(value)) {
        errors[field] = 'Date must be in the future';
      }
      
      // Match other field validation
      if (rules.matches && value !== data[rules.matches]) {
        errors[field] = `Must match ${rules.matches}`;
      }
      
      // Custom validation
      if (rules.custom && typeof rules.custom.validator === 'function') {
        const isValid = rules.custom.validator(value, data);
        if (!isValid) {
          errors[field] = rules.custom.message || `Invalid ${field}`;
        }
      }
    }
  });
  
  return errors;
};

export default {
  isValidEmail,
  isValidPassword,
  passwordsMatch,
  isValidPhone,
  isNotEmpty,
  isNumber,
  hasMinLength,
  isFutureDate,
  validateForm
}; 