import { AdminVocabulary } from '@/contexts/AdminContext';

/**
 * Parse CSV string into AdminVocabulary array
 * Expected CSV format: unit,page,english,deutsch
 * Example:
 * Unit 1,1,hello,Hallo
 * Unit 1,1,goodbye,Auf Wiedersehen
 */
export function parseCSV(csvContent: string): AdminVocabulary[] {
  const lines = csvContent.split('\n').filter((line) => line.trim());
  const vocabulary: AdminVocabulary[] = [];

  // Skip header if it exists
  let startIndex = 0;
  if (
    lines[0] &&
    (lines[0].toLowerCase().includes('unit') ||
      lines[0].toLowerCase().includes('english'))
  ) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Handle quoted fields
    const fields = parseCSVLine(line);

    if (fields.length >= 4) {
      vocabulary.push({
        id: `vocab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        unit: fields[0].trim(),
        page: fields[1].trim(),
        english: fields[2].trim(),
        deutsch: fields[3].trim(),
      });
    }
  }

  return vocabulary;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      // Field separator
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current);
  return result;
}

/**
 * Convert AdminVocabulary array to CSV string
 */
export function toCSV(vocabulary: AdminVocabulary[]): string {
  const header = 'Unit,Page,English,Deutsch\n';
  const rows = vocabulary.map((item) => {
    const unit = escapeCSVField(item.unit);
    const page = escapeCSVField(item.page);
    const english = escapeCSVField(item.english);
    const deutsch = escapeCSVField(item.deutsch);
    return `${unit},${page},${english},${deutsch}`;
  });

  return header + rows.join('\n');
}

/**
 * Escape CSV field (quote if contains comma, quote, or newline)
 * Always quote fields to preserve data integrity, especially for translations with multiple meanings
 */
function escapeCSVField(field: string): string {
  // Always quote fields to preserve commas and special characters in translations
  return `"${field.replace(/"/g, '""')}"`;
}

/**
 * Download CSV file
 */
export function downloadCSV(csvContent: string, filename: string = 'vocabulary.csv'): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === 'string') {
        resolve(content);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

/**
 * Validate CSV data
 */
export function validateCSVData(data: AdminVocabulary[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!Array.isArray(data) || data.length === 0) {
    errors.push('Keine Daten zum Validieren');
    return { valid: false, errors };
  }

  data.forEach((item, index) => {
    if (!item.unit || item.unit.trim() === '') {
      errors.push(`Zeile ${index + 2}: Unit ist erforderlich`);
    }
    if (!item.page || item.page.trim() === '') {
      errors.push(`Zeile ${index + 2}: Page ist erforderlich`);
    }
    if (!item.english || item.english.trim() === '') {
      errors.push(`Zeile ${index + 2}: English ist erforderlich`);
    }
    if (!item.deutsch || item.deutsch.trim() === '') {
      errors.push(`Zeile ${index + 2}: Deutsch ist erforderlich`);
    }
  });

  return { valid: errors.length === 0, errors };
}
