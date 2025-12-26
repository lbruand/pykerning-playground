import React from 'react';
import PDFViewer from './PDFViewer';
import type { PlaygroundState } from './PlaygroundContainer';

interface PreviewPaneProps {
  output: PlaygroundState['output'];
  isExecuting: boolean;
}

const PreviewPane: React.FC<PreviewPaneProps> = ({ output, isExecuting }) => {
  if (isExecuting || output.type === 'loading') {
    return (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#fafafa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p>Executing Python code...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (output.type === 'error') {
    return (
      <div style={{
        height: '100%',
        padding: '20px',
        background: '#fff5f5',
        overflow: 'auto'
      }}>
        <div style={{
          border: '1px solid #fc8181',
          borderRadius: '4px',
          padding: '16px',
          background: '#fff'
        }}>
          <h3 style={{ margin: '0 0 12px 0', color: '#c53030' }}>Error</h3>
          <pre style={{
            margin: 0,
            fontFamily: 'monospace',
            fontSize: '14px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            {output.data as string}
          </pre>
        </div>
      </div>
    );
  }

  if (output.type === 'pdf' && output.data) {
    return <PDFViewer pdfData={output.data as Uint8Array} />;
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fafafa',
      color: '#999'
    }}>
      <div style={{ textAlign: 'center' }}>
        <p>Your PDF output will appear here</p>
        <p style={{ fontSize: '12px' }}>Write Python code using pykerning to generate a PDF</p>
      </div>
    </div>
  );
};

export default PreviewPane;
