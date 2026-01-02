import React from 'react';
import { 
  MapPin, 
  CreditCard, 
  Package,
  CheckCircle
} from 'lucide-react';

const ProgressBar = ({ 
  currentStep = 1,
  addressSelected = false,
  paymentSelected = false,
  onStepChange
}) => {
  const steps = [
    { 
      id: 1, 
      title: 'Address', 
      icon: MapPin,
      enabled: true
    },
    { 
      id: 2, 
      title: 'Payment', 
      icon: CreditCard,
      enabled: addressSelected
    },
    { 
      id: 3, 
      title: 'Review', 
      icon: Package,
      enabled: addressSelected && paymentSelected
    },
  ];

  const progressPercentage = ((currentStep - 1) / (steps.length - 1)) * 100;

  const handleStepClick = (step) => {
    if (step.enabled && onStepChange) {
      onStepChange(step.id);
    }
  };

  return (
    <div className="w-full px-4 py-6">
      {/* Progress Bar */}
      <div className="relative mb-8">
        {/* Background line */}
        <div className="absolute top-6 left-0 right-0 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" />
        
        {/* Progress line */}
        <div 
          className="absolute top-6 left-0 h-1.5 bg-blue-500 dark:bg-blue-600 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        />
        
        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const isNext = step.id === currentStep + 1;
            
            return (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step circle */}
                <button
                  onClick={() => handleStepClick(step)}
                  disabled={!step.enabled}
                  className={`
                    relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2
                    transition-all duration-300
                    ${isCompleted 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : isActive
                      ? 'bg-white dark:bg-gray-800 border-blue-500 text-blue-500 dark:text-blue-400'
                      : step.enabled
                      ? 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500 hover:border-blue-300 dark:hover:border-blue-500'
                      : 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-300 dark:text-gray-600 cursor-not-allowed'
                    }
                  `}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </button>

                {/* Step label */}
                <div className="mt-3 text-center">
                  <p className={`
                    text-sm font-medium
                    ${isActive ? 'text-blue-600 dark:text-blue-400' : 
                     step.enabled ? 'text-gray-600 dark:text-gray-400' : 
                     'text-gray-400 dark:text-gray-600'}
                  `}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Step {step.id}
                  </p>
                </div>

                {/* Connector line (except last step) */}
                {index < steps.length - 1 && (
                  <div className="absolute top-6 left-1/2 w-full h-0.5 -z-10" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Indicator */}
      <div className="text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {currentStep === 1 && "Add your delivery address"}
          {currentStep === 2 && "Select payment method"}
          {currentStep === 3 && "Review & place order"}
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;