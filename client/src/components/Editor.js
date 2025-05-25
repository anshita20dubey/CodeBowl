import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/dracula.css";
import "codemirror/addon/edit/closetag";
import "codemirror/addon/edit/closebrackets";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/python/python";
import "codemirror/mode/clike/clike"; // For C, C++, C#
import "codemirror/mode/ruby/ruby";
import "codemirror/mode/go/go";
import "codemirror/mode/php/php";
import "codemirror/mode/swift/swift";
import "codemirror/mode/rust/rust";
import "codemirror/mode/r/r";
import "codemirror/mode/sql/sql";
import "codemirror/mode/pascal/pascal";
import "codemirror/mode/shell/shell"; // For bash
import { ACTIONS } from "../Actions";

function Editor({ socketRef, roomId, onCodeChange, language }) {
  const editorRef = useRef(null);

  // Map language to CodeMirror mode
  const languageModes = {
    python3: { name: "python" },
    cpp: { name: "text/x-c++src" },
    c: { name: "text/x-csrc" },
    csharp: { name: "text/x-csharp" },
    java: { name: "text/x-java" },
    nodejs: { name: "javascript", json: true },
    ruby: { name: "ruby" },
    go: { name: "go" },
    scala: { name: "text/x-scala" },
    bash: { name: "shell" },
    sql: { name: "sql" },
    pascal: { name: "pascal" },
    php: { name: "php" },
    swift: { name: "swift" },
    rust: { name: "rust" },
    r: { name: "r" },
  };

  useEffect(() => {
    const init = async () => {
      const editor = CodeMirror.fromTextArea(
        document.getElementById("realtimeEditor"),
        {
          mode: languageModes[language] || { name: "javascript", json: true },
          theme: "dracula",
          autoCloseTags: true,
          autoCloseBrackets: true,
          lineNumbers: true,
        }
      );

      editorRef.current = editor;
      editor.setSize(null, "100%");

      editor.on("change", (instance, changes) => {
        const { origin } = changes;
        const code = instance.getValue();
        onCodeChange(code);
        if (origin !== "setValue") {
          socketRef.current.emit(ACTIONS.CODE_CHANGE, {
            roomId,
            code,
          });
        }
      });
    };

    init();
  }, [language]); // Re-run when language changes

  useEffect(() => {
    if (socketRef.current) {
      socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
        if (code !== null) {
          editorRef.current.setValue(code);
        }
      });
    }
    return () => {
      socketRef.current.off(ACTIONS.CODE_CHANGE);
    };
  }, [socketRef.current]);

  return (
    <div 
      className="editor-container"
      style={{ 
        height: "100%",
        background: "rgba(10, 10, 30, 0.4)",
        backdropFilter: "blur(15px)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "20px",
        padding: "20px",
        margin: "10px",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Decorative glow effect */}
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: "-50%",
          width: "200%",
          height: "200%",
          background: "radial-gradient(circle, rgba(79, 172, 254, 0.05) 0%, transparent 70%)",
          animation: "rotate 20s linear infinite",
          pointerEvents: "none",
          zIndex: 1
        }}
      />
      
      <div style={{ 
        height: "100%", 
        position: "relative", 
        zIndex: 2,
        borderRadius: "15px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.05)"
      }}>
        <textarea id="realtimeEditor" style={{ display: "none" }}></textarea>
      </div>

      <style jsx>{`
        @keyframes rotate {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .editor-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
          border-color: rgba(79, 172, 254, 0.3);
        }
        
        .CodeMirror {
          background: rgba(0, 0, 0, 0.6) !important;
          color: #ffffff !important;
          font-family: 'Fira Code', 'Monaco', 'Menlo', monospace !important;
          font-size: 14px !important;
          line-height: 1.6 !important;
          border-radius: 15px !important;
          height: 100% !important;
        }
        
        .CodeMirror-gutters {
          background: rgba(0, 0, 0, 0.4) !important;
          border-right: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
        
        .CodeMirror-linenumber {
          color: rgba(255, 255, 255, 0.5) !important;
        }
        
        .CodeMirror-cursor {
          border-left: 2px solid #4facfe !important;
          animation: blink 1s ease-in-out infinite alternate;
        }
        
        @keyframes blink {
          0% { opacity: 1; }
          100% { opacity: 0.3; }
        }
        
        .CodeMirror-selected {
          background: rgba(79, 172, 254, 0.2) !important;
        }
        
        .CodeMirror-focused .CodeMirror-selected {
          background: rgba(79, 172, 254, 0.3) !important;
        }
      `}</style>
    </div>
  );
}

export default Editor;