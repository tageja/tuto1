import React from 'react';
import { Controller, Control } from 'react-hook-form';
import { Input } from './Input';

interface Props {
  control: Control<any>;
  name: string;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode;
  autoFocus?: boolean;
  disableAutofill?: boolean;
}

export const FormTextInput: React.FC<Props> = ({ control, name, label, placeholder, secureTextEntry, rightIcon, autoFocus, disableAutofill }) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Input
          label={label}
          placeholder={placeholder}
          value={value ?? ''}
          onChangeText={onChange}
          secureTextEntry={secureTextEntry}
          error={error?.message}
          rightIcon={rightIcon}
          autoFocus={autoFocus}
          disableAutofill={disableAutofill}
        />
      )}
    />
  );
};


