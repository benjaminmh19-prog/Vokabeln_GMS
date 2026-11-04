/**
 * Minimaler Leser für .xlsx-Dateien ohne zusätzliche Abhängigkeiten (nur Node: zlib).
 * Liest das erste Tabellenblatt und liefert die Zellwerte als Zeilen (Index 0 = Spalte A).
 * Unterstützt Text (gemeinsame Texte, Inline-Text), Zahlen und Wahrheitswerte.
 * Formeln werden nicht berechnet, es zählt der gespeicherte Wert.
 */
import { inflateRawSync } from 'node:zlib';

export type CellValue = string | number | boolean | null;

function readZipEntries(buf: Buffer): Map<string, Buffer> {
  // End-of-Central-Directory-Eintrag suchen (von hinten)
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) {
    if (buf.readUInt32LE(i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) throw new Error('Keine gültige .xlsx-Datei (ZIP-Verzeichnis nicht gefunden).');
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const entries = new Map<string, Buffer>();
  for (let n = 0; n < count; n++) {
    if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('Beschädigtes ZIP-Verzeichnis.');
    const method = buf.readUInt16LE(p + 10);
    const compSize = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const localOffset = buf.readUInt32LE(p + 42);
    const name = buf.toString('utf8', p + 46, p + 46 + nameLen);
    p += 46 + nameLen + extraLen + commentLen;

    const lNameLen = buf.readUInt16LE(localOffset + 26);
    const lExtraLen = buf.readUInt16LE(localOffset + 28);
    const start = localOffset + 30 + lNameLen + lExtraLen;
    const data = buf.subarray(start, start + compSize);
    if (method === 0) entries.set(name, Buffer.from(data));
    else if (method === 8) entries.set(name, inflateRawSync(data));
    else throw new Error(`Nicht unterstütztes ZIP-Verfahren ${method} in ${name}.`);
  }
  return entries;
}

function decodeXml(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function textOf(xml: string): string {
  let out = '';
  const re = /<t(?:\s[^>]*)?>([\s\S]*?)<\/t>|<t\s*\/>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) out += decodeXml(m[1] ?? '');
  return out;
}

function colIndex(ref: string): number {
  const letters = /^[A-Z]+/i.exec(ref)?.[0].toUpperCase() ?? 'A';
  let n = 0;
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n - 1;
}

function attr(attrs: string, name: string): string | undefined {
  const m = new RegExp(`(?:^|\\s)${name}="([^"]*)"`).exec(attrs);
  return m ? decodeXml(m[1]) : undefined;
}

export function readXlsxRows(buf: Buffer): CellValue[][] {
  const files = readZipEntries(buf);
  const get = (name: string) => files.get(name)?.toString('utf8');

  // erstes Blatt über workbook.xml und deren Beziehungen finden
  let sheetPath = 'xl/worksheets/sheet1.xml';
  const wb = get('xl/workbook.xml');
  const rels = get('xl/_rels/workbook.xml.rels');
  if (wb && rels) {
    const sheetTag = /<sheet\s[^>]*>/.exec(wb)?.[0];
    const rid = sheetTag ? /r:id="([^"]+)"/.exec(sheetTag)?.[1] : undefined;
    if (rid) {
      const relRe = /<Relationship\s[^>]*>/g;
      let m: RegExpExecArray | null;
      while ((m = relRe.exec(rels))) {
        if (attr(m[0], 'Id') === rid) {
          const target = attr(m[0], 'Target') ?? '';
          sheetPath = target.startsWith('/') ? target.slice(1) : `xl/${target.replace(/^\.?\//, '')}`;
          break;
        }
      }
    }
  }
  const sheet = get(sheetPath);
  if (!sheet) throw new Error(`Tabellenblatt ${sheetPath} nicht gefunden.`);

  const shared: string[] = [];
  const sst = get('xl/sharedStrings.xml');
  if (sst) {
    const siRe = /<si>([\s\S]*?)<\/si>|<si\s*\/>/g;
    let m: RegExpExecArray | null;
    while ((m = siRe.exec(sst))) shared.push(textOf(m[1] ?? ''));
  }

  const rows: CellValue[][] = [];
  const rowRe = /<row\s([^>]*?)(?:\/>|>([\s\S]*?)<\/row>)/g;
  let rm: RegExpExecArray | null;
  let autoRow = 0;
  while ((rm = rowRe.exec(sheet))) {
    autoRow++;
    const rIdx = parseInt(attr(rm[1], 'r') ?? String(autoRow), 10) - 1;
    const cells: CellValue[] = [];
    const cellRe = /<c\s([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
    let cm: RegExpExecArray | null;
    while ((cm = cellRe.exec(rm[2] ?? ''))) {
      const attrs = cm[1];
      const body = cm[2] ?? '';
      const ref = attr(attrs, 'r') ?? '';
      const type = attr(attrs, 't');
      const idx = ref ? colIndex(ref) : cells.length;
      const v = /<v>([\s\S]*?)<\/v>/.exec(body)?.[1];
      let value: CellValue = null;
      if (type === 'inlineStr') value = textOf(body);
      else if (v !== undefined) {
        if (type === 's') value = shared[parseInt(v, 10)] ?? '';
        else if (type === 'b') value = v === '1';
        else if (type === 'str' || type === 'e') value = decodeXml(v);
        else value = Number(v);
      }
      while (cells.length < idx) cells.push(null);
      cells[idx] = value;
    }
    while (rows.length < rIdx) rows.push([]);
    rows[rIdx] = cells;
  }
  return rows;
}
