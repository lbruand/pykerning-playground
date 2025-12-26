import React, { useState, useCallback } from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import CodeEditor from './CodeEditor';
import PreviewPane from './PreviewPane';

const DEFAULT_CODE = `import io
from pykerning.fpdf_writer import FpdfWriter

# Create PDF writer (writing to virtual filesystem)
writer = FpdfWriter('/tmp/output.pdf', 210, 297)  # A4 size

# Load font
writer.load_font('/fonts/Roboto-Regular.ttf')

# Simple text rendering
writer.set_font('Roboto', '', 12)
writer.text(20, 20, 'Hello, pykerning!')

writer.close()
`;

export interface PlaygroundState {
  code: string;
  output: {
    type: 'pdf' | 'error' | 'loading' | null;
    data: Uint8Array | string | null;
  };
  isExecuting: boolean;
}

const PlaygroundContainer: React.FC = () => {
  const [code, setCode] = useState<string>(DEFAULT_CODE);
  const [output, setOutput] = useState<PlaygroundState['output']>({
    type: null,
    data: null
  });
  const [isExecuting, setIsExecuting] = useState(false);

  const handleCodeChange = useCallback((newCode: string) => {
    setCode(newCode);
  }, []);

  const handleExecutionStart = useCallback(() => {
    setIsExecuting(true);
    setOutput({ type: 'loading', data: null });
  }, []);

  const handleExecutionSuccess = useCallback((pdfData: Uint8Array) => {
    setIsExecuting(false);
    setOutput({ type: 'pdf', data: pdfData });
  }, []);

  const handleExecutionError = useCallback((errorMessage: string) => {
    setIsExecuting(false);
    setOutput({ type: 'error', data: errorMessage });
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Group orientation="horizontal">
        <Panel defaultSize={50} minSize={30}>
          <CodeEditor
            code={code}
            onChange={handleCodeChange}
            onExecutionStart={handleExecutionStart}
            onExecutionSuccess={handleExecutionSuccess}
            onExecutionError={handleExecutionError}
          />
        </Panel>
        <Separator style={{
          width: '4px',
          background: '#ddd',
          cursor: 'col-resize'
        }} />
        <Panel defaultSize={50} minSize={30}>
          <PreviewPane
            output={output}
            isExecuting={isExecuting}
          />
        </Panel>
      </Group>
    </div>
  );
};

export default PlaygroundContainer;
