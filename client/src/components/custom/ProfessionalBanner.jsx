import React, { useEffect, useRef, useState } from "react";
import { ChevronRight, ArrowRight, Sparkles, TrendingUp, Shield, Zap } from "lucide-react";

const professionalSliderData = [
  {
    id: 1,
    title: "Enterprise Cloud Solutions",
    subtitle: "Secure, Scalable Infrastructure",
    description: "Transform your business with our enterprise-grade cloud infrastructure. 99.9% uptime guarantee with military-grade security.",
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop",
    stats: [
      { label: "Uptime", value: "99.9%" },
      { label: "Clients", value: "500+" },
      { label: "Security", value: "Tier IV" }
    ],
    cta: "Schedule Demo",
    features: ["AI-Powered Security", "Auto Scaling", "24/7 Support"],
    gradient: "from-blue-900/90 via-gray-900/70 to-transparent",
    accentColor: "text-blue-400",
    badge: {
      text: "Trusted by Fortune 500",
      icon: <Shield className="w-4 h-4" />
    }
  },
  {
    id: 2,
    title: "AI-Powered Analytics",
    subtitle: "Data Intelligence Platform",
    description: "Unlock insights from your data with our machine learning algorithms. Make data-driven decisions in real-time.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop",
    stats: [
      { label: "Processing", value: "Real-time" },
      { label: "Accuracy", value: "98.7%" },
      { label: "Integration", value: "50+" }
    ],
    cta: "View Case Studies",
    features: ["Predictive Analytics", "Custom Dashboards", "API Integration"],
    gradient: "from-purple-900/90 via-gray-900/70 to-transparent",
    accentColor: "text-purple-400",
    badge: {
      text: "Industry Leader",
      icon: <TrendingUp className="w-4 h-4" />
    }
  },
  {
    id: 3,
    title: "Digital Transformation",
    subtitle: "Future-Ready Business Solutions",
    description: "Accelerate your digital journey with our comprehensive suite of tools and expert consultation services.",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&auto=format&fit=crop",
    stats: [
      { label: "ROI", value: "240%" },
      { label: "Deployment", value: "30 Days" },
      { label: "Support", value: "Global" }
    ],
    cta: "Get Started",
    features: ["Strategy Consulting", "Implementation", "Training"],
    gradient: "from-emerald-900/90 via-gray-900/70 to-transparent",
    accentColor: "text-emerald-400",
    badge: {
      text: "Award Winning",
      icon: <Sparkles className="w-4 h-4" />
    }
  }
];

const ProfessionalBanner = () => {
  const [index, setIndex] = useState(0);
  const timeoutRef = useRef(null);

  const next = () => setIndex((i) => (i + 1) % professionalSliderData.length);

  useEffect(() => {
    timeoutRef.current = setInterval(next, 8000);
    return () => clearInterval(timeoutRef.current);
  }, []);

  const slide = professionalSliderData[index];

  return (
    <div className="relative w-full overflow-hidden bg-gray-900 rounded-2xl lg:rounded-3xl shadow-2xl">
      
      {/* Main Banner */}
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        
        {/* Background Image with Parallax Effect */}
        <div className="absolute inset-0">
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover transform scale-105 group-hover:scale-110 transition-transform duration-[30000ms]"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient}`} />
        </div>

        {/* Content Grid Layout */}
        <div className="relative h-full container mx-auto px-6 md:px-12 lg:px-24">
          <div className="h-full grid grid-cols-1 lg:grid-cols-2 items-center gap-12">
            
            {/* Left Column - Text Content */}
            <div className="pt-12 lg:pt-0">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-8">
                {slide.badge.icon}
                <span className="text-sm font-medium text-white">
                  {slide.badge.badge}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                {slide.title.split(' ').map((word, i) => (
                  <span key={i} className="block">
                    <span className={i === 0 ? slide.accentColor : 'text-white'}>
                      {word}
                    </span>
                  </span>
                ))}
              </h1>

              {/* Subtitle */}
              <p className="text-xl md:text-2xl text-gray-300 mb-6 font-light">
                {slide.subtitle}
              </p>

              {/* Description */}
              <p className="text-lg text-gray-400 mb-8 max-w-2xl leading-relaxed">
                {slide.description}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-4 mb-8 max-w-md">
                {slide.stats.map((stat, idx) => (
                  <div key={idx} className="text-center">
                    <div className={`text-3xl font-bold ${slide.accentColor} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-3 mb-8">
                {slide.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg border border-white/10"
                  >
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-white text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="
                  group relative px-8 py-4 bg-white text-gray-900 font-semibold 
                  rounded-lg hover:bg-gray-100 transition-all duration-300
                  flex items-center justify-center gap-2
                ">
                  {slide.cta}
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button className="
                  px-8 py-4 border-2 border-white/30 text-white font-semibold
                  rounded-lg hover:bg-white/10 transition-all duration-300
                ">
                  Learn More
                </button>
              </div>

            </div>

            {/* Right Column - Visual/Graphic (Optional) */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="relative w-64 h-64">
                {/* Abstract visualization or chart graphic */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl blur-xl" />
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col justify-center">
                  <div className="space-y-4">
                    {[75, 90, 60].map((height, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-blue-400" />
                        <div className="flex-1">
                          <div className="flex justify-between text-xs text-gray-400 mb-1">
                            <span>Metric {i + 1}</span>
                            <span>{height}%</span>
                          </div>
                          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                              style={{ width: `${height}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Navigation Dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {professionalSliderData.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all ${
                i === index ? 'bg-white w-8' : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        {/* Logo Strip (Optional - for brand association) */}
        <div className="absolute bottom-8 right-8 hidden xl:block">
          <div className="text-xs text-gray-400 uppercase tracking-wider">
            Trusted by industry leaders
          </div>
        </div>

      </div>

      {/* Floating Notification Bar (Optional) */}
      <div className="absolute top-6 right-6">
        <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              New: AI Assistant Integration
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ProfessionalBanner;