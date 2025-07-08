import React, { useState } from 'react';
import { Card } from './Card';
import { Label } from './Label';
import { Textarea } from './Textarea';

export function ResumeForm({ value, onChange }) {
  const [charCount, setCharCount] = useState(value?.length || 0);

  const handleChange = (e) => {
    setCharCount(e.target.value.length);
    onChange(e);
  };

  const getCharCountColor = () => {
    if (charCount === 0) return 'text-gray-400';
    if (charCount < 100) return 'text-orange-500';
    if (charCount < 500) return 'text-blue-500';
    return 'text-green-500';
  };

  const getHelpText = () => {
    if (charCount === 0) return 'Start by pasting your resume or writing a summary';
    if (charCount < 100) return 'Add more details about your experience and skills';
    if (charCount < 500) return 'Good! You can add more specific achievements';
    return 'Excellent! Your resume content looks comprehensive';
  };

  return (
    <Card variant="default" className="h-fit bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pink-500/20 rounded-lg flex items-center justify-center">
              <span className="text-pink-400 font-semibold text-sm">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-white/90">Your Resume</h3>
          </div>
          <div className={`text-xs font-medium ${getCharCountColor()}`}>
            {charCount.toLocaleString()} characters
          </div>
        </div>

        {/* Collapsible Tips */}
        {charCount === 0 && (
          <div className="bg-pink-500/10 border border-pink-400/20 rounded-lg p-3">
            <div className="text-xs text-pink-300">
              💡 Include: work experience, skills, education, achievements
            </div>
          </div>
        )}

        {/* Textarea */}
        <div className="space-y-2">
          <Textarea
            value={value}
            onChange={handleChange}
            placeholder="Paste your resume or write a summary of your experience..."
            rows={4}
            autoResize={false}
            variant="dark"
            className="max-h-32 overflow-y-auto text-sm leading-relaxed"
          />
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              charCount === 0 ? 'bg-gray-700' :
              charCount < 100 ? 'bg-orange-400' :
              charCount < 500 ? 'bg-pink-400' :
              'bg-green-400'
            }`}></div>
            <span className="text-xs text-white/60">{getHelpText()}</span>
          </div>
        </div>

        {/* Quick actions */}
        {!value && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const template = `John Doe - Software Engineer\n5+ years experience in full-stack development\nSkills: React, Node.js, Python, AWS\nPrevious: Senior Developer at TechCorp (2020-2024)\nEducation: BS Computer Science, State University`;
                onChange({ target: { value: template } });
              }}
              className="text-xs text-pink-400 hover:text-pink-300 underline"
            >
              Use Sample
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}