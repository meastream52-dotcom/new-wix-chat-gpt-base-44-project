/**
 * Dependency-free RFC 4180 CSV parser. Handles quoted fields, escaped quotes
 * (""), and embedded commas/newlines. Returns objects keyed by header row.
 */

function parseRows(input: string): string[][] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  let i = 0;

  while (i < input.length) {
    const c = input[i]!;

    if (inQuotes) {
      if (c === '"') {
        if (input[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i += 1;
        continue;
      }
      field += c;
      i += 1;
      continue;
    }

    if (c === '"') {
      inQuotes = true;
      i += 1;
    } else if (c === ",") {
      row.push(field);
      field = "";
      i += 1;
    } else if (c === "\r") {
      i += 1;
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i += 1;
    } else {
      field += c;
      i += 1;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

/** Parse CSV text into header-keyed records. Empty trailing rows are dropped. */
export function parseCsv(input: string): Record<string, string>[] {
  const rows = parseRows(input).filter(
    (r) => !(r.length === 1 && r[0]!.trim() === "")
  );
  if (rows.length === 0) return [];

  const headers = rows[0]!.map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const record: Record<string, string> = {};
    headers.forEach((h, idx) => {
      record[h] = (r[idx] ?? "").trim();
    });
    return record;
  });
}
