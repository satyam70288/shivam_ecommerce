// ForgotPassword.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle email submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        { email }
      );

      if (response.data.success) {
        setSuccess("Password reset link has been sent to your email");
      } else {
        setError(response.data.message || "Failed to send reset link");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md rounded-xl shadow-lg">
        {/* Header */}
        <div className="bg-blue-600 p-6 text-center rounded-t-xl">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password</h1>
          <p className="text-white/90 mt-2">
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Form */}
        <div className="p-6">
          {/* Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-600 font-medium">{success}</p>
                <p className="text-xs text-green-600 mt-1">
                  Check your email and click the reset link
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm">
              We'll send you a link to reset your password. This link will expire in 1 hour.
            </p>
          </div>

          {/* Email Input */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10 h-11"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={loading || !email}
              className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending Reset Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>

            {/* Try Different Email Button */}
            {success && (
              <Button
                variant="outline"
                onClick={() => {
                  setSuccess("");
                  setEmail("");
                }}
                className="w-full h-11"
              >
                Try Different Email
              </Button>
            )}
          </div>

          {/* Back to Login */}
          <div className="mt-8 pt-6 border-t text-center">
            <p className="text-gray-600 text-sm">
              Remember your password?{" "}
              <Link 
                to="/login" 
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Back to Login
              </Link>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;