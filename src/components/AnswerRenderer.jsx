import React from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import py from 'react-syntax-highlighter/dist/esm/languages/hljs/python';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('python', py);
SyntaxHighlighter.registerLanguage('java', java);

export function AnswerRenderer({ content }) {
  const parseContent = (text) => {
    const parts = [];
    let currentIndex = 0;

    // Process the text line by line to handle different markdown elements
    const lines = text.split('\n');
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];

      // Handle code blocks
      if (line.startsWith('```')) {
        const language = line.slice(3).trim() || 'text';
        const codeLines = [];
        i++; // Skip the opening ```

        while (i < lines.length && !lines[i].startsWith('```')) {
          codeLines.push(lines[i]);
          i++;
        }

        if (codeLines.length > 0) {
          parts.push(
            <div key={`code-${i}`} className="my-6 rounded-xl overflow-hidden shadow-lg border border-gray-200">
              {/* Code header */}
              <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
                <span className="text-gray-300 text-xs font-mono uppercase tracking-wider">
                  {language}
                </span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
              </div>
              <SyntaxHighlighter
                language={language}
                style={atomOneDark}
                customStyle={{
                  margin: 0,
                  padding: '1.5rem',
                  backgroundColor: '#1e1e1e',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                }}
              >
                {codeLines.join('\n')}
              </SyntaxHighlighter>
            </div>
          );
        }
        i++; // Skip the closing ```
        continue;
      }

      // Handle headers
      if (line.startsWith('###')) {
        parts.push(
          <h3 key={`h3-${i}`} className="text-lg font-bold text-gray-800 mt-6 mb-3 border-b border-gray-200 pb-2">
            {line.slice(3).trim()}
          </h3>
        );
      } else if (line.startsWith('##')) {
        parts.push(
          <h2 key={`h2-${i}`} className="text-xl font-bold text-gray-800 mt-8 mb-4 border-b-2 border-blue-200 pb-2">
            {line.slice(2).trim()}
          </h2>
        );
      } else if (line.startsWith('#')) {
        parts.push(
          <h1 key={`h1-${i}`} className="text-2xl font-bold text-gray-800 mt-8 mb-4 border-b-2 border-blue-300 pb-3">
            {line.slice(1).trim()}
          </h1>
        );
      }
      // Handle bullet points
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const listItems = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          const itemText = lines[i].trim().slice(2);
          listItems.push(
            <li key={`li-${i}`} className="mb-2 flex items-start">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              <span className="text-gray-700 leading-relaxed">{formatInlineText(itemText)}</span>
            </li>
          );
          i++;
        }
        if (listItems.length > 0) {
          parts.push(
            <ul key={`ul-${i}`} className="my-4 space-y-1">
              {listItems}
            </ul>
          );
        }
        continue;
      }
      // Handle numbered lists
      else if (/^\d+\.\s/.test(line.trim())) {
        const listItems = [];
        let listIndex = 1;
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          const itemText = lines[i].trim().replace(/^\d+\.\s/, '');
          listItems.push(
            <li key={`oli-${i}`} className="mb-2 flex items-start">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-500 text-white text-sm font-bold rounded-full mr-3 flex-shrink-0 mt-0.5">
                {listIndex}
              </span>
              <span className="text-gray-700 leading-relaxed">{formatInlineText(itemText)}</span>
            </li>
          );
          listIndex++;
          i++;
        }
        if (listItems.length > 0) {
          parts.push(
            <ol key={`ol-${i}`} className="my-4 space-y-1">
              {listItems}
            </ol>
          );
        }
        continue;
      }
      // Handle regular paragraphs
      else if (line.trim()) {
        parts.push(
          <p key={`p-${i}`} className="text-gray-700 leading-relaxed mb-4 text-base">
            {formatInlineText(line)}
          </p>
        );
      }
      // Handle empty lines
      else {
        parts.push(<div key={`br-${i}`} className="h-2"></div>);
      }

      i++;
    }

    return parts;
  };

  const formatInlineText = (text) => {
    // Handle bold text with **
    const boldRegex = /\*\*(.*?)\*\*/g;
    // Handle highlights with [[highlight]]
    const highlightRegex = /\[\[highlight\]\](.*?)\[\[\/highlight\]\]/g;
    // Handle inline code with `
    const inlineCodeRegex = /`([^`]+)`/g;

    let formattedText = text;
    const elements = [];
    let lastIndex = 0;

    // Process all patterns
    const allMatches = [];
    
    // Find all bold matches
    let match;
    while ((match = boldRegex.exec(text)) !== null) {
      allMatches.push({ type: 'bold', match, index: match.index });
    }
    
    // Find all highlight matches
    boldRegex.lastIndex = 0; // Reset regex
    while ((match = highlightRegex.exec(text)) !== null) {
      allMatches.push({ type: 'highlight', match, index: match.index });
    }

    // Find all inline code matches
    highlightRegex.lastIndex = 0; // Reset regex
    while ((match = inlineCodeRegex.exec(text)) !== null) {
      allMatches.push({ type: 'code', match, index: match.index });
    }

    // Sort matches by index
    allMatches.sort((a, b) => a.index - b.index);

    // Process matches in order
    allMatches.forEach(({ type, match }, i) => {
      // Add text before this match
      if (match.index > lastIndex) {
        elements.push(text.slice(lastIndex, match.index));
      }

      // Add the formatted element
      if (type === 'bold') {
        elements.push(
          <strong key={`bold-${i}`} className="font-semibold text-gray-900">
            {match[1]}
          </strong>
        );
      } else if (type === 'highlight') {
        elements.push(
          <span key={`highlight-${i}`} className="bg-yellow-200 text-yellow-900 px-1 py-0.5 rounded font-medium">
            {match[1]}
          </span>
        );
      } else if (type === 'code') {
        elements.push(
          <code key={`code-${i}`} className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-mono">
            {match[1]}
          </code>
        );
      }

      lastIndex = match.index + match[0].length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      elements.push(text.slice(lastIndex));
    }

    return elements.length > 0 ? elements : text;
  };

  return (
    <div className="prose prose-sm max-w-none">
      <div className="space-y-2">
        {parseContent(content)}
      </div>
    </div>
  );
}