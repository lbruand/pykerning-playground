export interface PyodideInterface {
  runPythonAsync(code: string): Promise<any>;
  runPython(code: string): any;
  loadPackage(packages: string | string[]): Promise<void>;
  pyimport(pkg: string): any;
  globals: any;
  FS: {
    writeFile(path: string, data: Uint8Array): void;
    readFile(path: string, options?: { encoding?: string }): Uint8Array;
    mkdir(path: string): void;
    rmdir(path: string): void;
  };
}

export interface ExecutionResult {
  success: boolean;
  data?: Uint8Array;
  error?: PythonError;
}

export interface PythonError {
  message: string;
  type: string;
  lineNumber?: number;
  traceback?: string;
}

declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}
