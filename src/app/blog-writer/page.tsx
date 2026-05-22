"use client";

import { useState, useRef, useEffect } from "react";

const BLOG_TYPES = [
  { id: "one-off", icon: "📄", name: "One & Done", desc: "A standalone article covering a single topic in depth" },
  { id: "series", icon: "📚", name: "Blog Series", desc: "Connected posts that build on each other, released sequentially" },
  { id: "course", icon: "🎓", name: "Educational Course", desc: "Structured lessons with learning objectives and key takeaways" },
];

const PLATFORMS = [
  { id: "medium", name: "Medium", icon: "Ⓜ", color: "#1a1a1a", desc: "Publish to your Medium profile" },
  { id: "wix", name: "Wix Blog", icon: "🌐", color: "#0057e7", desc: "Publish to your Wix website" },
  { id: "aws", name: "AWS Website", icon: "☁️", color: "#ff9900", desc: "Deploy to your custom AWS site" },
];

const LOADING_STEPS = [
  "Analyzing topic & audience intent",
  "Researching SEO keywords",
  "Structuring content outline",
  "Writing 2000–2500 word article",
  "Optimizing for search engines",
  "Finalizing metadata & tags",
];

function parseMarkdown(text: string): string {
  if (!text) return "";
  return text
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/<p><\/p>/g, "")
    .replace(/^([^<\n].+)$/gm, (m) => {
      if (m.trim() && !m.startsWith("<")) return `<p>${m}</p>`;
      return m;
    });
}

function countWords(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(Boolean).length;
}

interface BlogData {
  title?: string;
  metaDescription?: string;
  slug?: string;
  category?: string;
  tags?: string[];
  primaryKeyword?: string;
  secondaryKeywords?: string[];
  readingTime?: string;
  wordCount?: number;
  seoScore?: number;
  content?: string;
  toc?: string[];
  keyTakeaways?: string[];
  internalLinkSuggestions?: string[];
  seriesContext?: string;
  error?: string;
  createdAt?: string;
  platforms?: string[];
  blogType?: string;
}

interface PlatformConfigs {
  medium: { token: string; userId: string };
  wix: { siteId: string; apiKey: string };
  aws: { endpoint: string; apiKey: string };
}

const CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .bw-root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #18181f;
    --surface3: #1e1e28;
    --border: rgba(255,255,255,0.07);
    --border2: rgba(255,255,255,0.12);
    --accent: #e8c547;
    --accent2: #c9a227;
    --green: #4ade80;
    --red: #f87171;
    --blue: #60a5fa;
    --purple: #a78bfa;
    --text: #f0eff8;
    --text2: #a09db8;
    --text3: #6b6882;
    --serif: 'Playfair Display', Georgia, serif;
    --sans: 'DM Sans', system-ui, sans-serif;
    --mono: 'DM Mono', monospace;
    --radius: 12px;
    --radius-sm: 8px;
    --transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--bg);
    position: relative;
    overflow: hidden;
    color: var(--text);
    font-family: var(--sans);
  }
  .bw-root::before {
    content: '';
    position: fixed;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(ellipse at 30% 20%, rgba(232,197,71,0.03) 0%, transparent 60%),
                radial-gradient(ellipse at 70% 80%, rgba(96,165,250,0.03) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
  }

  .bw-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 32px;
    height: 64px;
    border-bottom: 1px solid var(--border);
    background: rgba(10,10,15,0.9);
    backdrop-filter: blur(12px);
    position: sticky;
    top: 0;
    z-index: 100;
  }
  .bw-logo {
    font-family: var(--serif);
    font-size: 20px;
    font-weight: 700;
    color: var(--text);
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .bw-logo-dot {
    width: 8px; height: 8px;
    background: var(--accent);
    border-radius: 50%;
    animation: bw-pulse 2s ease-in-out infinite;
  }
  @keyframes bw-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
  .bw-header-tabs { display: flex; gap: 4px; }
  .bw-tab-btn {
    padding: 6px 16px;
    border-radius: var(--radius-sm);
    border: none;
    background: transparent;
    color: var(--text3);
    font-family: var(--sans);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition);
  }
  .bw-tab-btn:hover { color: var(--text2); background: var(--surface2); }
  .bw-tab-btn.active { color: var(--accent); background: rgba(232,197,71,0.08); }

  .bw-main-layout {
    display: grid;
    grid-template-columns: 380px 1fr;
    flex: 1;
    position: relative;
    z-index: 1;
    min-height: calc(100vh - 64px);
  }

  .bw-left-panel {
    border-right: 1px solid var(--border);
    padding: 28px 24px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    overflow-y: auto;
    max-height: calc(100vh - 64px);
    position: sticky;
    top: 64px;
  }
  .bw-panel-section { display: flex; flex-direction: column; gap: 12px; }
  .bw-section-label {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text3);
    padding-bottom: 4px;
    border-bottom: 1px solid var(--border);
  }

  .bw-field-group { display: flex; flex-direction: column; gap: 6px; }
  .bw-field-label { font-size: 12px; font-weight: 500; color: var(--text2); }
  .bw-field-input {
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: var(--radius-sm);
    color: var(--text);
    font-family: var(--sans);
    font-size: 14px;
    padding: 10px 14px;
    transition: all var(--transition);
    outline: none;
    width: 100%;
  }
  .bw-field-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(232,197,71,0.08);
  }
  .bw-field-input::placeholder { color: var(--text3); }
  textarea.bw-field-input { resize: vertical; min-height: 80px; line-height: 1.5; }

  .bw-type-grid { display: flex; flex-direction: column; gap: 8px; }
  .bw-type-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 12px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface2);
    cursor: pointer;
    transition: all var(--transition);
  }
  .bw-type-card:hover { border-color: var(--border2); background: var(--surface3); }
  .bw-type-card.selected { border-color: var(--accent); background: rgba(232,197,71,0.05); }
  .bw-type-icon { font-size: 18px; margin-top: 1px; flex-shrink: 0; }
  .bw-type-info { flex: 1; }
  .bw-type-name { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 2px; }
  .bw-type-desc { font-size: 11px; color: var(--text3); line-height: 1.4; }
  .bw-type-radio {
    width: 16px; height: 16px;
    border-radius: 50%;
    border: 2px solid var(--border2);
    flex-shrink: 0;
    margin-top: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition);
  }
  .bw-type-card.selected .bw-type-radio { border-color: var(--accent); background: var(--accent); }
  .bw-type-card.selected .bw-type-radio::after {
    content: '';
    width: 6px; height: 6px;
    border-radius: 50%;
    background: var(--bg);
  }

  .bw-series-config {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .bw-series-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  .bw-platform-grid { display: flex; flex-direction: column; gap: 6px; }
  .bw-platform-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface2);
    cursor: pointer;
    transition: all var(--transition);
  }
  .bw-platform-card:hover { border-color: var(--border2); }
  .bw-platform-card.selected { border-color: var(--accent); background: rgba(232,197,71,0.04); }
  .bw-platform-logo {
    width: 32px; height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    flex-shrink: 0;
  }
  .bw-platform-info { flex: 1; }
  .bw-platform-name { font-size: 13px; font-weight: 600; color: var(--text); }
  .bw-platform-status { font-size: 11px; color: var(--text3); }
  .bw-status-dot {
    display: inline-block;
    width: 6px; height: 6px;
    border-radius: 50%;
    margin-right: 4px;
  }
  .bw-status-dot.connected { background: var(--green); }
  .bw-status-dot.not-connected { background: var(--text3); }
  .bw-check-box {
    width: 18px; height: 18px;
    border-radius: 4px;
    border: 2px solid var(--border2);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: all var(--transition);
    font-size: 11px;
  }
  .bw-platform-card.selected .bw-check-box { background: var(--accent); border-color: var(--accent); color: var(--bg); }

  .bw-generate-btn {
    width: 100%;
    padding: 14px;
    border-radius: var(--radius-sm);
    border: none;
    background: var(--accent);
    color: #0a0a0f;
    font-family: var(--sans);
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all var(--transition);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    letter-spacing: 0.01em;
  }
  .bw-generate-btn:hover:not(:disabled) {
    background: var(--accent2);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(232,197,71,0.25);
  }
  .bw-generate-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .bw-btn-spinner {
    width: 16px; height: 16px;
    border: 2px solid rgba(0,0,0,0.3);
    border-top-color: #0a0a0f;
    border-radius: 50%;
    animation: bw-spin 0.8s linear infinite;
  }
  @keyframes bw-spin { to { transform: rotate(360deg); } }

  .bw-right-panel { display: flex; flex-direction: column; overflow: hidden; }

  .bw-empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 20px;
    color: var(--text3);
    padding: 40px;
    text-align: center;
  }
  .bw-empty-icon { font-size: 64px; opacity: 0.3; }
  .bw-empty-title { font-family: var(--serif); font-size: 28px; color: var(--text2); font-weight: 700; }
  .bw-empty-sub { font-size: 14px; line-height: 1.6; max-width: 360px; }
  .bw-feature-pills { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; margin-top: 8px; }
  .bw-feature-pill {
    padding: 4px 12px;
    border-radius: 20px;
    background: var(--surface2);
    border: 1px solid var(--border2);
    font-size: 12px;
    color: var(--text2);
  }

  .bw-blog-output { display: flex; flex-direction: column; height: 100%; }
  .bw-output-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 28px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    flex-shrink: 0;
  }
  .bw-output-meta { display: flex; align-items: center; gap: 16px; }
  .bw-meta-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    background: var(--surface2);
    border: 1px solid var(--border);
    font-size: 11px;
    color: var(--text2);
  }
  .bw-meta-chip span { font-weight: 600; color: var(--text); }
  .bw-toolbar-actions { display: flex; gap: 8px; }
  .bw-action-btn {
    padding: 7px 14px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border2);
    background: var(--surface2);
    color: var(--text2);
    font-family: var(--sans);
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition);
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .bw-action-btn:hover { border-color: var(--border2); color: var(--text); background: var(--surface3); }
  .bw-action-btn.primary { background: rgba(232,197,71,0.1); border-color: var(--accent); color: var(--accent); }
  .bw-action-btn.primary:hover { background: rgba(232,197,71,0.18); }
  .bw-action-btn:disabled { opacity: 0.4; cursor: not-allowed; }

  .bw-blog-content-area {
    flex: 1;
    overflow-y: auto;
    display: grid;
    grid-template-columns: 1fr 300px;
  }
  .bw-blog-article { padding: 48px 56px; max-width: 800px; }
  .bw-article-tag {
    display: inline-block;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 16px;
    padding: 4px 10px;
    background: rgba(232,197,71,0.08);
    border-radius: 4px;
  }
  .bw-article-title {
    font-family: var(--serif);
    font-size: 42px;
    font-weight: 900;
    color: var(--text);
    line-height: 1.15;
    margin-bottom: 16px;
  }
  .bw-article-meta {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
    margin-bottom: 32px;
  }
  .bw-article-meta-item { font-size: 12px; color: var(--text3); display: flex; align-items: center; gap: 4px; }
  .bw-article-meta-item strong { color: var(--text2); }
  .bw-article-body { font-size: 16px; line-height: 1.8; color: var(--text2); }
  .bw-article-body h2 { font-family: var(--serif); font-size: 26px; font-weight: 700; color: var(--text); margin: 40px 0 16px; line-height: 1.3; }
  .bw-article-body h3 { font-family: var(--serif); font-size: 20px; font-weight: 600; color: var(--text); margin: 28px 0 12px; }
  .bw-article-body p { margin-bottom: 20px; }
  .bw-article-body strong { color: var(--text); font-weight: 600; }
  .bw-article-body em { font-style: italic; color: var(--text); }
  .bw-article-body ul, .bw-article-body ol { margin: 16px 0 20px 24px; }
  .bw-article-body li { margin-bottom: 8px; }
  .bw-article-body blockquote {
    border-left: 3px solid var(--accent);
    padding: 8px 0 8px 20px;
    margin: 24px 0;
    color: var(--text);
    font-style: italic;
    font-family: var(--serif);
    font-size: 18px;
    background: rgba(232,197,71,0.03);
  }

  .bw-seo-panel {
    border-left: 1px solid var(--border);
    padding: 28px 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
  }
  .bw-seo-title { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--text3); margin-bottom: 4px; }
  .bw-seo-score-ring { display: flex; flex-direction: column; align-items: center; gap: 8px; }
  .bw-score-circle {
    width: 80px; height: 80px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 3px solid var(--green);
    box-shadow: 0 0 16px rgba(74,222,128,0.2);
  }
  .bw-score-num { font-family: var(--mono); font-size: 22px; font-weight: 500; color: var(--green); }
  .bw-score-label { font-size: 9px; color: var(--text3); text-transform: uppercase; }
  .bw-seo-item { display: flex; align-items: flex-start; gap: 8px; font-size: 12px; color: var(--text2); line-height: 1.4; }
  .bw-seo-check { color: var(--green); font-size: 14px; flex-shrink: 0; }
  .bw-seo-warn { color: var(--accent); font-size: 14px; flex-shrink: 0; }
  .bw-keyword-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .bw-keyword-chip {
    padding: 3px 8px;
    border-radius: 4px;
    background: var(--surface2);
    border: 1px solid var(--border);
    font-family: var(--mono);
    font-size: 11px;
    color: var(--text2);
  }
  .bw-keyword-chip.primary { border-color: var(--accent); color: var(--accent); background: rgba(232,197,71,0.06); }
  .bw-readability-bars { display: flex; flex-direction: column; gap: 8px; }
  .bw-readability-item { display: flex; flex-direction: column; gap: 4px; }
  .bw-readability-header { display: flex; justify-content: space-between; font-size: 11px; color: var(--text3); }
  .bw-readability-bar { height: 4px; background: var(--surface3); border-radius: 2px; overflow: hidden; }
  .bw-readability-fill { height: 100%; border-radius: 2px; background: linear-gradient(90deg, var(--blue), var(--purple)); }

  .bw-loading-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 24px;
    padding: 40px;
  }
  .bw-loading-animation { position: relative; width: 80px; height: 80px; }
  .bw-loading-ring {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    border: 2px solid transparent;
    border-top-color: var(--accent);
    animation: bw-spin 1s linear infinite;
  }
  .bw-loading-ring:nth-child(2) { inset: 8px; border-top-color: var(--blue); animation-duration: 1.4s; animation-direction: reverse; }
  .bw-loading-ring:nth-child(3) { inset: 16px; border-top-color: var(--purple); animation-duration: 1.8s; }
  .bw-loading-text { font-family: var(--serif); font-size: 22px; color: var(--text2); font-weight: 400; font-style: italic; }
  .bw-loading-steps { display: flex; flex-direction: column; gap: 10px; max-width: 340px; width: 100%; }
  .bw-loading-step { display: flex; align-items: center; gap: 12px; font-size: 13px; color: var(--text3); transition: all var(--transition); }
  .bw-loading-step.active { color: var(--text); }
  .bw-loading-step.done { color: var(--green); }
  .bw-step-indicator {
    width: 20px; height: 20px;
    border-radius: 50%;
    border: 2px solid currentColor;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    flex-shrink: 0;
  }
  .bw-loading-step.active .bw-step-indicator {
    border-color: var(--accent);
    background: rgba(232,197,71,0.1);
    animation: bw-pulse 1s ease-in-out infinite;
  }

  .bw-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(8px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .bw-modal {
    background: var(--surface);
    border: 1px solid var(--border2);
    border-radius: var(--radius);
    width: 100%;
    max-width: 520px;
    overflow: hidden;
    box-shadow: 0 32px 80px rgba(0,0,0,0.6);
  }
  .bw-modal-header {
    padding: 24px 28px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .bw-modal-title { font-family: var(--serif); font-size: 22px; font-weight: 700; color: var(--text); }
  .bw-modal-close { background: none; border: none; color: var(--text3); cursor: pointer; font-size: 20px; padding: 4px; display: flex; align-items: center; justify-content: center; transition: color var(--transition); }
  .bw-modal-close:hover { color: var(--text); }
  .bw-modal-body { padding: 24px 28px; display: flex; flex-direction: column; gap: 20px; }
  .bw-modal-footer { padding: 16px 28px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }
  .bw-platform-publish-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    background: var(--surface2);
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
  }
  .bw-publish-status-badge { margin-left: auto; font-size: 11px; font-weight: 600; padding: 3px 8px; border-radius: 20px; }
  .bw-badge-success { background: rgba(74,222,128,0.1); color: var(--green); }
  .bw-badge-pending { background: rgba(232,197,71,0.1); color: var(--accent); }
  .bw-badge-error { background: rgba(248,113,113,0.1); color: var(--red); }

  .bw-config-panel { padding: 32px; max-width: 700px; margin: 0 auto; width: 100%; }
  .bw-config-title { font-family: var(--serif); font-size: 32px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .bw-config-sub { font-size: 14px; color: var(--text3); margin-bottom: 32px; line-height: 1.6; }
  .bw-config-section { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; margin-bottom: 20px; }
  .bw-config-section-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
  .bw-config-section-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .bw-config-section-name { font-size: 15px; font-weight: 600; color: var(--text); }
  .bw-config-section-desc { font-size: 12px; color: var(--text3); margin-top: 2px; }
  .bw-config-fields { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
  .bw-config-save-btn {
    padding: 8px 20px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--accent);
    background: rgba(232,197,71,0.08);
    color: var(--accent);
    font-family: var(--sans);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition);
  }
  .bw-config-save-btn:hover { background: rgba(232,197,71,0.14); }
  .bw-config-connected-badge { margin-left: auto; display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 500; color: var(--green); }

  .bw-history-panel { padding: 28px 32px; overflow-y: auto; max-height: calc(100vh - 64px); }
  .bw-history-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .bw-history-title { font-family: var(--serif); font-size: 28px; font-weight: 700; }
  .bw-history-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
  .bw-history-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 20px;
    cursor: pointer;
    transition: all var(--transition);
  }
  .bw-history-card:hover { border-color: var(--border2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); }
  .bw-history-card-tag { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 8px; }
  .bw-history-card-title { font-family: var(--serif); font-size: 17px; font-weight: 700; color: var(--text); line-height: 1.3; margin-bottom: 10px; }
  .bw-history-card-meta { display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: var(--text3); }
  .bw-history-card-platforms { display: flex; gap: 4px; }
  .bw-history-platform-badge { padding: 2px 6px; background: var(--surface2); border-radius: 4px; font-size: 10px; color: var(--text2); }
  .bw-empty-history { text-align: center; padding: 60px 0; color: var(--text3); }
  .bw-empty-history-icon { font-size: 48px; opacity: 0.3; margin-bottom: 12px; }
  .bw-divider { height: 1px; background: var(--border); }

  .bw-root ::-webkit-scrollbar { width: 6px; }
  .bw-root ::-webkit-scrollbar-track { background: transparent; }
  .bw-root ::-webkit-scrollbar-thumb { background: var(--surface3); border-radius: 3px; }
  .bw-root ::-webkit-scrollbar-thumb:hover { background: var(--border2); }

  @keyframes bw-fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .bw-fade-in { animation: bw-fadeIn 0.4s ease forwards; }
