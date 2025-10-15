import { useState, useCallback } from 'react';

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => string | null;
}

export interface ValidationRules {
  [key: string]: ValidationRule;
}

export interface FormErrors {
  [key: string]: string | null;
}

export interface FormTouched {
  [key: string]: boolean;
}

export const useFormValidation = (rules: ValidationRules) => {
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});

  const validateField = useCallback((name: string, value: string): string | null => {
    const rule = rules[name];
    if (!rule) return null;

    // Required validation
    if (rule.required && (!value || value.trim() === '')) {
      return 'Este campo é obrigatório';
    }

    // Skip other validations if field is empty and not required
    if (!value || value.trim() === '') return null;

    // Min length validation
    if (rule.minLength && value.length < rule.minLength) {
      return `Mínimo de ${rule.minLength} caracteres`;
    }

    // Max length validation
    if (rule.maxLength && value.length > rule.maxLength) {
      return `Máximo de ${rule.maxLength} caracteres`;
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return 'Formato inválido';
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }, [rules]);

  const validateForm = useCallback((values: Record<string, string>): FormErrors => {
    const newErrors: FormErrors = {};
    
    Object.keys(rules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName] || '');
      if (error) {
        newErrors[fieldName] = error;
      }
    });

    return newErrors;
  }, [rules, validateField]);

  const handleBlur = useCallback((name: string, value: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [validateField]);

  const handleChange = useCallback((name: string, value: string) => {
    // Only validate if field has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [validateField, touched]);

  const setFieldTouched = useCallback((name: string) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const setFieldError = useCallback((name: string, error: string | null) => {
    setErrors(prev => ({ ...prev, [name]: error }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const clearFieldError = useCallback((name: string) => {
    setErrors(prev => ({ ...prev, [name]: null }));
  }, []);

  const isFieldValid = useCallback((name: string) => {
    return !errors[name] && touched[name];
  }, [errors, touched]);

  const isFieldInvalid = useCallback((name: string) => {
    return !!errors[name] && touched[name];
  }, [errors, touched]);

  const isFormValid = useCallback((values: Record<string, string>) => {
    const formErrors = validateForm(values);
    return Object.keys(formErrors).length === 0;
  }, [validateForm]);

  return {
    errors,
    touched,
    validateField,
    validateForm,
    handleBlur,
    handleChange,
    setFieldTouched,
    setFieldError,
    clearErrors,
    clearFieldError,
    isFieldValid,
    isFieldInvalid,
    isFormValid,
  };
};

// Common validation rules
export const validationRules = {
  required: { required: true },
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  phone: {
    required: true,
    pattern: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s]+$/,
  },
  price: {
    required: true,
    pattern: /^\d+(\.\d{1,2})?$/,
    custom: (value: string) => {
      const num = parseFloat(value);
      if (num <= 0) return 'Preço deve ser maior que zero';
      if (num > 1000) return 'Preço muito alto';
      return null;
    },
  },
  description: {
    maxLength: 200,
  },
};
