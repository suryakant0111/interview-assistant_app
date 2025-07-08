import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Brain, MessageCircle, RotateCcw, Mic } from "lucide-react";
import Footer from "../Footer";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col relative font-sans">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center relative z-10 px-4 py-16">
        <div className="backdrop-blur-md bg-black/60 rounded-3xl shadow-2xl border border-white/10 max-w-2xl w-full mx-auto p-10 flex flex-col items-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-white leading-tight drop-shadow-lg tracking-tight">
            Ace Your Interviews with Confidence
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-10 max-w-xl mx-auto font-medium">
            Get tailored, human-like answers to job interview questions using AI — trained with your resume and job description.
          </p>
          <Button
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white text-lg px-12 py-4 rounded-xl shadow-xl transition-transform transform hover:scale-105 active:scale-95 font-bold border-0 outline-none focus:ring-4 focus:ring-pink-400/40"
            onClick={() => navigate("/interview")}
            style={{ boxShadow: '0 4px 32px 0 rgba(127,95,255,0.18)' }}
          >
            🚀 Start Interview
          </Button>
        </div>

        {/* Why Interview AI Section */}
        <section className="mt-24 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold mb-10 text-white text-center drop-shadow">
            Why Interview AI?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              {
                icon: <Brain className="w-12 h-12 mx-auto mb-4 text-indigo-400 drop-shadow" />,
                title: "Smart Answers",
                description: "Resume- and JD-aware replies",
              },
              {
                icon: <MessageCircle className="w-12 h-12 mx-auto mb-4 text-purple-400 drop-shadow" />,
                title: "Natural Tone",
                description: "Confident, human-like delivery",
              },
              {
                icon: <RotateCcw className="w-12 h-12 mx-auto mb-4 text-pink-400 drop-shadow" />,
                title: "Context Memory",
                description: "Remembers past questions",
              },
              {
                icon: <Mic className="w-12 h-12 mx-auto mb-4 text-yellow-400 drop-shadow" />,
                title: "Voice Input",
                description: "Ask questions by speaking",
              },
            ].map(({ icon, title, description }, idx) => (
              <Card
                key={idx}
                className="bg-white/5 border border-white/10 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow cursor-default backdrop-blur-md"
              >
                <CardContent className="p-8 text-center">
                  {icon}
                  <h3 className="font-semibold mb-3 text-lg text-white/90 tracking-wide">{title}</h3>
                  <p className="text-base text-white/70 font-medium">{description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* About Section */}
        <section className="mt-24 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-semibold mb-6 text-white text-center drop-shadow">
            About Us
          </h2>
          <p className="text-white/80 leading-relaxed text-center text-lg max-w-xl mx-auto font-medium">
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
