import React, { useState, useMemo, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker using jsdelivr CDN with correct MIME type
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdfData: Uint8Array;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ pdfData }) => {
  console.log('PDFViewer render - pdfData:', pdfData);
  console.log('PDFViewer render - pdfData length:', pdfData?.length);
  console.log('PDFViewer render - pdfData type:', pdfData?.constructor?.name);

  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  // Convert Uint8Array to format react-pdf expects
  // Create a copy to prevent react-pdf from mutating the original
  const pdfFile = useMemo(() => {
    console.log('Creating pdfFile memo with data length:', pdfData?.length);
    return { data: new Uint8Array(pdfData) };
  }, [pdfData]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    console.log('PDF loaded successfully, pages:', numPages);
    setNumPages(numPages);
    setPageNumber(1);
  }

  function onDocumentLoadError(error: Error) {
    console.error('Error loading PDF:', error);
    console.error('PDF data length:', pdfData?.length);
    console.error('PDF data first bytes:', pdfData?.slice(0, 10));
  }

  const downloadPDF = useCallback(() => {
    console.log('Download button clicked');
    console.log('PDF data:', pdfData);
    console.log('PDF data length:', pdfData?.length);

    try {
      const blob = new Blob([pdfData], { type: 'application/pdf' });
      console.log('Blob created:', blob);

      const url = URL.createObjectURL(blob);
      console.log('Object URL created:', url);

      const link = document.createElement('a');
      link.href = url;
      link.download = 'pykerning-output.pdf';
      link.style.display = 'none';

      document.body.appendChild(link);
      console.log('Link appended to body');

      link.click();
      console.log('Link clicked');

      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        console.log('Cleanup completed');
      }, 100);
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  }, [pdfData]);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#525659'
    }}>
      {/* Toolbar */}
      <div style={{
        padding: '8px 16px',
        background: '#323639',
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        borderBottom: '1px solid #222'
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
            disabled={pageNumber <= 1}
            style={{
              padding: '4px 12px',
              background: pageNumber <= 1 ? '#555' : '#fff',
              color: pageNumber <= 1 ? '#999' : '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer'
            }}
          >
            Previous
          </button>
          <span>
            Page {pageNumber} of {numPages}
          </span>
          <button
            onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
            disabled={pageNumber >= numPages}
            style={{
              padding: '4px 12px',
              background: pageNumber >= numPages ? '#555' : '#fff',
              color: pageNumber >= numPages ? '#999' : '#000',
              border: 'none',
              borderRadius: '4px',
              cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer'
            }}
          >
            Next
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            style={{
              padding: '4px 12px',
              background: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            -
          </button>
          <span>{Math.round(scale * 100)}%</span>
          <button
            onClick={() => setScale(Math.min(3, scale + 0.1))}
            style={{
              padding: '4px 12px',
              background: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            +
          </button>
        </div>

        <button
          onClick={downloadPDF}
          style={{
            padding: '4px 12px',
            background: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Download PDF
        </button>
      </div>

      {/* PDF Display */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div style={{ color: '#fff' }}>Loading PDF...</div>
          }
          error={
            <div style={{ color: '#fc8181' }}>Failed to load PDF</div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={false}
            renderAnnotationLayer={false}
          />
        </Document>
      </div>
    </div>
  );
};

export default PDFViewer;
