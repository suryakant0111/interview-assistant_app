import React from 'react';
import { Card } from './Card';
import { Label } from './Label';

export function JobDescriptionForm({ value, onChange }) {
  return (
    <Card>
      <Label htmlFor="jobDesc">Job Description</Label>
      <textarea
        id="jobDesc"
        value={value}
        onChange={onChange}
        placeholder="Paste the job description or expectations here..."
        rows={8}
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />
    </Card>
  );
}