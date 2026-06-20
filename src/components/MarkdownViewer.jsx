import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  vscDarkPlus,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import "../style/markdownview.css";

export const MarkdownViewer = ({ markdownString, darkMode = false }) => {
  if (!markdownString) return null;

  return (
    <div className="markdownContainer">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "bash";

            if (!inline && match) {
              return (
                <div className="codeBlockWrapper">
                  <div className="codeBlockHeader">
                    <span className="languageBadge">{language}</span>
                    <button
                      className="copyButton"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          String(children).replace(/\n$/, ""),
                        );
                      }}
                    >
                      📋 Copy
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={language}
                    style={darkMode ? vscDarkPlus : oneLight}
                    customStyle={{ margin: 0, borderRadius: "0 0 8px 8px" }}
                    showLineNumbers
                    wrapLines
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              );
            }

            return (
              <code className="inlineCode" {...props}>
                {children}
              </code>
            );
          },

          h1: ({ children }) => <h1 className="heading1">{children}</h1>,
          h2: ({ children }) => <h2 className="heading2">{children}</h2>,
          h3: ({ children }) => <h3 className="heading3">{children}</h3>,

          ul: ({ children }) => (
            <ul className="unorderedList">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="orderedList">{children}</ol>
          ),
          li: ({ children }) => <li className="listItem">{children}</li>,

          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="link"
            >
              {children}
            </a>
          ),

          blockquote: ({ children }) => (
            <blockquote className="blockquote">{children}</blockquote>
          ),

          table: ({ children }) => (
            <div className="tableWrapper">
              <table className="table">{children}</table>
            </div>
          ),
        }}
      >
        {markdownString}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownViewer;
