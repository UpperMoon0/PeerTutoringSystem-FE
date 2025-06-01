import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'; 

const PageFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-950 text-gray-400 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Column 1: About/Brand */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-3">TheTutorGroup</h5>
            <p className="text-sm mb-3 text-gray-400">
              Connecting students with quality peer tutors. Empowering learning, one session at a time.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Facebook size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Twitter size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Instagram size={20} /></a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors"><Linkedin size={20} /></a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-3">Quick Links</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-blue-400 transition-colors">Find a Tutor</a></li>
              <li><a href="#" className="hover:text-blue-400 transition-colors">Become a Tutor</a></li>
              <li><a href="/faq" className="hover:text-blue-400 transition-colors">FAQ</a></li>
              <li><a href="/contact" className="hover:text-blue-400 transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-3">Resources</h5>
            <ul className="space-y-2 text-sm">
              <li><a href="/blog" className="hover:text-blue-400 transition-colors">Blog</a></li>
              <li><a href="/terms" className="hover:text-blue-400 transition-colors">Terms of Service</a></li>
              <li><a href="/privacy" className="hover:text-blue-400 transition-colors">Privacy Policy</a></li>
              <li><a href="/sitemap" className="hover:text-blue-400 transition-colors">Sitemap</a></li>
            </ul>
          </div>

          {/* Column 4: Contact Info / Newsletter (Optional) */}
          <div>
            <h5 className="text-lg font-semibold text-white mb-3">Stay Connected</h5>
            <p className="text-sm mb-2 text-gray-400">
              Get updates on new tutors, courses, and special offers.
            </p>
            {/* Basic Newsletter Placeholder */}
            <form className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="bg-gray-900 border border-gray-800 text-white px-3 py-2 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm flex-grow"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-md text-sm"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {currentYear} TheTutorGroup. All rights reserved.</p>
          <p className="mt-1 text-gray-400">Designed to help students succeed.</p>
        </div>
      </div>
    </footer>
  );
};

export default PageFooter;
