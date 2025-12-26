# Security

## Subresource Integrity (SRI)

This project uses Subresource Integrity hashes to verify CDN-loaded resources haven't been tampered with.

### Protected Resources

- **Pyodide Loader** (`index.html`)
  - URL: `https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js`
  - Hash: `sha384-b4IZetZNE8bVncsQqlcH4ZZFC58BslGU2LVj47xUtIMOw72axMESbPe8spBylXnd`

- **PDF.js Worker** (`public/pdf.worker.min.mjs`)
  - Bundled locally from react-pdf's pdfjs-dist dependency (v5.4.296)
  - Served from the same origin as the application
  - No CDN dependency - verified at build time via package-lock.json

### Known Limitations

The following resources are loaded dynamically and **cannot use SRI** (this is a browser limitation, not specific to this project):

1. **Pyodide Runtime Modules**
   - Loaded dynamically via Pyodide's `indexURL`
   - Includes Python packages, WASM modules, etc.
   - Mitigation: Using official jsDelivr CDN, pinned to specific version (v0.25.0)

2. **Pykerning Package**
   - Loaded via micropip from GitHub releases
   - URL: `https://cdn.jsdelivr.net/gh/lbruand/pykerning@main/dist/pykerning-0.2.0-py3-none-any.whl`
   - Mitigation: Using jsDelivr CDN with specific version (0.2.0)

## Security Model

This is a **client-side code playground** similar to JSFiddle, CodePen, or the Typst playground:

- **Code execution is sandboxed**: Python runs in Pyodide (WebAssembly), isolated from the host system
- **No server-side execution**: All code runs in the user's browser
- **No filesystem access**: Uses Pyodide's virtual filesystem only
- **Limited network access**: Constrained by browser CORS policies

## Best Practices for Users

1. **Don't paste untrusted code**: While sandboxed, you should only run code you understand
2. **Review generated PDFs**: Before downloading, verify the PDF content is what you expect
3. **Use in modern browsers**: Ensure WebAssembly and modern JavaScript features are supported

## Updating Resources

### Updating Pyodide Version

If you update the Pyodide version, regenerate the SRI hash:

```bash
# Replace version number as needed
curl -s https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js | openssl dgst -sha384 -binary | openssl base64 -A
```

Then update the `integrity` attribute in `index.html`.

### Updating PDF.js Worker

The PDF.js worker is bundled locally from react-pdf's pdfjs-dist dependency. To update:

```bash
# Update react-pdf (which will update its pdfjs-dist dependency)
npm update react-pdf

# Copy the worker file from react-pdf's nested dependency
cp node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/pdf.worker.min.mjs
```

**Important**: Always use the worker from `react-pdf/node_modules/pdfjs-dist` to ensure version compatibility with the react-pdf library.
