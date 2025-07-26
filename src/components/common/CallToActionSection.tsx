import React from 'react';
import { UserPlus, GraduationCap, ArrowRight, Star, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CallToActionSection: React.FC = () => {
  const studentBenefits = [
    { icon: GraduationCap, text: "Expert peer tutors" },
    { icon: Clock, text: "Flexible scheduling" },
    { icon: DollarSign, text: "Affordable rates" }
  ];

  const tutorBenefits = [
    { icon: DollarSign, text: "Earn extra income" },
    { icon: Star, text: "Share your knowledge" },
    { icon: UserPlus, text: "Flexible teaching" }
  ];

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Learning Journey?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of students and tutors who are already part of our thriving academic community.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Student CTA */}
          <Card className="bg-gradient-to-br from-primary/50 to-primary/40 border-primary/70 hover:border-primary/60 transition-all duration-300 group">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary/90 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  For Students
                </h3>
                <p className="text-primary/80">
                  Get the academic support you need to succeed
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {studentBenefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div key={index} className="flex items-center text-primary/90">
                      <IconComponent className="w-5 h-5 mr-3 text-primary" />
                      <span>{benefit.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <Button 
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:scale-105 transition-transform duration-300"
                >
                  Find a Tutor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-center text-primary/80 text-sm">
                  Start your first session today • No commitment required
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tutor CTA */}
          <Card className="bg-gradient-to-br from-primary/50 to-primary/40 border-primary/70 hover:border-primary/60 transition-all duration-300 group">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-gradient-to-r from-primary to-primary/90 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <UserPlus className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  For Tutors
                </h3>
                <p className="text-primary/80">
                  Share your knowledge and earn money teaching
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {tutorBenefits.map((benefit, index) => {
                  const IconComponent = benefit.icon;
                  return (
                    <div key={index} className="flex items-center text-primary/90">
                      <IconComponent className="w-5 h-5 mr-3 text-primary" />
                      <span>{benefit.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <Button
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground group-hover:scale-105 transition-transform duration-300"
                >
                  Become a Tutor
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-center text-primary/80 text-sm">
                  Apply now • Earn up to 750,000 VND/hour
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-secondary to-accent rounded-2xl p-8 border border-border">
            <h3 className="text-xl font-semibold text-foreground mb-4">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Our support team is here to help you get started. Book a free consultation or explore our platform with a guided tour.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" size="lg" className="border-border text-muted-foreground hover:text-foreground hover:border-accent">
                Schedule Free Consultation
              </Button>
              <Button variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground">
                Take Platform Tour
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground mb-1">10K+</div>
            <div className="text-muted-foreground text-sm">Active Students</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground mb-1">500+</div>
            <div className="text-muted-foreground text-sm">Qualified Tutors</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground mb-1">50K+</div>
            <div className="text-muted-foreground text-sm">Sessions Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground mb-1">4.9/5</div>
            <div className="text-muted-foreground text-sm">Average Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToActionSection;