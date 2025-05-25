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
    java: { name: "text/x-java" }, // ✅ Added Java
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
    <div style={{ height: "600px" }}>
      <textarea id="realtimeEditor"></textarea>
    </div>
  );
}

export default Editor;