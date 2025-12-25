import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { 
  Eye, EyeOff, Loader2, User, Mail, Phone, Lock, 
  ArrowRight, CheckCircle, Shield, Sparkles, 
  Globe, ShieldCheck, AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signupUser, clearSignupState } from "@/redux/slices/authSlice"

const Signup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get auth state from Redux
  const { 
    signupLoading, 
    signupError, 
    signupSuccess,
    message,
    isAuthenticated 
  } = useSelector((state) => state.auth);
  
  // Local state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Handle password strength
  useEffect(() => {
    if (formData.password) {
      let strength = 0;
      if (formData.password.length >= 6) strength += 25;
      if (/[A-Z]/.test(formData.password)) strength += 25;
      if (/[0-9]/.test(formData.password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [formData.password]);

  // Handle signup success
  useEffect(() => {
    if (signupSuccess) {
      toast({
        title: "Account Created Successfully! 🎉",
        description: message || "Welcome to our community! You will be redirected to login shortly.",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 text-green-900 border-green-200 dark:from-emerald-900/20 dark:to-green-900/20 dark:text-green-100 dark:border-green-800",
        duration: 3000,
      });
      
      // Clear signup state and redirect after 3 seconds
      setTimeout(() => {
        dispatch(clearSignupState());
        navigate("/login");
      }, 3000);
    }
  }, [signupSuccess, message, navigate, dispatch, toast]);

  // Handle signup error
  useEffect(() => {
    if (signupError) {
      toast({
        title: "Registration Failed",
        description: signupError,
        variant: "destructive",
        icon: <AlertCircle className="h-5 w-5" />,
      });
    }
  }, [signupError, toast]);

  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters";
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email address";
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!phoneRegex.test(formData.phone.trim())) {
      newErrors.phone = "Enter a valid phone number (10-15 digits)";
    }
    
    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    } else if (passwordStrength < 50) {
      newErrors.password = "Password is too weak. Include uppercase, numbers, and symbols";
    }
    
    // Terms validation
    if (!acceptedTerms) {
      newErrors.terms = "You must accept the terms and conditions";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      dispatch(signupUser(formData));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength >= 75) return "from-emerald-500 to-green-500";
    if (passwordStrength >= 50) return "from-amber-500 to-orange-500";
    if (passwordStrength >= 25) return "from-rose-500 to-pink-500";
    return "from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-indigo-50/30 to-purple-50/50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 md:p-6 relative overflow-hidden font-sans">
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-60 -right-60 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/5 rounded-full mix-blend-overlay filter blur-3xl animate-float"></div>
        <div className="absolute -bottom-60 -left-60 w-96 h-96 bg-purple-400/10 dark:bg-purple-500/5 rounded-full mix-blend-overlay filter blur-3xl animate-float delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-blue-500/5 to-purple-500/5 dark:from-blue-400/5 dark:to-purple-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/30 dark:bg-blue-300/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${10 + Math.random() * 20}s`,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-lg z-10">
        {/* Success overlay */}
        {signupSuccess && (
          <div className="absolute inset-0 bg-emerald-500/10 dark:bg-emerald-500/5 backdrop-blur-sm rounded-3xl z-20 flex items-center justify-center animate-fadeIn">
            <div className="text-center p-8">
              <CheckCircle className="h-24 w-24 text-emerald-500 dark:text-emerald-400 mx-auto mb-6 animate-scaleIn" />
              <h3 className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 mb-2">
                Redirecting to Login...
              </h3>
              <p className="text-emerald-600 dark:text-emerald-400">
                Your account has been created successfully!
              </p>
            </div>
          </div>
        )}

        {/* Card Container */}
        <div 
          className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-900/20 p-8 md:p-10 border border-white/50 dark:border-gray-700/50 relative overflow-hidden"
        >
          {/* Card background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 dark:from-blue-400/5 dark:to-purple-400/5"></div>
          
          {/* Header */}
          <div className="text-center mb-10 relative z-10">
          </div>

          {/* Form */}
          <form className="space-y-8 relative z-10" onSubmit={handleSubmit}>
            
            {/* Name Input */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </label>
              <div className="relative group">
                <Input
                  placeholder="Enter your full name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={signupLoading || signupSuccess}
                  className={`pl-12 h-14 bg-white/80 dark:bg-gray-800/80 border-2 ${errors.name ? 'border-rose-500 dark:border-rose-400 focus:border-rose-500 dark:focus:border-rose-400' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'} rounded-2xl focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-medium`}
                />
                <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${errors.name ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400'}`} />
              </div>
              {errors.name && (
                <p className="text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2 animate-shake">
                  <AlertCircle className="h-4 w-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <div className="relative group">
                <Input
                  placeholder="your.email@example.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={signupLoading || signupSuccess}
                  className={`pl-12 h-14 bg-white/80 dark:bg-gray-800/80 border-2 ${errors.email ? 'border-rose-500 dark:border-rose-400 focus:border-rose-500 dark:focus:border-rose-400' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'} rounded-2xl focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-medium`}
                />
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${errors.email ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400'}`} />
              </div>
              {errors.email && (
                <p className="text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone Input */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </label>
              <div className="relative group">
                <Input
                  placeholder="+1 (555) 123-4567"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={signupLoading || signupSuccess}
                  className={`pl-12 h-14 bg-white/80 dark:bg-gray-800/80 border-2 ${errors.phone ? 'border-rose-500 dark:border-rose-400 focus:border-rose-500 dark:focus:border-rose-400' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'} rounded-2xl focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-medium`}
                />
                <Phone className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${errors.phone ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400'}`} />
              </div>
              {errors.phone && (
                <p className="text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-4">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Password
              </label>
              <div className="relative group">
                <Input
                  placeholder="Create a strong password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={signupLoading || signupSuccess}
                  className={`pl-12 pr-12 h-14 bg-white/80 dark:bg-gray-800/80 border-2 ${errors.password ? 'border-rose-500 dark:border-rose-400 focus:border-rose-500 dark:focus:border-rose-400' : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'} rounded-2xl focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-300 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 font-medium`}
                />
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors duration-300 ${errors.password ? 'text-rose-500' : 'text-gray-400 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400'}`} />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  disabled={signupLoading || signupSuccess}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              
              {/* Password strength meter */}
              {formData.password && (
                <div className="space-y-2">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${getStrengthColor()} transition-all duration-500 rounded-full`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${passwordStrength >= 25 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>Weak</span>
                    <span className={`font-medium ${passwordStrength >= 50 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>Fair</span>
                    <span className={`font-medium ${passwordStrength >= 75 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>Good</span>
                    <span className={`font-medium ${passwordStrength >= 100 ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>Strong</span>
                  </div>
                </div>
              )}
              
              {errors.password ? (
                <p className="text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.password}
                </p>
              ) : (
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Shield className="h-3 w-3" />
                  Use at least 6 characters with uppercase, numbers, and symbols
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className={`p-5 rounded-2xl transition-all duration-300 ${errors.terms ? 'bg-rose-50/50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800' : 'bg-blue-50/50 dark:bg-gray-800/30 border border-blue-100 dark:border-gray-700'}`}>
              <div className="flex items-start space-x-4">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => {
                    setAcceptedTerms(checked);
                    if (errors.terms) {
                      setErrors(prev => ({ ...prev, terms: "" }));
                    }
                  }}
                  disabled={signupLoading || signupSuccess}
                  className={`mt-1 h-5 w-5 ${acceptedTerms ? 'bg-gradient-to-r from-blue-500 to-purple-600 border-0' : ''}`}
                />
                <div className="space-y-2">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200 cursor-pointer flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    I agree to the Terms & Conditions
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                    By creating an account, you agree to our Terms of Service and Privacy Policy. 
                    We'll never share your personal information without your consent.
                  </p>
                </div>
              </div>
              {errors.terms && (
                <p className="text-rose-600 dark:text-rose-400 text-sm mt-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {errors.terms}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={!acceptedTerms || signupLoading || signupSuccess}
                className={`w-full h-16 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-bold text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:shadow-blue-500/30 dark:hover:shadow-blue-900/30 transition-all duration-500 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden`}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                
                {signupLoading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Creating Your Account...
                  </>
                ) : signupSuccess ? (
                  <>
                    <CheckCircle className="mr-3 h-6 w-6 animate-bounce" />
                    Account Created Successfully!
                  </>
                ) : (
                  <>
                    Get Started
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </Button>
              
              {signupSuccess && (
                <p className="text-center text-emerald-600 dark:text-emerald-400 text-sm mt-4 animate-pulse">
                  Redirecting to login page in 3 seconds...
                </p>
              )}
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-12 pt-8 border-t border-gray-200/70 dark:border-gray-700/70 text-center relative z-10">
            <p className="text-gray-600 dark:text-gray-300 font-medium">
              Already part of our community?{" "}
              <Link
                to="/login"
                className="font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors inline-flex items-center gap-2 group"
              >
                Sign In Now
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500/90 dark:text-gray-400/90 flex items-center justify-center gap-2 font-medium">
            <ShieldCheck className="h-4 w-4" />
            <span className="bg-gradient-to-r from-gray-600 to-gray-400 dark:from-gray-300 dark:to-gray-500 bg-clip-text text-transparent">
              Enterprise-grade security & privacy
            </span>
          </p>
          <p className="text-xs text-gray-400/70 dark:text-gray-500/70 mt-2">
            © {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>

      {/* Add custom animations to global CSS or define inline styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 20s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Signup;