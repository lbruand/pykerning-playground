import React, { useEffect, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useDebounce } from 'use-debounce';
import { usePyodide } from '../contexts/PyodideProvider';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  onExecutionStart: () => void;
  onExecutionSuccess: (pdfData: Uint8Array) => void;
  onExecutionError: (error: string) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  onExecutionStart,
  onExecutionSuccess,
  onExecutionError
}) => {
  const { executePython, isLoading: isPyodideLoading } = usePyodide();
  const [debouncedCode] = useDebounce(code, 1000);

  // Configure extensions
  const extensions = useMemo(() => [python()], []);

  // Auto-execute on code change (debounced)
  useEffect(() => {
    if (debouncedCode && !isPyodideLoading) {
      const execute = async () => {
        onExecutionStart();
        const result = await executePython(debouncedCode);

        if (result.success && result.data) {
          onExecutionSuccess(result.data);
        } else if (result.error) {
          const errorMessage = `${result.error.type}: ${result.error.message}${
            result.error.lineNumber ? ` (line ${result.error.lineNumber})` : ''
          }`;
          onExecutionError(errorMessage);
        }
      };

      execute();
    }
  }, [debouncedCode, executePython, isPyodideLoading, onExecutionStart, onExecutionSuccess, onExecutionError]);

  if (isPyodideLoading) {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#282c34',
        color: '#abb2bf'
      }}>
        <div>
          <h3>Loading Pyodide and pykerning...</h3>
          <p>This may take a few moments...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflow: 'hidden', textAlign: 'left' }}>
      <CodeMirror
        value={code}
        height="100%"
        extensions={extensions}
        onChange={(value) => onChange(value)}
        theme="dark"
        style={{ height: '100%' }}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
