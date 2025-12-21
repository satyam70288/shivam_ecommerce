import React from 'react';
import { 
  MapPin, 
  CreditCard, 
  Package,
  CheckCircle
} from 'lucide-react';
import ProgressStep from './ProgressStep';

const ProgressBar = ({ 
  currentStep = 1, 
  totalSteps = 3,
  steps = [],
  onStepChange,
  showProgress = true,
  addressSelected = false,
  paymentSelected = false
}) => {
  
  const defaultSteps = [
    { id: 1, title: 'Address', description: 'Delivery address', icon: MapPin },
    { id: 2, title: 'Payment', description: 'Payment method', icon: CreditCard },
    { id: 3, title: 'Review', description: 'Place order', icon: Package },
  ];

  const stepList = steps.length > 0 ? steps : defaultSteps;
  
  const progressPercentage = Math.min(
    100, 
    ((currentStep - 1) / Math.max(1, (totalSteps - 1))) * 100
  );

  const handleStepClick = (stepId) => {
    if (onStepChange) {
      // Check if step is clickable
      if (stepId === 1) {
        // Step 1 is always clickable
        onStepChange(stepId);
      } else if (stepId === 2 && addressSelected) {
        // Step 2 only if address is selected
        onStepChange(stepId);
      } else if (stepId === 3 && addressSelected && paymentSelected) {
        // Step 3 only if both are selected
        onStepChange(stepId);
      }
    }
  };

  // Check if step is clickable
  const isStepClickable = (stepId) => {
    if (stepId === 1) return true;
    if (stepId === 2) return addressSelected;
    if (stepId === 3) return addressSelected && paymentSelected;
    return false;
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 md:p-6">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Checkout Progress
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Click on steps to navigate
          </p>
        </div>
        
        {/* Progress Stats */}
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full">
          <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {currentStep}
          </span>
          <span className="text-gray-500 dark:text-gray-400">/</span>
          <span className="text-gray-700 dark:text-gray-300">{totalSteps}</span>
          <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
            steps
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative mb-10 md:mb-12">
        
        {/* Background Line */}
        <div className="absolute top-6 md:top-8 left-0 right-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-full z-0"></div>
        
        {/* Progress Fill Line */}
        <div 
          className="absolute top-6 md:top-8 left-0 h-2 bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 rounded-full z-10 transition-all duration-700 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>

        {/* Steps Container */}
        <div className="relative flex justify-between z-20 px-2 md:px-0">
          {stepList.map((step, index) => {
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            const clickable = isStepClickable(step.id);
            const isLast = index === stepList.length - 1;

            return (
              <div 
                key={step.id}
                className="flex flex-col items-center relative flex-1"
              >
                {/* Step Component */}
                <ProgressStep
                  step={step}
                  stepNumber={index + 1}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  isClickable={clickable}
                  isLast={isLast}
                  isEnabled={clickable}  // For styling
                  onClick={() => handleStepClick(step.id)}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Info Section */}
      {showProgress && (
        <div className="mb-8 p-4 md:p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-blue-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg">
                Current Step: {stepList.find(s => s.id === currentStep)?.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                {stepList.find(s => s.id === currentStep)?.description}
              </p>
            </div>
            
            {/* Mini Progress Bar */}
            <div className="w-full md:w-64">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span>Progress</span>
                <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 transition-all duration-700"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Completion Status */}
          {currentStep === totalSteps ? (
            <div className="mt-4 flex items-center gap-2 text-green-700 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">All steps completed! Ready to proceed.</span>
            </div>
          ) : (
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {currentStep} of {totalSteps} steps completed • {
                totalSteps - currentStep
              } step{totalSteps - currentStep !== 1 ? 's' : ''} remaining
            </div>
          )}
        </div>
      )}

      {/* Navigation Hint */}
      <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <p>💡 Tip: Click on any completed or enabled step to navigate</p>
        {!addressSelected && (
          <p className="text-amber-600 dark:text-amber-400 mt-1">
            ⚡ Select address to unlock Payment step
          </p>
        )}
        {addressSelected && !paymentSelected && currentStep >= 2 && (
          <p className="text-amber-600 dark:text-amber-400 mt-1">
            ⚡ Select payment to unlock Review step
          </p>
        )}
      </div>
    </div>
  );
};

ProgressBar.defaultProps = {
  currentStep: 1,
  totalSteps: 3,
  steps: [],
  onStepChange: null,
  showProgress: true,
  addressSelected: false,
  paymentSelected: false
};

export default ProgressBar;