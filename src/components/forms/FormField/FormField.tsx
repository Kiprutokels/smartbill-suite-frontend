import React from 'react';
import { Input, InputProps } from '../../ui/Input';
import { Select, SelectProps } from '../../ui/Select';
import { cn } from '../../../utils/cn';

interface BaseFormFieldProps {
  name: string;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

interface FormInputProps extends BaseFormFieldProps, Omit<InputProps, 'name' | 'label' | 'error'> {
  type: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
}

interface FormSelectProps extends BaseFormFieldProps, Omit<SelectProps, 'name' | 'label' | 'error'> {
  type: 'select';
}

interface FormTextareaProps extends BaseFormFieldProps {
  type: 'textarea';
  rows?: number;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

type FormFieldProps = FormInputProps | FormSelectProps | FormTextareaProps;

const FormField: React.FC<FormFieldProps> = (props) => {
  const { name, label, error, required, className, type, ...restProps } = props;

  const fieldLabel = label && (
    <label htmlFor={name} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      {label}
      {required && <span className="text-destructive ml-1">*</span>}
    </label>
  );

  if (type === 'textarea') {
    const textareaProps = restProps as Omit<FormTextareaProps, 'name' | 'label' | 'error' | 'required' | 'className' | 'type'>;
    return (
      <div className={cn('space-y-2', className)}>
        {fieldLabel}
        <textarea
          id={name}
          name={name}
          className={cn(
            "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-destructive focus-visible:ring-destructive"
          )}
          {...textareaProps}
        />
        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }

  if (type === 'select') {
    const selectProps = restProps as Omit<FormSelectProps, 'name' | 'label' | 'error' | 'required' | 'className' | 'type'>;
    return (
      <div className={className}>
        {fieldLabel}
        <Select
          name={name}
          label={label}
          error={error}
          {...selectProps}
        />
      </div>
    );
  }

  const inputProps = restProps as Omit<FormInputProps, 'name' | 'label' | 'error' | 'required' | 'className' | 'type'>;
  return (
    <div className={className}>
      {fieldLabel}
      <Input
        id={name}
        name={name}
        type={type}
        label={label}
        error={error}
        {...inputProps}
      />
    </div>
  );
};

export { FormField };
export type { FormFieldProps };
