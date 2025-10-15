import React from 'react';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle } from 'lucide-react';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  isValid?: boolean;
  isInvalid?: boolean;
  touched?: boolean;
  helperText?: string;
}

const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ label, error, isValid, isInvalid, touched, helperText, className, ...props }, ref) => {
    const showError = touched && isInvalid && error;
    const showSuccess = touched && isValid && !error;

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={props.id} className="text-sm font-medium">
            {label}
            {props.required && <span className="text-destructive ml-1">*</span>}
          </Label>
        )}
        
        <div className="relative">
          <Input
            ref={ref}
            className={cn(
              'transition-all duration-200',
              showError && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              showSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500/20',
              className
            )}
            {...props}
          />
          
          {/* Status Icons */}
          {showError && (
            <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-destructive" />
          )}
          {showSuccess && (
            <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-green-500" />
          )}
        </div>
        
        {/* Error Message */}
        {showError && (
          <p className="text-sm text-destructive animate-slide-up flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        
        {/* Helper Text */}
        {helperText && !showError && (
          <p className="text-sm text-muted-foreground">{helperText}</p>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';

export { ValidatedInput };
