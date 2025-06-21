import React from 'react';
import { Star, TrendingUp, Users, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const SuccessStoriesSection: React.FC = () => {
  const testimonials = [
    {
      name: "Sarah Chen",
      subject: "Calculus",
      grade: "A",
      previousGrade: "C-",
      quote: "My tutor helped me understand complex calculus concepts in a way that finally clicked. I went from struggling to excelling!",
      avatar: "SC"
    },
    {
      name: "Marcus Johnson",
      subject: "Chemistry",
      grade: "A-",
      previousGrade: "D+",
      quote: "The personalized approach and patient explanations made all the difference. Chemistry is now one of my favorite subjects.",
      avatar: "MJ"
    },
    {
      name: "Emily Rodriguez",
      subject: "Computer Science",
      grade: "A+",
      previousGrade: "B",
      quote: "Learning to code seemed impossible until I found the right tutor. Now I'm confident in my programming abilities!",
      avatar: "ER"
    }
  ];

  const stats = [
    {
      icon: TrendingUp,
      value: "94%",
      label: "Grade Improvement",
      description: "of students see better grades"
    },
    {
      icon: Star,
      value: "4.9/5",
      label: "Student Satisfaction",
      description: "average rating from sessions"
    },
    {
      icon: Users,
      value: "10K+",
      label: "Happy Students",
      description: "have found success with us"
    },
    {
      icon: Clock,
      value: "24/7",
      label: "Flexible Scheduling",
      description: "sessions available anytime"
    }
  ];

  return (
    <section className="bg-gray-950 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Success Stories & Results
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            See how our peer tutoring platform has helped thousands of students achieve their academic goals.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-lg font-semibold text-gray-300 mb-1">
                  {stat.label}
                </div>
                <div className="text-sm text-gray-400">
                  {stat.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{testimonial.name}</h4>
                    <p className="text-gray-400 text-sm">{testimonial.subject} Student</p>
                  </div>
                </div>
                
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="ml-2 text-sm text-gray-400">5.0</span>
                </div>
                
                <blockquote className="text-gray-300 italic mb-4 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-red-400 font-semibold text-lg">{testimonial.previousGrade}</div>
                    <div className="text-xs text-gray-500">Before</div>
                  </div>
                  <div className="text-gray-500">→</div>
                  <div className="text-center">
                    <div className="text-green-400 font-semibold text-lg">{testimonial.grade}</div>
                    <div className="text-xs text-gray-500">After</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-300 mb-4">
            Join thousands of students who have transformed their academic performance
          </p>
          <button className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4 hover:underline-offset-2 transition-all duration-200">
            Read More Success Stories →
          </button>
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;