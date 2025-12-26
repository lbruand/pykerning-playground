import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { PyodideInterface, ExecutionResult } from '../types/pyodide';

interface PyodideContextValue {
  pyodide: PyodideInterface | null;
  isLoading: boolean;
  error: Error | null;
  executePython: (code: string) => Promise<ExecutionResult>;
}

const PyodideContext = createContext<PyodideContextValue | undefined>(undefined);

export const usePyodide = () => {
  const context = useContext(PyodideContext);
  if (!context) {
    throw new Error('usePyodide must be used within PyodideProvider');
  }
  return context;
};

interface PyodideProviderProps {
  children: ReactNode;
}

export const PyodideProvider: React.FC<PyodideProviderProps> = ({ children }) => {
  const [pyodide, setPyodide] = useState<PyodideInterface | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function initPyodide() {
      try {
        setIsLoading(true);

        // Load Pyodide from CDN
        const pyodideInstance = await window.loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
        });

        // Load micropip for package installation
        await pyodideInstance.loadPackage('micropip');
        const micropip = pyodideInstance.pyimport('micropip');

        // Install pykerning from GitHub-hosted wheel
        await micropip.install(
          'https://cdn.jsdelivr.net/gh/lbruand/pykerning@main/dist/pykerning-0.2.0-py3-none-any.whl'
        );

        // Set up virtual filesystem for fonts
        try {
          pyodideInstance.FS.mkdir('/fonts');
        } catch (e) {
          // Directory might already exist
          console.log('Fonts directory already exists or error creating it:', e);
        }

        // Load and mount all font files from public/fonts
        const fontFiles = [
          'GenBasB.ttf',
          'GenBasI.ttf',
          'GenBasR.ttf',
          'Roboto-Regular.ttf'
        ];

        for (const fontFile of fontFiles) {
          try {
            const fontResponse = await fetch(`/fonts/${fontFile}`);
            const fontBuffer = await fontResponse.arrayBuffer();
            const fontData = new Uint8Array(fontBuffer);
            pyodideInstance.FS.writeFile(`/fonts/${fontFile}`, fontData);
            console.log(`Font loaded successfully: ${fontFile}`);
          } catch (e) {
            console.error(`Failed to load font ${fontFile}:`, e);
          }
        }

        setPyodide(pyodideInstance);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Pyodide:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsLoading(false);
      }
    }

    initPyodide();
  }, []);

  const executePython = useCallback(async (code: string): Promise<ExecutionResult> => {
    if (!pyodide) {
      return {
        success: false,
        error: {
          message: 'Pyodide is not initialized',
          type: 'SystemError'
        }
      };
    }

    try {
      // Wrap user code to capture PDF output
      // We'll use Pyodide's virtual filesystem approach since BytesIO support is uncertain
      const wrappedCode = `
import io
import sys

# User code
${code}

# The user code should have created a FpdfWriter and called close()
# We'll read the PDF from the virtual filesystem if it was written to a file
`;

      await pyodide.runPythonAsync(wrappedCode);

      // Try to read the PDF from a common output path
      // The user's code should write to '/tmp/output.pdf' or similar
      let pdfBytes: Uint8Array;

      try {
        pdfBytes = pyodide.FS.readFile('/tmp/output.pdf');
        console.log('PDF read from filesystem, size:', pdfBytes.length, 'bytes');
        console.log('PDF header:', pdfBytes.slice(0, 10));
      } catch (e) {
        // If reading from /tmp fails, return an error
        console.error('Failed to read PDF from /tmp/output.pdf:', e);
        return {
          success: false,
          error: {
            message: 'No PDF output found. Make sure your code writes to "/tmp/output.pdf"',
            type: 'OutputError'
          }
        };
      }

      return {
        success: true,
        data: pdfBytes
      };
    } catch (err: any) {
      // Parse Python error
      const errorMessage = err.message || String(err);
      const traceback = err.stack || '';

      // Try to extract line number from traceback
      const lineMatch = traceback.match(/line (\d+)/);
      const lineNumber = lineMatch ? parseInt(lineMatch[1], 10) : undefined;

      return {
        success: false,
        error: {
          message: errorMessage,
          type: err.name || 'PythonError',
          lineNumber,
          traceback
        }
      };
    }
  }, [pyodide]);

  const value: PyodideContextValue = {
    pyodide,
    isLoading,
    error,
    executePython
  };

  return (
    <PyodideContext.Provider value={value}>
      {children}
    </PyodideContext.Provider>
  );
};
