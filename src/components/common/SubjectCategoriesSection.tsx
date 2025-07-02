import React from 'react';
import { Calculator, Microscope, Globe, Monitor, TrendingUp, Palette, Music, Beaker } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const SubjectCategoriesSection: React.FC = () => {
  const subjects = [
    {
      icon: Calculator,
      title: "Mathematics",
      description: "Algebra, Calculus, Statistics, Geometry",
    },
    {
      icon: Beaker,
      title: "Science",
      description: "Physics, Chemistry, Biology, Earth Science",
    },
    {
      icon: Globe,
      title: "Languages",
      description: "English, Spanish, French, Mandarin",
    },
    {
      icon: Monitor,
      title: "Computer Science",
      description: "Programming, Web Development, Data Science",
    },
    {
      icon: TrendingUp,
      title: "Business",
      description: "Economics, Finance, Marketing, Management",
    },
    {
      icon: Palette,
      title: "Arts & Design",
      description: "Graphic Design, Fine Arts, Digital Media",
    },
    {
      icon: Music,
      title: "Music",
      description: "Theory, Composition, Instruments, Production",
    },
    {
      icon: Microscope,
      title: "Research",
      description: "Academic Writing, Research Methods, Analysis",
    }
  ];

  return (
    <section className="bg-card-secondary py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Popular Subject Categories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore our wide range of subjects taught by experienced peer tutors who excel in their fields.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {subjects.map((subject, index) => {
            const IconComponent = subject.icon;
            return (
              <Card key={index} className="bg-card border-border hover:bg-card-tertiary transition-all duration-300 cursor-pointer group hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary/90 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:shadow-lg transition-all duration-300">
                    <IconComponent className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {subject.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {subject.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-6">
            Don't see your subject? We have tutors for many more areas of study.
          </p>
          <button className="text-primary hover:text-primary/80 font-medium underline underline-offset-4 hover:underline-offset-2 transition-all duration-200">
            View All Subjects →
          </button>
        </div>
      </div>
    </section>
  );
};

export default SubjectCategoriesSection;