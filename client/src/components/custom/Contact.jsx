import React, { useState } from "react";
import SEO from "@/components/seo/SEO";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin } from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);
    setStatusMessage("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage("✅ Message sent successfully!");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatusMessage(`❌ ${data.error || "Failed to send message"}`);
      }
    } catch (error) {
      console.error("Send email error:", error);
      setStatusMessage("❌ Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with Shree Laxmi Shop for orders, bulk enquiries, and support."
        path="/contact"
      />
    <div className="min-h-screen bg-background py-16 px-6 sm:px-12">
      <div className="max-w-4xl mx-auto bg-card border border-border rounded-2xl shadow-lg p-8 md:p-12">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 dark:text-white mb-8">
          Contact Us
        </h2>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <Mail className="text-primary" />
              <span className="text-gray-700 dark:text-customGray">
                support@shreelaxmishop.com
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Phone className="text-primary" />
              <span className="text-gray-700 dark:text-customGray">
                +91 7410797961
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <MapPin className="text-primary" />
              <span className="text-gray-700 dark:text-customGray">
                PARSHV ELITE BLDG NO.01, BIRWADI ROAD, NEAR RAILWAY PHATAK, UMROLI EAST, Umroli, Palghar, Maharashtra - 401404
              </span>
            </div>
          </div>

          {/* Contact Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                placeholder="Your Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Input
                type="email"
                placeholder="Your Email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <Input
                placeholder="Subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
              />
            </div>
            <div>
              <Textarea
                placeholder="Your Message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Message"}
            </Button>

            {statusMessage && (
              <p className="text-sm text-center mt-2 text-red-500 dark:text-green-400">
                {statusMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default Contact;
