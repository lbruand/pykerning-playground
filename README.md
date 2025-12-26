# Pykerning Playground

A browser-based interactive playground for [pykerning](https://github.com/lbruand/pykerning), a Python typesetting library that implements the Knuth-Plass line breaking algorithm.

## What is this?

Pykerning Playground is a web application similar to the [Typst playground](https://typst.app/play/) that allows you to write Python code using the pykerning library and see the generated PDF output in real-time, all in your browser.

## Features

- **In-Browser Python Execution**: Runs Python code directly in the browser using [Pyodide](https://pyodide.org/)
- **Real-Time Preview**: Automatically executes your code and updates the PDF preview as you type (with 1-second debouncing)
- **Code Editor**: Powered by [CodeMirror 6](https://codemirror.net/) with:
  - Python syntax highlighting
  - Line numbers
  - Auto-completion
  - Error highlighting
- **PDF Viewer**: Live preview of generated PDFs with:
  - Page navigation (for multi-page documents)
  - Zoom controls
  - Canvas-based rendering via [PDF.js](https://mozilla.github.io/pdf.js/)
- **Split Pane Layout**: Resizable editor and preview panels
- **Pre-loaded Fonts**: Includes Gentium Basic (Regular, Bold, Italic) and Roboto fonts

## Technology Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Python Runtime**: Pyodide (Python 3.11 in WebAssembly)
- **Code Editor**: CodeMirror 6 with Python language support
- **PDF Rendering**: react-pdf (wrapper for PDF.js)
- **Layout**: react-resizable-panels for split pane

## How It Works

1. **Pyodide Initialization**: When the app loads, it initializes Pyodide and installs the pykerning package from a GitHub-hosted wheel
2. **Font Loading**: All TTF fonts from `/public/fonts/` are loaded into Pyodide's virtual filesystem at `/fonts/`
3. **Code Execution**: User writes Python code in the editor
4. **Auto-Run**: After 1 second of inactivity, the code automatically executes in Pyodide
5. **Result Extraction**: The `result` variable from Python (containing PDF bytes) is accessed directly
6. **PDF Display**: The PDF bytes are rendered in the preview pane using PDF.js

## Example Usage

```python
from pykerning.writer_fpdf import FpdfWriter

# Create PDF writer
writer = FpdfWriter(None, 210, 297)  # A4 size

# Load fonts
writer.load_font('/fonts/GenBasB.ttf')
writer.load_font('/fonts/GenBasI.ttf')
writer.load_font('/fonts/GenBasR.ttf')

# Configure fonts
fonts = writer.get_fonts([
    ('title', 'Gentium Basic', 'Bold', 24),
    ('body', 'Gentium Basic', 'Regular', 12),
])

# Draw text
writer.set_font(fonts['body'])
writer.draw_text(20, 20, 'Hello, pykerning!')

# Get PDF bytes (required)
result = writer.close()
```

**Important**: Your code must set a `result` variable containing the PDF bytes returned by `writer.close()`.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
pykerning-playground/
├── public/
│   └── fonts/              # TTF fonts loaded into Pyodide
│       ├── GenBasB.ttf
│       ├── GenBasI.ttf
│       └── GenBasR.ttf
├── src/
│   ├── components/
│   │   ├── CodeEditor.tsx       # CodeMirror wrapper
│   │   ├── PDFViewer.tsx        # PDF display component
│   │   ├── PlaygroundContainer.tsx  # Main layout
│   │   └── PreviewPane.tsx      # Preview panel with states
│   ├── contexts/
│   │   └── PyodideProvider.tsx  # Pyodide initialization & execution
│   ├── types/
│   │   └── pyodide.d.ts         # TypeScript definitions
│   └── App.tsx                  # Root component
```

## Key Components

### PyodideProvider
- Initializes Pyodide on app mount
- Installs pykerning from GitHub wheel
- Loads all fonts into virtual filesystem
- Provides `executePython()` function to run user code
- Extracts PDF bytes from Python's `result` variable

### CodeEditor
- CodeMirror 6 with Python syntax highlighting
- Debounces code changes (1 second)
- Triggers execution on change
- Shows loading state during Pyodide initialization

### PDFViewer
- Renders PDF using react-pdf and PDF.js
- Configures PDF.js worker from jsdelivr CDN
- Provides page navigation and zoom controls
- Shows error messages for invalid PDFs

## Configuration

### Pyodide Version
Currently using Pyodide 0.25.0 from CDN:
```typescript
await loadPyodide({
  indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
});
```

### Pykerning Installation
Installs from GitHub-hosted wheel (version 0.2.0):
```python
await micropip.install(
  'https://cdn.jsdelivr.net/gh/lbruand/pykerning@main/dist/pykerning-0.2.0-py3-none-any.whl'
)
```

### PDF.js Worker
Loaded from jsdelivr CDN:
```typescript
pdfjs.GlobalWorkerOptions.workerSrc =
  `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

## Adding More Fonts

To add additional fonts:

1. Place TTF files in `/public/fonts/`
2. Add the filename to the `fontFiles` array in `PyodideProvider.tsx`:
```typescript
const fontFiles = [
  'GenBasB.ttf',
  'GenBasI.ttf',
  'GenBasR.ttf',
  'YourNewFont.ttf'  // Add here
];
```
3. Fonts will be automatically loaded to `/fonts/` in Pyodide's filesystem

## Browser Compatibility

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Requirements**:
  - WebAssembly support
  - ES2020+ JavaScript features
  - SharedArrayBuffer (for optimal Pyodide performance)

## Performance Notes

- **First Load**: Takes 5-10 seconds to load Pyodide and pykerning
- **Subsequent Executions**: Fast (<100ms for simple documents)
- **Bundle Size**: ~1.1MB (main bundle), Pyodide loaded separately from CDN

## License

MIT

## Credits

- **pykerning**: Python typesetting library by lbruand
- **Pyodide**: Python runtime in WebAssembly
- **CodeMirror**: Extensible code editor
- **PDF.js**: PDF rendering in JavaScript by Mozilla
- Inspired by the [Typst Playground](https://typst.app/play/)
