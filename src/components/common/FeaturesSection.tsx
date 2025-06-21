import React from 'react';
import { Video, Calendar, BarChart3, DollarSign, Shield, Clock, Users, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FeaturesSection: React.FC = () => {
  const features = [
    {
      icon: Video,
      title: "Live Video Sessions",
      description: "High-quality video calls with screen sharing, whiteboard tools, and interactive features for immersive learning experiences.",
      highlight: "HD Quality"
    },
    {
      icon: Calendar,
      title: "Flexible Scheduling",
      description: "Book sessions that fit your schedule with easy rescheduling options and automatic calendar integration.",
      highlight: "24/7 Available"
    },
    {
      icon: BarChart3,
      title: "Progress Tracking",
      description: "Monitor your learning journey with detailed analytics, session history, and performance insights.",
      highlight: "Real-time Data"
    },
    {
      icon: DollarSign,
      title: "Affordable Rates",
      description: "Access quality tutoring at student-friendly prices with transparent pricing and no hidden fees.",
      highlight: "From $15/hr"
    },
    {
      icon: Shield,
      title: "Verified Tutors",
      description: "All tutors undergo thorough background checks and academic verification for your safety and quality assurance.",
      highlight: "100% Verified"
    },
    {
      icon: Clock,
      title: "Instant Matching",
      description: "Get matched with the perfect tutor in minutes using our smart algorithm that considers your needs and preferences.",
      highlight: "Under 5 mins"
    },
    {
      icon: Users,
      title: "Peer-to-Peer Learning",
      description: "Learn from fellow students who recently mastered the same concepts you're studying for relatable explanations.",
      highlight: "Student Tutors"
    },
    {
      icon: Award,
      title: "Satisfaction Guarantee",
      description: "Not satisfied with your session? Get a full refund or free replacement session with our satisfaction guarantee.",
      highlight: "100% Guarantee"
    }
  ];

  return (
    <section className="bg-gray-900 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Platform Features & Benefits
          </h2>
          <p className="text-lg text-gray-300 max-w-3xl mx-auto">
            Discover the powerful features that make our peer tutoring platform the preferred choice for students worldwide.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card key={index} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300 group hover:scale-105">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-all duration-300">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-semibold bg-blue-600 text-white px-2 py-1 rounded-full">
                      {feature.highlight}
                    </span>
                  </div>
                  <CardTitle className="text-lg text-white">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Benefits Section */}
        <div className="mt-16 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-2xl p-8 border border-gray-700">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-white mb-2">50K+</div>
              <div className="text-gray-300">Successful Sessions</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">500+</div>
              <div className="text-gray-300">Expert Tutors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white mb-2">98%</div>
              <div className="text-gray-300">Success Rate</div>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-300 mb-6">
            Ready to experience the future of peer tutoring?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 hover:scale-105">
              Start Learning Today
            </button>
            <button className="border border-gray-600 text-gray-300 hover:text-white hover:border-gray-500 px-8 py-3 rounded-lg font-semibold transition-all duration-300">
              Take a Tour
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;