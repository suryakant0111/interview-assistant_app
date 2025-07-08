import React, { useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import "highlight.js/styles/github-dark.css";

function CodeBlock({ inline, className, children, ...props }) {
  const codeRef = useRef();
  const handleCopy = () => {
    if (codeRef.current) {
      navigator.clipboard.writeText(codeRef.current.innerText);
      toast.success("Copied to clipboard!");
    }
  };
  return !inline ? (
    <div className="relative group my-4">
      <pre className="rounded-xl bg-black/80 border border-white/10 p-4 overflow-x-auto text-sm font-mono shadow-lg">
        <code ref={codeRef} className={className} {...props}>
          {children}
        </code>
      </pre>
      <button
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-white/10 hover:bg-pink-500/80 text-white rounded-lg p-1.5 shadow-md"
        onClick={handleCopy}
        tabIndex={-1}
        aria-label="Copy code"
        type="button"
      >
        <Copy className="w-4 h-4" />
      </button>
    </div>
  ) : (
    <code className={"px-1 py-0.5 rounded bg-white/10 text-pink-300 font-mono " + (className || "")}>{children}</code>
  );
}

export function AnswerRenderer({ content }) {
  return (
    <ReactMarkdown
      children={content}
      remarkPlugins={[remarkGfm]}
      components={{
        code: CodeBlock,
        pre: ({ node, ...props }) => <div {...props} />,
        a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" className="underline text-green-300 hover:text-green-400 transition" />,
        strong: ({node, ...props}) => <strong className="font-semibold text-green-200" {...props} />,
        h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-green-300 mt-6 mb-3" {...props} />,
        h2: ({node, ...props}) => <h2 className="text-xl font-bold text-green-200 mt-5 mb-2" {...props} />,
        h3: ({node, ...props}) => <h3 className="text-lg font-semibold text-green-100 mt-4 mb-2" {...props} />,
        p: ({node, ...props}) => <div className="mb-4" {...props} />,
        li: ({node, ...props}) => <li className="mb-2 ml-4 list-disc" {...props} />,
      }}
      skipHtml
    />
  );
}

export default AnswerRenderer;