import React, { useState } from 'react';
import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import java from 'react-syntax-highlighter/dist/esm/languages/hljs/java';
import js from 'react-syntax-highlighter/dist/esm/languages/hljs/javascript';
import py from 'react-syntax-highlighter/dist/esm/languages/hljs/python';

SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('python', py);
SyntaxHighlighter.registerLanguage('java', java);

export function AnswerRenderer({ content, isStreaming = false }) {
  const [copiedCode, setCopiedCode] = useState(null);

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCode(index);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const parseContent = (text) => {
    const parts = [];
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
          const codeContent = codeLines.join('\n');
          parts.push(
            <div key={`code-${i}`} className="my-8 rounded-2xl overflow-hidden bg-gray-900 shadow-xl border border-gray-800">
              {/* Code header with enhanced styling */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-6 py-4 flex items-center justify-between border-b border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <span className="text-gray-300 text-sm font-medium tracking-wide">
                    {language.toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => copyToClipboard(codeContent, i)}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  {copiedCode === i ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                      </svg>
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <SyntaxHighlighter
                language={language}
                style={atomOneDark}
                customStyle={{
                  margin: 0,
                  padding: '2rem',
                  backgroundColor: '#1a1a1a',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                }}
                wrapLines={true}
                wrapLongLines={true}
              >
                {codeContent}
              </SyntaxHighlighter>
            </div>
          );
        }
        i++; // Skip the closing ```
        continue;
      }

      // Handle headers with better styling
      if (line.startsWith('###')) {
        parts.push(
          <h3 key={`h3-${i}`} className="text-xl font-bold text-gray-900 mt-10 mb-4 pb-2 border-b border-gray-200">
            {line.slice(3).trim()}
          </h3>
        );
      } else if (line.startsWith('##')) {
        parts.push(
          <h2 key={`h2-${i}`} className="text-2xl font-bold text-gray-900 mt-12 mb-5 pb-3 border-b-2 border-blue-200">
            {line.slice(2).trim()}
          </h2>
        );
      } else if (line.startsWith('#')) {
        parts.push(
          <h1 key={`h1-${i}`} className="text-3xl font-bold text-gray-900 mt-12 mb-6 pb-4 border-b-2 border-blue-300">
            {line.slice(1).trim()}
          </h1>
        );
      }
      // Handle bullet points with better styling
      else if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        const listItems = [];
        while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
          const itemText = lines[i].trim().slice(2);
          listItems.push(
            <li key={`li-${i}`} className="mb-3 flex items-start group">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-3 mr-4 flex-shrink-0 group-hover:bg-blue-600 transition-colors"></span>
              <span className="text-gray-800 leading-relaxed text-lg">{formatInlineText(itemText)}</span>
            </li>
          );
          i++;
        }
        if (listItems.length > 0) {
          parts.push(
            <ul key={`ul-${i}`} className="my-6 space-y-2 pl-2">
              {listItems}
            </ul>
          );
        }
        continue;
      }
      // Handle numbered lists with better styling
      else if (/^\d+\.\s/.test(line.trim())) {
        const listItems = [];
        let listIndex = 1;
        while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
          const itemText = lines[i].trim().replace(/^\d+\.\s/, '');
          listItems.push(
            <li key={`oli-${i}`} className="mb-3 flex items-start group">
              <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-500 text-white text-sm font-bold rounded-full mr-4 flex-shrink-0 mt-1 group-hover:bg-blue-600 transition-colors">
                {listIndex}
              </span>
              <span className="text-gray-800 leading-relaxed text-lg">{formatInlineText(itemText)}</span>
            </li>
          );
          listIndex++;
          i++;
        }
        if (listItems.length > 0) {
          parts.push(
            <ol key={`ol-${i}`} className="my-6 space-y-2 pl-2">
              {listItems}
            </ol>
          );
        }
        continue;
      }
      // Handle regular paragraphs with better typography
      else if (line.trim()) {
        parts.push(
          <p key={`p-${i}`} className="text-gray-800 leading-relaxed mb-6 text-lg">
            {formatInlineText(line)}
          </p>
        );
      }
      // Handle empty lines
      else {
        parts.push(<div key={`br-${i}`} className="h-4"></div>);
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
    boldRegex.lastIndex = 0;
    while ((match = highlightRegex.exec(text)) !== null) {
      allMatches.push({ type: 'highlight', match, index: match.index });
    }

    // Find all inline code matches
    highlightRegex.lastIndex = 0;
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
          <span key={`highlight-${i}`} className="bg-yellow-200 text-yellow-900 px-2 py-1 rounded-md font-medium">
            {match[1]}
          </span>
        );
      } else if (type === 'code') {
        elements.push(
          <code key={`code-${i}`} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-base font-mono border">
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
    <div className="max-w-4xl mx-auto">
      {/* Main content container with LLM-style layout */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Content area with proper padding and spacing */}
        <div className="px-8 py-8 lg:px-12 lg:py-10">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-4">
              {parseContent(content)}
              {/* Streaming indicator */}
              {isStreaming && (
                <div className="flex items-center space-x-2 mt-6">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-gray-500 text-sm">Generating response...</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer with metadata or actions */}
        <div className="border-t border-gray-100 bg-gray-50 px-8 py-4 lg:px-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="text-sm">Helpful</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                  <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                </svg>
                <span className="text-sm">Copy</span>
              </button>
            </div>
            <div className="text-xs text-gray-500">
              {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}