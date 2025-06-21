import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, MessageCircle, RotateCcw, Mic } from "lucide-react";
import Footer from "../Footer";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <main className="flex-1 p-6 text-center flex flex-col justify-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 text-black leading-tight">
            Ace Your Interviews with Confidence
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-2xl mx-auto">
            Get tailored, human-like answers to job interview questions using AI — trained with your resume and job description.
          </p>
          <Button
            className="bg-black text-white hover:bg-gray-800 text-lg px-10 py-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 active:scale-95"
            onClick={() => navigate("/interview")}
          >
            🚀 Start Interview
          </Button>
        </div>

        {/* Why Interview AI Section */}
        <section className="mt-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold mb-10 text-black text-center">
            Why Interview AI?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Brain className="w-10 h-10 mx-auto mb-4 text-indigo-600" />,
                title: "Smart Answers",
                description: "Resume- and JD-aware replies",
              },
              {
                icon: <MessageCircle className="w-10 h-10 mx-auto mb-4 text-indigo-600" />,
                title: "Natural Tone",
                description: "Confident, human-like delivery",
              },
              {
                icon: <RotateCcw className="w-10 h-10 mx-auto mb-4 text-indigo-600" />,
                title: "Context Memory",
                description: "Remembers past questions",
              },
              {
                icon: <Mic className="w-10 h-10 mx-auto mb-4 text-indigo-600" />,
                title: "Voice Input",
                description: "Ask questions by speaking",
              },
            ].map(({ icon, title, description }, idx) => (
              <Card
                key={idx}
                className="border border-gray-200 hover:shadow-lg transition-shadow rounded-xl cursor-default"
              >
                <CardContent className="p-6 text-center">
                  {icon}
                  <h3 className="font-semibold mb-3 text-lg text-black">{title}</h3>
                  <p className="text-sm text-gray-600">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="mt-20 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold mb-6 text-black text-center">
            About Us
          </h2>
          <p className="text-gray-700 leading-relaxed text-center text-base md:text-lg max-w-xl mx-auto">
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
