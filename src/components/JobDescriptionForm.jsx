import React from 'react';
import { Card } from './Card';
import { Label } from './Label';
import { Textarea } from './Textarea';

export function JobDescriptionForm({ value, onChange }) {
  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-md shadow-xl">
      <Label htmlFor="jobDesc" className="text-white/90">Job Description</Label>
      <Textarea
        id="jobDesc"
        value={value}
        onChange={onChange}
        placeholder="Paste the job description or expectations here..."
        rows={8}
        variant="dark"
        className="w-full p-3 rounded-xl"
      />
    </Card>
  );
}