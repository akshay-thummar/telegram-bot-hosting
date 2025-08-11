import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  error = '',
  required = false 
}) => {
  return (
    <div className="input-group">
      {label && <label className="input-label">{label}{required && <span className="required">*</span>}</label>}
      <input
        type={type}
        className={`input ${error ? 'input-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;