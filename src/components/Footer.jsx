import React from "react";

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <div className="w-4 h-4 bg-black rounded-sm"></div>
            </div>
            <span className="text-xl font-semibold">Interview AI</span>
          </div>
          
          {/* Navigation Links */}
          <div className="flex space-x-8 text-gray-300">
            <a href="#" className="hover:text-white transition-colors duration-200">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Contact</a>
            <a href="#" className="hover:text-white transition-colors duration-200">Support</a>
          </div>
        </div>
        
        {/* Divider */}
        <div className="border-t border-gray-800 my-6"></div>
        
        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0 text-sm text-gray-400">
          <div>
            © {new Date().getFullYear()} Interview AI Assistant. All rights reserved.
          </div>
          <div className="flex items-center space-x-1">
            <span>Design and Developed by</span>
            <a 
              href="#" 
              className="text-white font-medium hover:text-gray-300 transition-colors duration-200"
            >
              Suryakant Khevji
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}