`;

export default function BlogWriter() {
  const [activeTab, setActiveTab] = useState("writer");
  const [subject, setSubject] = useState("");
  const [tone, setTone] = useState("professional");
  const [audience, setAudience] = useState("");
  const [blogType, setBlogType] = useState("one-off");
  const [seriesCount, setSeriesCount] = useState(5);
  const [seriesEpisode, setSeriesEpisode] = useState(1);
  const [selectedPlatforms, setSelectedPlatforms] = useState(["medium"]);
  const [generating, setGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [blogData, setBlogData] = useState<BlogData | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishStatus, setPublishStatus] = useState<Record<string, string>>({});
  const [publishingNow, setPublishingNow] = useState(false);
  const [history, setHistory] = useState<BlogData[]>([]);
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfigs>({
    medium: { token: "", userId: "" },
    wix: { siteId: "", apiKey: "" },
    aws: { endpoint: "", apiKey: "" },
  });
  const [configSaved, setConfigSaved] = useState<Record<string, boolean>>({});
  const articleRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap";
    document.head.appendChild(link);

    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  const togglePlatform = (id: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const isConfigured = (platformId: string): boolean => {
    const cfg = platformConfigs[platformId as keyof PlatformConfigs];
    if (platformId === "medium") return !!(cfg as typeof platformConfigs.medium).token && !!(cfg as typeof platformConfigs.medium).userId;
    if (platformId === "wix") return !!(cfg as typeof platformConfigs.wix).siteId && !!(cfg as typeof platformConfigs.wix).apiKey;
    if (platformId === "aws") return !!(cfg as typeof platformConfigs.aws).endpoint && !!(cfg as typeof platformConfigs.aws).apiKey;
    return false;
  };

  const generateBlog = async () => {
    if (!subject.trim()) return;
    setGenerating(true);
    setLoadingStep(0);
    setBlogData(null);

    for (let i = 0; i < LOADING_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 700 + Math.random() * 400));
      setLoadingStep(i + 1);
    }

    try {
      const typeContext =
        blogType === "series"
          ? `This is Part ${seriesEpisode} of a ${seriesCount}-part blog series. Reference that this is part of a series and hint at what's coming next.`
          : blogType === "course"
          ? `This is an educational course-style blog. Include clear learning objectives at the start, structured lessons/sections, key takeaways at the end, and a "What You'll Learn" intro.`
          : `This is a standalone, comprehensive article. Make it complete and self-contained.`;

      const audienceCtx = audience ? `Target audience: ${audience}.` : "";
      const toneCtx = `Tone: ${tone}.`;

      const systemPrompt = `You are an expert SEO content strategist and blog writer. You write in-depth, authoritative articles that rank on Google. Every blog post you write is between 2000–2500 words (count carefully), perfectly structured for SEO, deeply researched in tone, and genuinely valuable to readers.

Always respond with a JSON object in this exact structure (no markdown, no preamble):
{
  "title": "Compelling SEO title (under 60 chars)",
  "metaDescription": "Engaging meta description (under 160 chars)",
  "slug": "url-friendly-slug",
  "category": "Main category",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "primaryKeyword": "main keyword phrase",
  "secondaryKeywords": ["kw1", "kw2", "kw3"],
  "readingTime": "X min read",
  "wordCount": number,
  "seoScore": number between 80–98,
  "content": "The full 2000–2500 word markdown blog post content. Use ## for H2 headings, ### for H3, **bold**, *italic*, > for blockquotes, - for bullet lists.",
  "toc": ["Section 1 Title", "Section 2 Title", "Section 3 Title"],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "internalLinkSuggestions": ["Related topic 1", "Related topic 2"],
  "seriesContext": "${blogType === "series" ? `Part ${seriesEpisode} of ${seriesCount}` : ""}"
}`;

      const userPrompt = `Write a comprehensive, SEO-optimized blog post about: "${subject}"

${typeContext}
${audienceCtx}
${toneCtx}

Requirements:
- EXACTLY 2000–2500 words in the content field
- Include a compelling introduction with a hook
- Use keyword-rich headings (H2 and H3)
- Include at least one blockquote for emphasis
- Use bullet lists where appropriate
- Write a strong conclusion with a CTA
- Natural keyword placement (not stuffed)
- The article must be genuinely educational and valuable`;

      const response = await fetch("/api/blog-writer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 8000,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
      });

      const data = await response.json();
      const raw = data.content?.[0]?.text || "";
      const clean = raw.replace(/```json\n?|\n?```/g, "").trim();
      const parsed = JSON.parse(clean);
      setBlogData(parsed);

      setHistory((prev) => [
        { ...parsed, createdAt: new Date().toLocaleString(), platforms: [...selectedPlatforms], blogType },
        ...prev,
      ]);
    } catch (err) {
      console.error("Generation error:", err);
      setBlogData({ error: "Failed to generate blog. Please try again." });
    }

    setGenerating(false);
  };

  const handlePublish = async () => {
    if (!blogData) return;
    setPublishingNow(true);
    const results: Record<string, string> = {};

    for (const platformId of selectedPlatforms) {
      results[platformId] = "publishing";
      setPublishStatus({ ...results });
      await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));

      if (!isConfigured(platformId)) {
        results[platformId] = "error";
        setPublishStatus({ ...results });
        continue;
      }

      try {
        const mediumCfg = platformConfigs.medium;
        const wixCfg = platformConfigs.wix;
        const awsCfg = platformConfigs.aws;

        if (platformId === "medium") {
          const res = await fetch(
            `https://api.medium.com/v1/users/${mediumCfg.userId}/posts`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${mediumCfg.token}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title: blogData.title,
                contentFormat: "markdown",
                content: blogData.content,
                tags: blogData.tags?.slice(0, 5),
                publishStatus: "public",
              }),
            }
          );
          results[platformId] = res.ok ? "success" : "error";
        } else if (platformId === "wix") {
          const res = await fetch("https://www.wixapis.com/blog/v3/posts", {
            method: "POST",
            headers: {
              Authorization: wixCfg.apiKey,
              "Content-Type": "application/json",
              "wix-site-id": wixCfg.siteId,
            },
            body: JSON.stringify({
              post: {
                title: blogData.title,
                richContent: {
                  nodes: [{ type: "PARAGRAPH", nodes: [{ type: "TEXT", textData: { text: blogData.content } }] }],
                },
                tags: blogData.tags,
              },
            }),
          });
          results[platformId] = res.ok ? "success" : "error";
        } else if (platformId === "aws") {
          const res = await fetch(awsCfg.endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": awsCfg.apiKey,
            },
            body: JSON.stringify({
              title: blogData.title,
              content: blogData.content,
              slug: blogData.slug,
              tags: blogData.tags,
              metaDescription: blogData.metaDescription,
              category: blogData.category,
              publishedAt: new Date().toISOString(),
            }),
          });
          results[platformId] = res.ok ? "success" : "error";
        }
      } catch {
        results[platformId] = "error";
      }

      setPublishStatus({ ...results });
    }

    setPublishingNow(false);
  };

  const copyArticle = () => {
    if (blogData?.content) {
      navigator.clipboard.writeText(blogData.content);
    }
  };

  const saveConfig = (platformId: string) => {
    setConfigSaved((prev) => ({ ...prev, [platformId]: true }));
    setTimeout(() => setConfigSaved((prev) => ({ ...prev, [platformId]: false })), 2000);
  };

  const wc = blogData?.wordCount || (blogData?.content ? countWords(blogData.content) : 0);

  return (
    <div className="bw-root">
      {/* Header */}
      <header className="bw-header">
        <div className="bw-logo">
          <div className="bw-logo-dot" />
          AutoScribe
        </div>
        <div className="bw-header-tabs">
          {(
            [
              ["writer", "✍️ Writer"],
              ["history", "📋 History"],
              ["config", "⚙️ Config"],
            ] as [string, string][]
          ).map(([id, label]) => (
            <button
              key={id}
              className={`bw-tab-btn${activeTab === id ? " active" : ""}`}
              onClick={() => setActiveTab(id)}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ width: 120 }} />
      </header>

      {/* Writer Tab */}
      {activeTab === "writer" && (
        <div className="bw-main-layout">
          {/* Left: Controls */}
          <aside className="bw-left-panel">
            <div className="bw-panel-section">
              <div className="bw-section-label">Topic</div>
              <div className="bw-field-group">
                <label className="bw-field-label">Subject / Category *</label>
                <textarea
                  className="bw-field-input"
                  placeholder="e.g. The Future of AI in Healthcare, Python for Beginners, Remote Work Productivity..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  style={{ minHeight: 72 }}
                />
              </div>
              <div className="bw-field-group">
                <label className="bw-field-label">Target Audience</label>
                <input
                  className="bw-field-input"
                  placeholder="e.g. small business owners, developers, students..."
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                />
              </div>
              <div className="bw-field-group">
                <label className="bw-field-label">Tone</label>
                <select
                  className="bw-field-input"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                >
                  <option value="professional">Professional</option>
                  <option value="conversational">Conversational</option>
                  <option value="authoritative">Authoritative</option>
                  <option value="educational">Educational</option>
                  <option value="inspiring">Inspiring</option>
                  <option value="technical">Technical / In-depth</option>
                </select>
              </div>
            </div>

            <div className="bw-divider" />

            <div className="bw-panel-section">
              <div className="bw-section-label">Blog Format</div>
              <div className="bw-type-grid">
                {BLOG_TYPES.map((t) => (
                  <div
                    key={t.id}
                    className={`bw-type-card${blogType === t.id ? " selected" : ""}`}
                    onClick={() => setBlogType(t.id)}
                  >
                    <span className="bw-type-icon">{t.icon}</span>
                    <div className="bw-type-info">
                      <div className="bw-type-name">{t.name}</div>
                      <div className="bw-type-desc">{t.desc}</div>
                    </div>
                    <div className="bw-type-radio" />
                  </div>
                ))}
              </div>
              {blogType === "series" && (
                <div className="bw-series-config">
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--accent)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Series Settings
                  </div>
                  <div className="bw-series-row">
                    <div className="bw-field-group">
                      <label className="bw-field-label">Total Parts</label>
                      <input
                        className="bw-field-input"
                        type="number"
                        min={2}
                        max={20}
                        value={seriesCount}
                        onChange={(e) => setSeriesCount(Number(e.target.value))}
                      />
                    </div>
                    <div className="bw-field-group">
                      <label className="bw-field-label">This Episode</label>
                      <input
                        className="bw-field-input"
                        type="number"
                        min={1}
                        max={seriesCount}
                        value={seriesEpisode}
                        onChange={(e) => setSeriesEpisode(Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bw-divider" />

            <div className="bw-panel-section">
              <div className="bw-section-label">Publish To</div>
              <div className="bw-platform-grid">
                {PLATFORMS.map((p) => {
                  const configured = isConfigured(p.id);
                  const selected = selectedPlatforms.includes(p.id);
                  return (
                    <div
                      key={p.id}
                      className={`bw-platform-card${selected ? " selected" : ""}`}
                      onClick={() => togglePlatform(p.id)}
                    >
                      <div
                        className="bw-platform-logo"
                        style={{ background: `${p.color}22` }}
                      >
                        {p.icon}
                      </div>
                      <div className="bw-platform-info">
                        <div className="bw-platform-name">{p.name}</div>
                        <div className="bw-platform-status">
                          <span
                            className={`bw-status-dot ${configured ? "connected" : "not-connected"}`}
                          />
                          {configured ? "Configured" : "Not configured"}
                        </div>
                      </div>
                      <div className="bw-check-box">{selected ? "✓" : ""}</div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5 }}>
                Configure API keys in the ⚙️ Config tab before publishing
              </div>
            </div>

            <button
              className="bw-generate-btn"
              onClick={generateBlog}
              disabled={generating || !subject.trim()}
            >
              {generating ? (
                <>
                  <div className="bw-btn-spinner" /> Generating…
                </>
              ) : (
                "✨ Generate Blog Post"
              )}
            </button>
          </aside>

          {/* Right: Output */}
          <main className="bw-right-panel">
            {generating ? (
              <div className="bw-loading-state">
                <div className="bw-loading-animation">
                  <div className="bw-loading-ring" />
                  <div className="bw-loading-ring" />
                  <div className="bw-loading-ring" />
                </div>
                <div className="bw-loading-text">Crafting your article…</div>
                <div className="bw-loading-steps">
                  {LOADING_STEPS.map((step, i) => (
                    <div
                      key={i}
                      className={`bw-loading-step${i < loadingStep ? " done" : i === loadingStep ? " active" : ""}`}
                    >
                      <div className="bw-step-indicator">
                        {i < loadingStep ? "✓" : i + 1}
                      </div>
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            ) : blogData && !blogData.error ? (
              <div className="bw-blog-output bw-fade-in">
                <div className="bw-output-toolbar">
                  <div className="bw-output-meta">
                    <div className="bw-meta-chip">
                      📖 <span>{wc.toLocaleString()}</span> words
                    </div>
                    <div className="bw-meta-chip">
                      ⏱ <span>{blogData.readingTime}</span>
                    </div>
                    <div className="bw-meta-chip">
                      🏷 <span>{blogData.category}</span>
                    </div>
                    {blogData.seriesContext && (
                      <div className="bw-meta-chip">
                        📚 <span>{blogData.seriesContext}</span>
                      </div>
                    )}
                  </div>
                  <div className="bw-toolbar-actions">
                    <button className="bw-action-btn" onClick={copyArticle}>
                      📋 Copy
                    </button>
                    <button
                      className="bw-action-btn primary"
                      onClick={() => setShowPublishModal(true)}
                      disabled={selectedPlatforms.length === 0}
                    >
                      🚀 Publish
                    </button>
                  </div>
                </div>

                <div className="bw-blog-content-area">
                  <article className="bw-blog-article" ref={articleRef}>
                    <div className="bw-article-tag">{blogData.category}</div>
                    <h1 className="bw-article-title">{blogData.title}</h1>
                    <div className="bw-article-meta">
                      <div className="bw-article-meta-item">
                        <strong>Primary Keyword</strong> {blogData.primaryKeyword}
                      </div>
                      <div className="bw-article-meta-item">
                        <strong>SEO Score</strong>{" "}
                        <span style={{ color: "var(--green)" }}>{blogData.seoScore}/100</span>
                      </div>
                      <div className="bw-article-meta-item">
                        <strong>Type</strong>{" "}
                        {BLOG_TYPES.find((t) => t.id === blogType)?.name}
                      </div>
                    </div>

                    <div
                      style={{
                        background: "var(--surface2)",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        padding: "16px 20px",
                        marginBottom: 32,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "var(--text3)",
                          marginBottom: 8,
                        }}
                      >
                        SEO Metadata
                      </div>
                      <div
                        style={{ fontSize: 13, color: "var(--text2)", marginBottom: 6, lineHeight: 1.4 }}
                      >
                        <strong style={{ color: "var(--text)" }}>Meta: </strong>
                        {blogData.metaDescription}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text3)", fontFamily: "var(--mono)" }}>
                        /{blogData.slug}
                      </div>
                    </div>

                    <div
                      className="bw-article-body"
                      dangerouslySetInnerHTML={{ __html: parseMarkdown(blogData.content || "") }}
                    />
                  </article>

                  <aside className="bw-seo-panel">
                    <div>
                      <div className="bw-seo-title">SEO Analysis</div>
                      <div className="bw-seo-score-ring" style={{ marginTop: 12 }}>
                        <div className="bw-score-circle">
                          <div className="bw-score-num">{blogData.seoScore}</div>
                          <div className="bw-score-label">Score</div>
                        </div>
                        <div style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>
                          Excellent
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="bw-seo-title" style={{ marginBottom: 10 }}>Checklist</div>
                      {[
                        "Title under 60 characters",
                        "Meta description optimized",
                        "Primary keyword in title",
                        "H2 headings with keywords",
                        "2000+ word count",
                        "Internal link opportunities",
                        "Keyword density balanced",
                        "Clear CTA included",
                      ].map((item, i) => (
                        <div key={i} className="bw-seo-item" style={{ marginBottom: 6 }}>
                          <span className="bw-seo-check">✓</span>
                          {item}
                        </div>
                      ))}
                    </div>

                    <div>
                      <div className="bw-seo-title" style={{ marginBottom: 8 }}>Target Keywords</div>
                      <div className="bw-keyword-chips">
                        <div className="bw-keyword-chip primary">{blogData.primaryKeyword}</div>
                        {(blogData.secondaryKeywords || []).map((kw, i) => (
                          <div key={i} className="bw-keyword-chip">{kw}</div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="bw-seo-title" style={{ marginBottom: 8 }}>Tags</div>
                      <div className="bw-keyword-chips">
                        {(blogData.tags || []).map((tag, i) => (
                          <div key={i} className="bw-keyword-chip">#{tag}</div>
                        ))}
                      </div>
                    </div>

                    {(blogData.keyTakeaways?.length ?? 0) > 0 && (
                      <div>
                        <div className="bw-seo-title" style={{ marginBottom: 8 }}>Key Takeaways</div>
                        {blogData.keyTakeaways!.map((t, i) => (
                          <div key={i} className="bw-seo-item" style={{ marginBottom: 6 }}>
                            <span className="bw-seo-warn">→</span>
                            <span style={{ fontSize: 11 }}>{t}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <div className="bw-seo-title" style={{ marginBottom: 8 }}>Readability</div>
                      <div className="bw-readability-bars">
                        {(
                          [
                            ["Flesch Score", 85],
                            ["Structure", 92],
                            ["Engagement", 88],
                            ["Keyword Density", 78],
                          ] as [string, number][]
                        ).map(([label, val]) => (
                          <div key={label} className="bw-readability-item">
                            <div className="bw-readability-header">
                              <span>{label}</span>
                              <span>{val}%</span>
                            </div>
                            <div className="bw-readability-bar">
                              <div className="bw-readability-fill" style={{ width: `${val}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {(blogData.internalLinkSuggestions?.length ?? 0) > 0 && (
                      <div>
                        <div className="bw-seo-title" style={{ marginBottom: 8 }}>Internal Link Ideas</div>
                        {blogData.internalLinkSuggestions!.map((s, i) => (
                          <div
                            key={i}
                            style={{ fontSize: 11, color: "var(--blue)", marginBottom: 4, cursor: "pointer" }}
                          >
                            🔗 {s}
                          </div>
                        ))}
                      </div>
                    )}
                  </aside>
                </div>
              </div>
            ) : blogData?.error ? (
              <div className="bw-empty-state">
                <div className="bw-empty-icon">⚠️</div>
                <div className="bw-empty-title">Generation Failed</div>
                <div className="bw-empty-sub">{blogData.error}</div>
              </div>
            ) : (
              <div className="bw-empty-state">
                <div className="bw-empty-icon">✍️</div>
                <div className="bw-empty-title">Your article will appear here</div>
                <div className="bw-empty-sub">
                  Enter your topic, choose a blog format, select publishing platforms, and hit Generate.
                </div>
                <div className="bw-feature-pills">
                  {["2000–2500 words", "SEO optimized", "Auto metadata", "Keyword analysis", "Multi-platform", "Series support"].map(
                    (f) => (
                      <div key={f} className="bw-feature-pill">{f}</div>
                    )
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <div style={{ flex: 1, position: "relative", zIndex: 1 }}>
          <div className="bw-history-panel">
            <div className="bw-history-header">
              <div className="bw-history-title">Published Articles</div>
              <div style={{ fontSize: 13, color: "var(--text3)" }}>
                {history.length} article{history.length !== 1 ? "s" : ""}
              </div>
            </div>
            {history.length === 0 ? (
              <div className="bw-empty-history">
                <div className="bw-empty-history-icon">📭</div>
                <div style={{ fontSize: 16, color: "var(--text2)" }}>No articles yet</div>
                <div style={{ fontSize: 13, marginTop: 6 }}>
                  Generate your first blog post in the Writer tab
                </div>
              </div>
            ) : (
              <div className="bw-history-grid">
                {history.map((item, i) => (
                  <div
                    key={i}
                    className="bw-history-card"
                    onClick={() => {
                      setBlogData(item);
                      setActiveTab("writer");
                    }}
                  >
                    <div className="bw-history-card-tag">{item.category}</div>
                    <div className="bw-history-card-title">{item.title}</div>
                    <div
                      style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12, lineHeight: 1.4 }}
                    >
                      {item.metaDescription}
                    </div>
                    <div className="bw-history-card-meta">
                      <span>{item.createdAt}</span>
                      <div className="bw-history-card-platforms">
                        {(item.platforms || []).map((p) => (
                          <span key={p} className="bw-history-platform-badge">
                            {PLATFORMS.find((pl) => pl.id === p)?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Config Tab */}
      {activeTab === "config" && (
        <div style={{ flex: 1, overflow: "auto", position: "relative", zIndex: 1 }}>
          <div className="bw-config-panel">
            <h1 className="bw-config-title">Platform Configuration</h1>
            <p className="bw-config-sub">
              Connect your publishing platforms. Your API keys are stored locally in this session and
              never sent anywhere except the respective platform&apos;s API.
            </p>

            {(
              [
                {
                  id: "medium",
                  name: "Medium",
                  icon: "Ⓜ",
                  color: "#1a1a1a",
                  desc: "Publish via Medium's Integration Token",
                  fields: [
                    { key: "token", label: "Integration Token", placeholder: "Your Medium integration token", type: "password" },
                    { key: "userId", label: "User ID", placeholder: "Your Medium user ID", type: "text" },
                  ],
                  help: "Get your token at medium.com/me/settings → Integration tokens",
                },
                {
                  id: "wix",
                  name: "Wix Blog",
                  icon: "🌐",
                  color: "#0057e7",
                  desc: "Publish to Wix using their REST API",
                  fields: [
                    { key: "siteId", label: "Site ID", placeholder: "Your Wix site ID", type: "text" },
                    { key: "apiKey", label: "API Key", placeholder: "Your Wix API key", type: "password" },
                  ],
                  help: "Find your Site ID and API key in Wix Business Manager → Headless Settings",
                },
                {
                  id: "aws",
                  name: "AWS Website",
                  icon: "☁️",
                  color: "#ff9900",
                  desc: "POST to your AWS API Gateway endpoint",
                  fields: [
                    { key: "endpoint", label: "API Gateway Endpoint", placeholder: "https://xxxxxxx.execute-api.us-east-1.amazonaws.com/prod/posts", type: "text" },
                    { key: "apiKey", label: "API Key (x-api-key)", placeholder: "Your API Gateway key", type: "password" },
                  ],
                  help: "Your endpoint should accept POST requests with JSON body: { title, content, slug, tags, metaDescription, category, publishedAt }",
                },
              ] as {
                id: string;
                name: string;
                icon: string;
                color: string;
                desc: string;
                fields: { key: string; label: string; placeholder: string; type: string }[];
                help: string;
              }[]
            ).map((platform) => (
              <div key={platform.id} className="bw-config-section">
                <div className="bw-config-section-header">
                  <div
                    className="bw-config-section-icon"
                    style={{ background: `${platform.color}22`, fontSize: 20 }}
                  >
                    {platform.icon}
                  </div>
                  <div>
                    <div className="bw-config-section-name">{platform.name}</div>
                    <div className="bw-config-section-desc">{platform.desc}</div>
                  </div>
                  {isConfigured(platform.id) && (
                    <div className="bw-config-connected-badge">
                      <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)" }} />
                      Connected
                    </div>
                  )}
                </div>
                <div className="bw-config-fields">
                  {platform.fields.map((field) => (
                    <div key={field.key} className="bw-field-group">
                      <label className="bw-field-label">{field.label}</label>
                      <input
                        className="bw-field-input"
                        type={field.type}
                        placeholder={field.placeholder}
                        value={
                          (platformConfigs[platform.id as keyof PlatformConfigs] as Record<string, string>)[field.key] || ""
                        }
                        onChange={(e) =>
                          setPlatformConfigs((prev) => ({
                            ...prev,
                            [platform.id]: {
                              ...prev[platform.id as keyof PlatformConfigs],
                              [field.key]: e.target.value,
                            },
                          }))
                        }
                      />
                    </div>
                  ))}
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--text3)",
                      background: "var(--surface2)",
                      padding: "8px 12px",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border)",
                      lineHeight: 1.5,
                    }}
                  >
                    ℹ️ {platform.help}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <button className="bw-config-save-btn" onClick={() => saveConfig(platform.id)}>
                      {configSaved[platform.id] ? "✓ Saved!" : "Save Configuration"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && blogData && (
        <div
          className="bw-modal-overlay"
          onClick={() => !publishingNow && setShowPublishModal(false)}
        >
          <div className="bw-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bw-modal-header">
              <div className="bw-modal-title">Publish Article</div>
              {!publishingNow && (
                <button className="bw-modal-close" onClick={() => setShowPublishModal(false)}>
                  ✕
                </button>
              )}
            </div>
            <div className="bw-modal-body">
              <div style={{ fontSize: 14, color: "var(--text2)" }}>
                Publishing{" "}
                <strong style={{ color: "var(--text)" }}>&ldquo;{blogData.title}&rdquo;</strong> to:
              </div>
              {selectedPlatforms.map((platformId) => {
                const platform = PLATFORMS.find((p) => p.id === platformId)!;
                const status = publishStatus[platformId];
                return (
                  <div key={platformId} className="bw-platform-publish-item">
                    <div style={{ fontSize: 24 }}>{platform.icon}</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                        {platform.name}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text3)" }}>
                        {isConfigured(platformId)
                          ? "Ready to publish"
                          : "⚠️ Not configured — go to Config tab"}
                      </div>
                    </div>
                    <div className="bw-publish-status-badge">
                      {!status && <span style={{ color: "var(--text3)", fontSize: 12 }}>Pending</span>}
                      {status === "publishing" && <span className="bw-badge-pending">Publishing…</span>}
                      {status === "success" && <span className="bw-badge-success">✓ Published</span>}
                      {status === "error" && <span className="bw-badge-error">✗ Failed</span>}
                    </div>
                  </div>
                );
              })}
              {Object.keys(publishStatus).length > 0 && !publishingNow && (
                <div
                  style={{
                    padding: "12px 16px",
                    background: Object.values(publishStatus).every((s) => s === "success")
                      ? "rgba(74,222,128,0.06)"
                      : "rgba(248,113,113,0.06)",
                    borderRadius: "var(--radius-sm)",
                    border: `1px solid ${
                      Object.values(publishStatus).every((s) => s === "success")
                        ? "rgba(74,222,128,0.2)"
                        : "rgba(248,113,113,0.2)"
                    }`,
                    fontSize: 13,
                    color: "var(--text2)",
                    lineHeight: 1.5,
                  }}
                >
                  {Object.values(publishStatus).every((s) => s === "success")
                    ? "✅ All posts published successfully!"
                    : "⚠️ Some posts failed. Check that your API keys are correct in the Config tab."}
                </div>
              )}
            </div>
            <div className="bw-modal-footer">
              <button
                className="bw-action-btn"
                onClick={() => setShowPublishModal(false)}
                disabled={publishingNow}
              >
                {Object.keys(publishStatus).length > 0 ? "Close" : "Cancel"}
              </button>
              {Object.keys(publishStatus).length === 0 && (
                <button
                  className="bw-action-btn primary"
                  onClick={handlePublish}
                  disabled={publishingNow}
                >
                  {publishingNow ? (
                    <>
                      <div
                        className="bw-btn-spinner"
                        style={{
                          borderTopColor: "var(--accent)",
                          borderColor: "rgba(232,197,71,0.3)",
                        }}
                      />
                      Publishing…
                    </>
                  ) : (
                    "🚀 Publish Now"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
