// File: src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, MessageCircle, RotateCcw, Mic } from "lucide-react";
import Footer from "../Footer";

export default function Home() {
  const navigate = useNavigate();

  const logout = () => {
    // Replace with your actual logout logic if needed
    console.log("Logout clicked");
    alert("Logout functionality - integrate with your auth system");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <main className="flex-1 p-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-4 text-black">
            Ace Your Interviews with Confidence
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Get tailored, human-like answers to job interview questions using AI — trained with your resume and job description.
          </p>
          <Button
            className="bg-black text-white hover:bg-gray-800 text-lg px-8 py-3 rounded-md"
            onClick={() => navigate("/interview")}
          >
            🚀 Start Interview
          </Button>
        </div>

        {/* Why Interview AI Section */}
        <section className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-black">Why Interview AI?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Brain className="w-8 h-8 mx-auto mb-3 text-gray-700" />
                <h3 className="font-semibold mb-2 text-black">Smart Answers</h3>
                <p className="text-sm text-gray-600">Resume- and JD-aware replies</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-8 h-8 mx-auto mb-3 text-gray-700" />
                <h3 className="font-semibold mb-2 text-black">Natural Tone</h3>
                <p className="text-sm text-gray-600">Confident, human-like delivery</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <RotateCcw className="w-8 h-8 mx-auto mb-3 text-gray-700" />
                <h3 className="font-semibold mb-2 text-black">Context Memory</h3>
                <p className="text-sm text-gray-600">Remembers past questions</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-200 hover:shadow-md transition-shadow">
              <CardContent className="p-4 text-center">
                <Mic className="w-8 h-8 mx-auto mb-3 text-gray-700" />
                <h3 className="font-semibold mb-2 text-black">Voice Input</h3>
                <p className="text-sm text-gray-600">Ask questions by speaking</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* About Section */}
        <section className="mt-16 max-w-2xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4 text-black">About Us</h2>
          <p className="text-gray-600 leading-relaxed">
            Interview AI Assistant is built to help job seekers practice for real interviews with dynamic,
            personalized answers based on their resume and the job role. We aim to bring confidence and
            precision to your interview preparation.
          </p>
        </section>

        
      </main>
      <Footer />
    </div>
  );
}
