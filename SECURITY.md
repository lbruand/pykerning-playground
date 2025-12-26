# Security

## Security Audit Summary

**Last Audit**: December 2024
**Status**: ✅ All identified critical and high-severity issues resolved

### Vulnerabilities Found and Fixed

| Severity | Issue | Status | Fix |
|----------|-------|--------|-----|
| 🔴 CRITICAL | JavaScript template injection in code execution | ✅ FIXED | Removed template literal interpolation, pass code directly to Pyodide |
| 🟡 MEDIUM | Information disclosure via excessive debug logging | ✅ FIXED | Removed console.log statements exposing PDF data |
| 🟢 LOW | Missing CSP security directives | ✅ FIXED | Added upgrade-insecure-requests and block-all-mixed-content |
| ℹ️ INFO | No known Pyodide sandbox escapes (2024-2025) | ✅ VERIFIED | Pyodide WebAssembly sandbox remains secure |
| ℹ️ INFO | Zero npm dependency vulnerabilities | ✅ VERIFIED | All 271 dependencies clean (npm audit passed) |

---

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

## Content Security Policy (CSP)

A strict Content Security Policy is enforced via meta tag in `index.html`. The policy restricts resource loading to prevent XSS and code injection attacks.

### CSP Directives

| Directive | Allowed Sources | Reason |
|-----------|----------------|--------|
| `default-src` | `'self'` | Only allow resources from same origin by default |
| `script-src` | `'self'` `https://cdn.jsdelivr.net` `'unsafe-eval'` | Our scripts, Pyodide from CDN, and eval required by Pyodide |
| `script-src-elem` | `'self'` `https://cdn.jsdelivr.net` | Script elements from our domain and CDN |
| `worker-src` | `'self'` `blob:` | PDF.js worker and blob URLs for inline workers |
| `connect-src` | `'self'` `https://cdn.jsdelivr.net` `https://files.pythonhosted.org` `https://pypi.org` | Fetch/XHR to our domain, CDN, and PyPI for Python packages |
| `style-src` | `'self'` `'unsafe-inline'` | Our styles and React inline styles |
| `font-src` | `'self'` | Only bundled fonts from our domain |
| `img-src` | `'self'` `data:` `blob:` | Images from our domain, data URIs, and blobs |
| `object-src` | `'none'` | No plugins (Flash, Java, etc.) allowed |
| `base-uri` | `'self'` | Prevent base tag hijacking |
| `form-action` | `'none'` | No form submissions (not used) |
| `frame-ancestors` | `'none'` | Prevent clickjacking (no iframing) |
| `upgrade-insecure-requests` | N/A | Automatically upgrade HTTP to HTTPS |
| `block-all-mixed-content` | N/A | Block mixed HTTP/HTTPS content |

### CSP Exceptions

Two directives require relaxed restrictions:

1. **`'unsafe-eval'` in script-src**
   - Required by Pyodide to execute Python code dynamically
   - This is the core functionality of the playground
   - Risk is mitigated by Pyodide's WebAssembly sandbox

2. **`'unsafe-inline'` in style-src**
   - Required by React for inline styles
   - Limited to CSS injection, not JavaScript execution

### Testing CSP Violations

The browser console will show CSP violations if any resources are blocked. To test:

1. Open browser DevTools Console
2. Use the playground normally
3. Look for messages starting with "Content Security Policy"
4. Report any violations as they may indicate:
   - A legitimate resource being blocked (CSP too strict)
   - An attempted security breach (CSP working correctly)

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
