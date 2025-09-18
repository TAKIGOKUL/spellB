#!/usr/bin/env node
// Fetch audio files listed in a Google Sheet CSV and save to public/audio
// Usage: SHEET_CSV_URL=<csv_export_url> node scripts/fetch-audio.mjs

import fs from 'node:fs/promises'
import path from 'node:path'
import Papa from 'papaparse'

const projectRoot = path.resolve(new URL('.', import.meta.url).pathname, '..', '..')
const audioDir = path.join(projectRoot, 'public', 'audio')

const DEFAULT_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/11AbB__00b6J5Dh6_T4Aq0jTw690VZNdz5sOqTwzIna8/export?format=csv&gid=0'
const csvUrl = process.env.SHEET_CSV_URL || DEFAULT_SHEET_CSV_URL

function sanitizeWordToFilename(word) {
  return String(word)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\-]/g, '')
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

async function downloadToFile(url, filepath) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`)
  }
  const arrayBuffer = await res.arrayBuffer()
  await fs.writeFile(filepath, Buffer.from(arrayBuffer))
}

function inferExtFromResponseUrlOrType(url, contentType) {
  const u = new URL(url)
  const extFromPath = path.extname(u.pathname).toLowerCase().replace('.', '')
  if (extFromPath) return extFromPath
  if (contentType?.includes('mpeg')) return 'mp3'
  if (contentType?.includes('wav')) return 'wav'
  if (contentType?.includes('ogg')) return 'ogg'
  return 'mp3'
}

async function main() {
  console.log(`Fetching CSV: ${csvUrl}`)
  await ensureDir(audioDir)
  const csvRes = await fetch(csvUrl)
  if (!csvRes.ok) throw new Error(`Failed to fetch CSV: ${csvRes.status} ${csvRes.statusText}`)
  const csvText = await csvRes.text()
  let downloads = []

  // First try: headered parse expecting columns like Word/Audio
  const parsedHeader = Papa.parse(csvText, { header: true, skipEmptyLines: true })
  if (Array.isArray(parsedHeader.data) && parsedHeader.data.length) {
    /** @type {Array<Record<string,string>>} */
    const rows = parsedHeader.data
    const get = (row, keys) => keys.map(k => row[k]).find(Boolean)
    for (const row of rows) {
      const word = get(row, ['Word', 'WORD', 'word'])
      const audio = get(row, ['Audio', 'AUDIO', 'audio', 'Link', 'URL'])
      const hasUrl = typeof audio === 'string' && /^https?:\/\//i.test(audio)
      if (!word || !hasUrl) continue
      const name = sanitizeWordToFilename(word)
      downloads.push({ word, url: audio, name })
    }
  }

  // Fallback: no usable header; detect column indices
  if (downloads.length === 0) {
    const parsedRows = Papa.parse(csvText, { header: false, skipEmptyLines: true }).data
    // Find header row where includes 'Word' and 'Audio'
    let headerRowIndex = -1
    let wordIdx = -1
    let audioIdx = -1
    for (let i = 0; i < Math.min(5, parsedRows.length); i++) {
      const row = parsedRows[i]
      const idxW = row.findIndex(v => String(v).toLowerCase() === 'word' || String(v).toLowerCase() === 'word ')
      const idxA = row.findIndex(v => ['audio', 'link', 'url'].includes(String(v).toLowerCase()))
      if (idxW !== -1 && idxA !== -1) {
        headerRowIndex = i
        wordIdx = idxW
        audioIdx = idxA
        break
      }
    }
    if (headerRowIndex !== -1) {
      for (let i = headerRowIndex + 1; i < parsedRows.length; i++) {
        const row = parsedRows[i]
        const word = row[wordIdx]
        const audio = row[audioIdx]
        const hasUrl = typeof audio === 'string' && /^https?:\/\//i.test(audio)
        if (!word || !hasUrl) continue
        const name = sanitizeWordToFilename(word)
        downloads.push({ word, url: audio, name })
      }
    }
  }

  console.log(`Found ${downloads.length} items with audio URLs`)

  let completed = 0
  const results = []
  for (const item of downloads) {
    try {
      const resp = await fetch(item.url, { method: 'GET' })
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`)
      const type = resp.headers.get('content-type') || ''
      const ext = inferExtFromResponseUrlOrType(item.url, type)
      const filepath = path.join(audioDir, `${item.name}.${ext}`)
      const arrayBuffer = await resp.arrayBuffer()
      await fs.writeFile(filepath, Buffer.from(arrayBuffer))
      results.push({ word: item.word, file: `audio/${item.name}.${ext}` })
      completed += 1
      if (completed % 10 === 0) console.log(`Downloaded ${completed}/${downloads.length}`)
    } catch (e) {
      console.warn(`Skip ${item.word}: ${e.message}`)
    }
  }

  // Write a small manifest for the app to use if desired
  const manifestPath = path.join(projectRoot, 'public', 'audio-manifest.json')
  await fs.writeFile(manifestPath, JSON.stringify(results, null, 2))
  console.log(`Saved manifest: public/audio-manifest.json with ${results.length} entries`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})


