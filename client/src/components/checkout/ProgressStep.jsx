import React from 'react';
import { Check, Lock } from 'lucide-react';

const ProgressStep = ({ 
  step,
  stepNumber,
  isActive = false,
  isCompleted = false,
  isClickable = false,
  isLast = false,
  onClick = null
}) => {
  
  const Icon = step.icon;
  
  return (
    <div 
      className={`relative flex flex-col items-center w-full ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={isClickable ? onClick : undefined}
    >
      {/* Step Circle Container */}
      <div className="relative mb-4 md:mb-6">
        
        {/* Step Circle */}
        <div className={`
          w-12 h-12 md:w-14 md:h-14 rounded-full 
          flex items-center justify-center
          transition-all duration-500
          ${isActive 
            ? 'border-4 border-blue-500 dark:border-blue-400 bg-white dark:bg-gray-900 scale-110 shadow-lg ring-4 ring-blue-100 dark:ring-blue-900/30' 
            : isCompleted
            ? 'border-4 border-green-500 dark:border-green-400 bg-green-500 dark:bg-green-600 shadow-md'
            : 'border-4 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900'
          }
        `}>
          
          {/* Icon or Checkmark */}
          {isCompleted ? (
            <Check className="w-5 h-5 md:w-6 md:h-6 text-white" />
          ) : (
            <Icon className={`
              w-5 h-5 md:w-6 md:h-6 transition-colors duration-300
              ${isActive 
                ? 'text-blue-600 dark:text-blue-400' 
                : 'text-gray-500 dark:text-gray-400'
              }
            `} />
          )}
          
          {/* Lock icon for future steps */}
          {!isActive && !isCompleted && !isClickable && (
            <div className="absolute -top-1 -right-1">
              <Lock className="w-4 h-4 text-gray-400 dark:text-gray-600" />
            </div>
          )}
        </div>
        
        {/* Step Number Badge */}
        <div className={`
          absolute -bottom-2 left-1/2 transform -translate-x-1/2
          px-3 py-1 rounded-full text-xs font-bold min-w-[60px] text-center
          transition-all duration-300
          ${isActive 
            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
            : isCompleted
            ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }
        `}>
          Step {stepNumber}
        </div>
      </div>

      {/* Step Info */}
      <div className="text-center max-w-[120px] md:max-w-[140px]">
        <h3 className={`
          text-sm md:text-base mb-1 transition-colors duration-300
          ${isActive 
            ? 'text-gray-900 dark:text-white font-bold' 
            : isCompleted
            ? 'text-green-700 dark:text-green-400 font-semibold'
            : 'text-gray-600 dark:text-gray-500'
          }
        `}>
          {step.title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {step.description}
        </p>
      </div>
    </div>
  );
};

export default ProgressStep;