import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { loginUser, clearLoginState } from "@/redux/slices/authSlice";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  Loader2, 
  ArrowRight,
  Shield,
  LogIn,
  CheckCircle
} from "lucide-react";

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { 
    loginLoading, 
    loginError, 
    isAuthenticated 
  } = useSelector((state) => state.auth);
  
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // Handle login success
  useEffect(() => {
    if (isAuthenticated) {
      toast({
        title: "Welcome Back! 🎉",
        description: "Successfully logged in",
        className: "bg-gradient-to-r from-green-50 to-emerald-50 text-green-900 border-green-200 dark:from-emerald-900/20 dark:to-green-900/20 dark:text-emerald-100 dark:border-emerald-800",
      });
    }
  }, [isAuthenticated, toast]);

  // Handle login error
  useEffect(() => {
    if (loginError) {
      toast({
        title: "Login Failed",
        description: loginError,
        variant: "destructive",
        className: "dark:bg-red-900/90 dark:text-red-100 dark:border-red-800",
      });
    }
  }, [loginError, toast]);

  // Clear login state on unmount
  useEffect(() => {
    return () => {
      dispatch(clearLoginState());
    };
  }, [dispatch]);

  // Load saved credentials if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  const validateForm = () => {
    const newErrors = {};
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email.trim())) {
      newErrors.email = "Please enter a valid email";
    }
    
    // Password validation
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.trim().length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem('rememberedEmail', formData.email);
      } else {
        localStorage.removeItem('rememberedEmail');
      }
      
      dispatch(loginUser(formData));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4 transition-colors duration-300">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] dark:bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:40px_40px] transition-opacity duration-300"></div>
      </div>

      <div className="w-full max-w-md z-10">
        {/* Success Overlay */}
        {isAuthenticated && (
          <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 flex items-center justify-center z-50 transition-all duration-300">
            <div className="text-center p-8">
              <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-12 w-12 text-white animate-bounce" />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-3">
                Welcome Back! 🎉
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Redirecting to dashboard...
              </p>
              <div className="w-48 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-500 to-emerald-600 animate-progress"></div>
              </div>
            </div>
          </div>
        )}

        {/* Card Container */}
        <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/30 p-8 border border-gray-100 dark:border-gray-800 transition-all duration-300">
          
          {/* Header */}
          <div className="text-center mb-8">
            
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 transition-colors duration-300">
              Welcome Back
            </h1>
            <p className="text-gray-500 dark:text-gray-400 transition-colors duration-300">
              Sign in to continue your journey
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            {/* Email Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                Email Address
              </label>
              <div className="relative group">
                <Input
                  placeholder="you@example.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={loginLoading}
                  className={`pl-10 h-12 bg-white dark:bg-gray-800 ${
                    errors.email 
                      ? 'border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'
                  } focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 
                    text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                    transition-all duration-300 disabled:opacity-50`}
                />
                <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 
                               ${errors.email 
                                 ? 'text-red-500 dark:text-red-400' 
                                 : 'text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400'
                               } transition-colors duration-300`} />
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 transition-colors duration-300">
                  ⚠️ {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-300"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative group">
                <Input
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={loginLoading}
                  className={`pl-10 pr-10 h-12 bg-white dark:bg-gray-800 ${
                    errors.password 
                      ? 'border-red-500 focus:border-red-500 dark:border-red-500 dark:focus:border-red-500' 
                      : 'border-gray-300 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400'
                  } focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20
                    text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
                    transition-all duration-300 disabled:opacity-50`}
                />
                <Lock className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 
                                ${errors.password 
                                  ? 'text-red-500 dark:text-red-400' 
                                  : 'text-gray-400 dark:text-gray-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400'
                                } transition-colors duration-300`} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loginLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 
                           dark:hover:text-blue-400 transition-colors duration-300 disabled:opacity-50 p-1 rounded"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1 transition-colors duration-300">
                  ⚠️ {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={loginLoading}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 
                           text-blue-600 dark:text-blue-500 
                           focus:ring-blue-500 dark:focus:ring-blue-400 
                           bg-white dark:bg-gray-800 
                           transition-colors duration-300"
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer transition-colors duration-300"
                >
                  Remember me
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loginLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 
                       hover:from-blue-700 hover:to-purple-700 
                       dark:from-blue-500 dark:to-purple-500 
                       dark:hover:from-blue-600 dark:hover:to-purple-600
                       text-white font-medium rounded-lg 
                       shadow-lg hover:shadow-xl dark:shadow-purple-500/20
                       transition-all duration-300 
                       disabled:opacity-50 disabled:cursor-not-allowed 
                       relative overflow-hidden group"
            >
              {/* Shine effect */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full 
                            transition-transform duration-1000 
                            bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              
              {loginLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </Button>

            {/* Signup Link */}
            <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300">
              <p className="text-gray-600 dark:text-gray-400 text-sm transition-colors duration-300">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 
                           transition-colors duration-300 inline-flex items-center gap-1 group"
                >
                  Create Account
                  <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </p>
            </div>
          </form>

          {/* Security Note */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 transition-colors duration-300">
            <Shield className="h-3 w-3" />
            <span>Secure & encrypted login</span>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400 dark:text-gray-500 transition-colors duration-300">
            By signing in, you agree to our Terms and Privacy Policy
          </p>
        </div>
      </div>

      {/* Custom animations */}
      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        .animate-progress {
          animation: progress 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Login;