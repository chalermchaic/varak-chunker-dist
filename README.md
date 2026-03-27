# varak-chunker

Thai legal document chunking & OCR pipeline for RAG systems.

## Install

```bash
npm install github:YOUR_ORG/varak-chunker-dist
```

## Peer dependency

```bash
npm install pdfjs-dist
```

## Usage

```js
import {
  extractPdfText,
  chunkBySections,
  segmentVarakByRules,
  classifyPdf,
} from 'varak-chunker';

const text = await extractPdfText(pdfBuffer);
const chunks = await chunkBySections(text);
```

See `index.d.ts` for full API.
