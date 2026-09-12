#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const defaultInputPath = path.resolve(
  scriptDirectory,
  "../word-admin/temp/PEPXiaoXue6_1.json",
);
const inputPath = path.resolve(process.argv[2] ?? defaultInputPath);
const outputPath = path.resolve(
  process.argv[3] ?? path.join(
    path.dirname(inputPath),
    `${path.basename(inputPath, path.extname(inputPath))}.csv`,
  ),
);

function parseJsonRecords(source) {
  const text = source.replace(/^\uFEFF/, "").trim();
  if (!text) return [];

  try {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // The source file contains multiple pretty-printed JSON objects without
    // commas or an enclosing array, so split only at complete top-level values.
  }

  const records = [];
  let cursor = 0;

  while (cursor < text.length) {
    while (/\s/.test(text[cursor] ?? "")) cursor += 1;
    if (cursor >= text.length) break;
    if (text[cursor] !== "{") {
      throw new SyntaxError(`Unexpected character at position ${cursor}; expected "{".`);
    }

    const start = cursor;
    let depth = 0;
    let inString = false;
    let escaped = false;

    for (; cursor < text.length; cursor += 1) {
      const character = text[cursor];

      if (inString) {
        if (escaped) escaped = false;
        else if (character === "\\") escaped = true;
        else if (character === '"') inString = false;
        continue;
      }

      if (character === '"') inString = true;
      else if (character === "{" || character === "[") depth += 1;
      else if (character === "}" || character === "]") depth -= 1;

      if (depth === 0) {
        const value = JSON.parse(text.slice(start, cursor + 1));
        records.push(value);
        cursor += 1;
        break;
      }
    }

    if (depth !== 0 || inString) {
      throw new SyntaxError(`Incomplete JSON object beginning at position ${start}.`);
    }
  }

  return records;
}

function csvCell(value) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

function toCsv(records) {
  const header = "wordRank,headWord,content,bookId";
  const rows = records.map((record, index) => {
    if (!record || typeof record !== "object" || Array.isArray(record)) {
      throw new TypeError(`Record ${index + 1} is not a JSON object.`);
    }

    return [
      record.wordRank,
      record.headWord,
      record.content === undefined ? "" : JSON.stringify(record.content),
      record.bookId,
    ].map(csvCell).join(",");
  });

  return `${[header, ...rows].join("\r\n")}\r\n`;
}

try {
  const source = await readFile(inputPath, "utf8");
  const records = parseJsonRecords(source);
  const csv = toCsv(records);
  await writeFile(outputPath, csv, "utf8");
  console.log(`Converted ${records.length} records to ${outputPath}`);
} catch (error) {
  console.error(`Conversion failed: ${error instanceof Error ? error.message : error}`);
  process.exitCode = 1;
}
