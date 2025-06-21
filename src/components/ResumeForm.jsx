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
    <Card variant="default" className="h-fit">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">📄</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Your Resume</h3>
          </div>
          <div className={`text-xs font-medium ${getCharCountColor()}`}>
            {charCount.toLocaleString()} characters
          </div>
        </div>

        {/* Collapsible Tips */}
        {charCount === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-xs text-blue-700">
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
            className="max-h-32 overflow-y-auto text-sm leading-relaxed"
          />
          
          {/* Status indicator */}
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              charCount === 0 ? 'bg-gray-300' :
              charCount < 100 ? 'bg-orange-400' :
              charCount < 500 ? 'bg-blue-400' :
              'bg-green-400'
            }`}></div>
            <span className="text-xs text-gray-600">{getHelpText()}</span>
          </div>
        </div>

        {/* Quick actions */}
        {!value && (
          <div className="flex gap-2">
            <button
              onClick={() => {
                const template = `John Doe - Software Engineer
5+ years experience in full-stack development
Skills: React, Node.js, Python, AWS
Previous: Senior Developer at TechCorp (2020-2024)
Education: BS Computer Science, State University`;
                onChange({ target: { value: template } });
              }}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              Use Sample
            </button>
          </div>
        )}
      </div>
    </Card>
  );
}