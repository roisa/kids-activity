#!/usr/bin/env node
// Generate themed coloring-page line art for the Kids Activity Generator.
//
// Pipeline: theme prompt → image-gen API → PNG → potrace → SVG → write to
// src/assets/coloring/<theme>/<NN>.svg, which the runtime loader picks up
// automatically via Vite's import.meta.glob.
//
// Default provider is Pollinations.ai — no API key, no signup, free.
// Quality is good for FLUX-generated coloring pages. Swap with --provider=openai
// for cleaner output (needs OPENAI_API_KEY, ~$0.04/image).
//
// Usage:
//   node scripts/generate-coloring.mjs --all
//   node scripts/generate-coloring.mjs --theme=dinosaurs --count=4
//   node scripts/generate-coloring.mjs --theme=space --count=2 --provider=openai

import { mkdir, writeFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { setTimeout as wait } from 'node:timers/promises';
import path from 'node:path';
import process from 'node:process';
import potrace from 'potrace';

import { THEMES } from '../src/data/themes.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const OUTPUT_ROOT = path.join(REPO_ROOT, 'src/assets/coloring');

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, v = 'true'] = a.replace(/^--/, '').split('=');
    return [k, v];
  }),
);

const PROVIDER = (args.provider || 'pollinations').toLowerCase();
const COUNT = parseInt(args.count || '4', 10);
const SINGLE_THEME = args.theme || null;
const ALL = !!args.all;
const OVERWRITE = !!args.overwrite;

function buildPrompt(scenePrompt) {
  // Style instructions tuned for kids' coloring pages.
  return [
    `Black and white coloring book page for young children: ${scenePrompt}`,
    'Bold thick black outlines, no shading, no fill, no gradients, no color.',
    'Pure white background. Simple cartoon style, friendly, cute, age-appropriate.',
    'Large clear shapes that are easy for a child to color inside.',
    'Centered composition with generous white space.',
  ].join(' ');
}

// --- Providers -------------------------------------------------------------

async function generatePollinations(prompt, seed) {
  // Pollinations.ai — free, no key. FLUX by default.
  const url = new URL(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);
  url.searchParams.set('width', '1024');
  url.searchParams.set('height', '1024');
  url.searchParams.set('nologo', 'true');
  url.searchParams.set('enhance', 'false');
  url.searchParams.set('model', 'flux');
  url.searchParams.set('seed', String(seed));
  const delays = [5000, 10000, 20000, 40000];
  for (let attempt = 0; attempt <= delays.length; attempt++) {
    const res = await fetch(url, { headers: { Accept: 'image/png' } });
    if (res.ok) return Buffer.from(await res.arrayBuffer());
    const body = await res.text();
    if ((res.status === 402 || res.status === 500) && attempt < delays.length) {
      const wait = delays[attempt];
      console.log(`  ↻ rate-limited (${res.status}), retrying in ${wait / 1000}s…`);
      await new Promise((r) => setTimeout(r, wait));
    } else {
      throw new Error(`Pollinations ${res.status}: ${body}`);
    }
  }
}

async function generateOpenAI(prompt) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY is required for --provider=openai');
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
      response_format: 'b64_json',
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${await res.text()}`);
  const json = await res.json();
  return Buffer.from(json.data[0].b64_json, 'base64');
}

async function generateImage(prompt, seed) {
  if (PROVIDER === 'pollinations') return generatePollinations(prompt, seed);
  if (PROVIDER === 'openai') return generateOpenAI(prompt);
  throw new Error(`Unknown provider: ${PROVIDER}`);
}

// --- Trace -----------------------------------------------------------------

function traceToSvg(pngBuffer) {
  return new Promise((resolve, reject) => {
    const trace = new potrace.Potrace({
      threshold: 180,
      turdSize: 80,
      optTolerance: 0.4,
      color: '#1b1f3a',
      background: 'transparent',
    });
    trace.loadImage(pngBuffer, (err) => {
      if (err) return reject(err);
      resolve(trace.getSVG());
    });
  });
}

// Strip filled regions to leave outlines only, and ensure the SVG scales
// inside a nested host. Keeps the original viewBox.
function postProcessSvg(svgString) {
  return svgString
    .replace(/<svg([^>]*)>/, (m, attrs) => {
      const cleaned = attrs.replace(/\s(width|height)="[^"]*"/g, '');
      return `<svg${cleaned} preserveAspectRatio="xMidYMid meet">`;
    })
    .replace(/fill="#[0-9a-fA-F]+"/g, 'fill="#1b1f3a"')
    .replace(/<rect[^>]*\/>\s*/g, ''); // drop any background rect potrace may emit
}

// --- Theme loop ------------------------------------------------------------

async function existingCount(themeDir) {
  try {
    const files = await readdir(themeDir);
    return files.filter((f) => f.endsWith('.svg')).length;
  } catch {
    return 0;
  }
}

async function generateForTheme(theme, count) {
  const themeDir = path.join(OUTPUT_ROOT, theme.id);
  await mkdir(themeDir, { recursive: true });
  const existing = OVERWRITE ? 0 : await existingCount(themeDir);
  if (existing >= count) {
    console.log(`[${theme.id}] already has ${existing} SVG(s) (>= ${count}); skipping. Use --overwrite to regenerate.`);
    return;
  }
  const prompts = theme.coloringPrompts;
  for (let i = existing; i < count; i++) {
    const scene = prompts[i % prompts.length];
    const prompt = buildPrompt(scene);
    const seed = hash(`${theme.id}-${i}`);
    console.log(`[${theme.id}] (${i + 1}/${count}) ${PROVIDER}: "${scene.slice(0, 60)}…"`);
    try {
      const png = await generateImage(prompt, seed);
      const rawSvg = await traceToSvg(png);
      const finalSvg = postProcessSvg(rawSvg);
      const outFile = path.join(themeDir, `${String(i + 1).padStart(2, '0')}.svg`);
      await writeFile(outFile, finalSvg);
      console.log(`  → ${path.relative(REPO_ROOT, outFile)} (${(finalSvg.length / 1024).toFixed(1)} KB)`);
      // Be polite to free APIs.
      if (PROVIDER === 'pollinations') await wait(800);
    } catch (err) {
      console.error(`  ✕ failed: ${err.message}`);
    }
  }
}

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

async function main() {
  await mkdir(OUTPUT_ROOT, { recursive: true });
  const themes = ALL
    ? THEMES
    : SINGLE_THEME
      ? THEMES.filter((t) => t.id === SINGLE_THEME)
      : THEMES.slice(0, 1);
  if (!themes.length) {
    console.error(`No themes matched (id="${SINGLE_THEME}")`);
    process.exit(1);
  }
  console.log(`Provider: ${PROVIDER}  ·  themes: ${themes.map((t) => t.id).join(', ')}  ·  count: ${COUNT}`);
  for (const theme of themes) {
    await generateForTheme(theme, COUNT);
  }
  console.log('\nDone. Commit the new SVGs under src/assets/coloring/ to bundle them.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
