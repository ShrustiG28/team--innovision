import React from 'react';
import { Copy, Check, AlertCircle, Loader } from 'lucide-react';

/**
 * Card Component - Reusable card wrapper for consistent styling
 */
export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
    {children}
  </div>
);

/**
 * Button Component - Reusable button with variants
 */
export const Button = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
  ...props
}) => {
  const baseStyles =
    'px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 justify-center';

  const variants = {
    primary:
      'bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-gray-400',
    secondary:
      'bg-gray-200 text-gray-900 hover:bg-gray-300 disabled:bg-gray-400',
    success:
      'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400',
    danger:
      'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400',
    outline:
      'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-50'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && <Loader className="w-4 h-4 animate-spin" />}
      {children}
    </button>
  );
};

/**
 * Badge Component - Status/label badge
 */
export const Badge = ({ children, variant = 'default', className = '' }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    danger: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800'
  };

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

/**
 * Alert Component - Alert messages with variants
 */
export const Alert = ({ children, variant = 'info', title, icon: Icon = null, className = '' }) => {
  const variants = {
    info: 'bg-blue-50 border border-blue-200 text-blue-800',
    success: 'bg-green-50 border border-green-200 text-green-800',
    warning: 'bg-yellow-50 border border-yellow-200 text-yellow-800',
    danger: 'bg-red-50 border border-red-200 text-red-800'
  };

  const icons = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500'
  };

  return (
    <div className={`rounded-lg p-4 ${variants[variant]} ${className}`}>
      <div className="flex gap-3">
        {Icon && <Icon className={`w-5 h-5 flex-shrink-0 ${icons[variant]}`} />}
        <div>
          {title && <h4 className="font-semibold mb-1">{title}</h4>}
          <p className="text-sm">{children}</p>
        </div>
      </div>
    </div>
  );
};

/**
 * CopyableText Component - Text with copy-to-clipboard functionality
 */
export const CopyableText = ({ text, label, truncate = false, className = '' }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayText = truncate && text.length > 20 
    ? `${text.substring(0, 10)}...${text.substring(text.length - 10)}`
    : text;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex-1 min-w-0">
        {label && <p className="text-xs text-gray-600 mb-1">{label}</p>}
        <p className="font-mono text-sm bg-gray-50 p-2 rounded border border-gray-200 break-all">
          {displayText}
        </p>
      </div>
      <button
        onClick={handleCopy}
        className="p-2 hover:bg-gray-100 rounded transition-colors"
        title="Copy to clipboard"
      >
        {copied ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Copy className="w-5 h-5 text-gray-600" />
        )}
      </button>
    </div>
  );
};

/**
 * LoadingSpinner Component
 */
export const LoadingSpinner = ({ message = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-3">
    <Loader className="w-8 h-8 animate-spin text-indigo-600" />
    <p className="text-gray-600">{message}</p>
  </div>
);

/**
 * JSONDisplay Component - Display JSON with nice formatting
 */
export const JSONDisplay = ({ data, title = 'JSON Data', className = '' }) => (
  <div className={`${className}`}>
    {title && <h4 className="text-sm font-semibold text-gray-900 mb-2">{title}</h4>}
    <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs font-mono">
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

/**
 * StepIndicator Component - Show progress through steps
 */
export const StepIndicator = ({ steps, currentStep, className = '' }) => (
  <div className={`flex items-center justify-between ${className}`}>
    {steps.map((step, index) => (
      <React.Fragment key={index}>
        <div className="flex flex-col items-center flex-1">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
              currentStep >= index
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}
          >
            {index + 1}
          </div>
          <p className="text-xs mt-2 text-center text-gray-600">{step}</p>
        </div>
        {index < steps.length - 1 && (
          <div
            className={`h-1 flex-1 mx-2 transition-all ${
              currentStep > index ? 'bg-indigo-600' : 'bg-gray-200'
            }`}
          />
        )}
      </React.Fragment>
    ))}
  </div>
);

export default {
  Card,
  Button,
  Badge,
  Alert,
  CopyableText,
  LoadingSpinner,
  JSONDisplay,
  StepIndicator
};
