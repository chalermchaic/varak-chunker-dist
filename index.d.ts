// ─── thai-legal-chunker — TypeScript Declarations ────────────────
// Types only — no implementation logic.

// ─── Shared Types ─────────────────────────────────────────────────

/** A single semantic chunk produced by chunkBySections() */
export interface Chunk {
  /** Raw text content of this chunk */
  text: string;
  /** Section label e.g. "มาตรา 252" — null if document has no section headers */
  section: string | null;
  /** Chapter label e.g. "หมวด 3" — null if no chapter found */
  chapter: string | null;
  /** Chapter title e.g. "การบริหารงานบุคคล" — null if not present */
  chapterTitle: string | null;
  /** 1-based วรรค index within the section (1 = first วรรค) */
  varakIndex: number;
}

/** A single วรรค segment produced by segmentVarakByRules() */
export interface VarakSegment {
  /** 1-based index */
  varakIndex: number;
  /** Text content of this วรรค */
  text: string;
}

/** Thai ratio thresholds used by thaiRatio() gate */
export interface ThaiRatioThresholds {
  /** Minimum Thai ratio for embedded-text PDFs (default 0.30) */
  EMBEDDED: number;
  /** Minimum Thai ratio for OCR output (default 0.20) */
  OCR: number;
}

// ─── normalize ────────────────────────────────────────────────────

/**
 * Replace Thai digits (๐–๙) with Arabic digits (0–9).
 * e.g. "มาตรา ๒๕๒" → "มาตรา 252"
 */
export function normalizeDigits(text: string): string;

/**
 * Extract chapter label from the start of a text string.
 * Returns "หมวด 3" style string, or null if not found.
 */
export function extractChapter(text: string): string | null;

/**
 * Extract chapter title (the name after the chapter number).
 * Returns the title string, or null if not found.
 */
export function extractChapterTitle(text: string): string | null;

// ─── chunking ─────────────────────────────────────────────────────

/**
 * Strip watermarks, gazette page headers, OCR spacing artifacts,
 * and lone surrogates from raw PDF text.
 */
export function normalizeText(text: string): string;

/**
 * Main chunking pipeline: raw PDF text → semantic Chunk array.
 * Splits by มาตรา/ข้อ/หมวด headers and further by วรรค boundaries.
 */
export function chunkBySections(rawText: string): Promise<Chunk[]>;

/**
 * Fallback chunker: split text by token count with overlap.
 * Returns plain string array (no metadata).
 */
export function chunkByTokens(text: string, maxChars?: number): string[];

/**
 * Paragraph-based chunker: split on \n\n boundaries.
 * Used for OCR output that lacks structured section headers.
 * Returns plain string array.
 */
export function chunkByParagraphs(text: string, maxChars?: number): string[];

/**
 * Build embedding input by prepending contextual header to a chunk.
 * e.g. "เอกสาร: foo.pdf\nมาตรา: 252\n<chunk text>"
 */
export function buildEmbedText(chunk: Chunk, filename: string): string;

// ─── pdf-classify ─────────────────────────────────────────────────

/**
 * Fraction of Thai characters in the text (0–1).
 * Used to detect garbage / non-Thai PDFs before embedding.
 */
export function thaiRatio(text: string): number;

/**
 * Classify PDF by content type:
 * - 1 = no extractable text (image-only → needs OCR)
 * - 2 = structured legal text (มาตรา + หมวด headers)
 * - 3 = legal text without chapters (มาตรา only)
 * - 4 = general text (no legal structure)
 */
export function classifyPdf(text: string): 1 | 2 | 3 | 4;

/**
 * Map an Error to a typed error code string.
 * e.g. "EMBED_TIMEOUT", "EMBED_BAD_INPUT", "NO_TEXT", "UNKNOWN"
 */
export function classifyError(err: unknown): string;

/**
 * Whether a job with this error code should be retried.
 */
export function shouldRetry(code: string, attempt: number): boolean;

/**
 * Milliseconds to wait before attempt N (exponential backoff).
 */
export function retryDelay(attempt: number): number;

/** Thai ratio thresholds (EMBEDDED: 0.30, OCR: 0.20) */
export const THAI_RATIO: ThaiRatioThresholds;

/** Maximum number of ingest attempts before giving up */
export const MAX_ATTEMPTS: number;

// ─── pdf-extractor ────────────────────────────────────────────────

/**
 * Extract text from a PDF buffer using coordinate-aware paragraph detection.
 * Preserves วรรค boundaries via indentation analysis (pdfjs-dist).
 * Returns text with \n\n between paragraphs, \n within paragraphs.
 */
export function extractPdfText(buffer: Buffer | Uint8Array): Promise<string>;

// ─── sanitize ─────────────────────────────────────────────────────

/**
 * Strip lone surrogates, zero-width spaces, soft hyphens,
 * and C0/C1 control characters from a string.
 * Safe to call on any untrusted input (LINE messages, OCR output).
 */
export function sanitize(str: string): string;
export function sanitize(str: null): null;
export function sanitize(str: undefined): undefined;

// ─── varak-segmenter ──────────────────────────────────────────────

/**
 * Split a legal section text into วรรค segments using keyword boundaries
 * (วรรคหนึ่ง, วรรคสอง, … or \n\n fallback).
 * Returns array of { varakIndex, text } sorted by varakIndex.
 */
export function segmentVarakByRules(sectionText: string): VarakSegment[];
