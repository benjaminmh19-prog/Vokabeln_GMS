import { jsPDF } from 'jspdf';
import { Vocabulary } from '@/types/game';

export interface TestOptions {
  title: string;
  instructions: string;
  testType: 'english-to-german' | 'german-to-english' | 'mixed';
  includeAnswerKey: boolean;
  vocabularyList: Vocabulary[];
  preserveOrder?: boolean; // If true, don't shuffle the vocabulary list
  header?: string; // Optional header text (e.g., class, teacher, date)
}

/**
 * Generate a vocabulary test PDF in DIN A4 format
 */
export function generateVocabularyTestPDF(options: TestOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  const fillInLineWidth = pageWidth / 3;
  let yPosition = margin;

  // Set default font
  doc.setFont('Helvetica');

  // Title
  doc.setFontSize(20);
  doc.setTextColor(46, 49, 146); // #2E3192
  doc.text(options.title, margin, yPosition);
  yPosition += 15;

  // Optional Header
  if (options.header) {
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    const headerLines = doc.splitTextToSize(options.header, contentWidth);
    doc.text(headerLines, margin, yPosition);
    yPosition += headerLines.length * 4 + 3;
  }

  // Student info fields (to be filled in by hand)
  yPosition = drawStudentInfoFields(doc, margin, fillInLineWidth, yPosition);

  // Instructions
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const instructionLines = doc.splitTextToSize(options.instructions, contentWidth);
  doc.text(instructionLines, margin, yPosition);
  yPosition += instructionLines.length * 5 + 5;

  // Separator line
  doc.setDrawColor(46, 49, 146);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  // Test content
  // Only shuffle if preserveOrder is not set to true
  const testVocabulary = options.preserveOrder ? [...options.vocabularyList] : shuffleArray([...options.vocabularyList]);

  testVocabulary.forEach((vocab, index) => {
    // Check if we need a new page
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }

    // Question number
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('Helvetica', 'bold');

    let questionText = '';
    let answerText = '';

    if (options.testType === 'english-to-german') {
      questionText = `${index + 1}. ${vocab.english}`;
      answerText = vocab.deutsch;
    } else if (options.testType === 'german-to-english') {
      questionText = `${index + 1}. ${vocab.deutsch}`;
      answerText = vocab.english;
    } else {
      // Mixed: alternate between EN->DE and DE->EN
      if (index % 2 === 0) {
        questionText = `${index + 1}. ${vocab.english}`;
        answerText = vocab.deutsch;
      } else {
        questionText = `${index + 1}. ${vocab.deutsch}`;
        answerText = vocab.english;
      }
    }

    doc.text(questionText, margin, yPosition);
    yPosition += 7;

    // Answer line (1/3 page width)
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.line(margin + 5, yPosition, margin + 5 + fillInLineWidth, yPosition);
    yPosition += 8;

    // Show answer in answer key
    if (options.includeAnswerKey) {
      doc.setFontSize(9);
      doc.setTextColor(100, 150, 100);
      doc.setFont('Helvetica', 'italic');
      doc.text(`Lösung: ${answerText}`, margin + 10, yPosition - 3);
      yPosition += 2;
    }

    yPosition += 3;
  });

  // Percentage field below test vocabulary
  if (yPosition > pageHeight - 25) {
    doc.addPage();
    yPosition = margin;
  } else {
    yPosition += 5;
  }

  doc.setDrawColor(46, 49, 146);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 8;

  drawFillInField(doc, 'Percentage:', margin, yPosition, fillInLineWidth);

  // Answer key page (if requested)
  if (options.includeAnswerKey) {
    doc.addPage();
    yPosition = margin;

    // Answer key title
    doc.setFontSize(16);
    doc.setTextColor(46, 49, 146);
    doc.setFont('Helvetica', 'bold');
    doc.text('LÖSUNGSSCHLÜSSEL', margin, yPosition);
    yPosition += 12;

    // Separator line
    doc.setDrawColor(46, 49, 146);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    testVocabulary.forEach((vocab, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.setFont('Helvetica', 'normal');

      let questionText = '';
      let answerText = '';

      if (options.testType === 'english-to-german') {
        questionText = `${index + 1}. ${vocab.english}`;
        answerText = vocab.deutsch;
      } else if (options.testType === 'german-to-english') {
        questionText = `${index + 1}. ${vocab.deutsch}`;
        answerText = vocab.english;
      } else {
        if (index % 2 === 0) {
          questionText = `${index + 1}. ${vocab.english}`;
          answerText = vocab.deutsch;
        } else {
          questionText = `${index + 1}. ${vocab.deutsch}`;
          answerText = vocab.english;
        }
      }

      doc.text(`${questionText} → ${answerText}`, margin, yPosition);
      yPosition += 8;
    });
  }

  // Save PDF
  const filename = `Vokabeltest_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}

function drawFillInField(
  doc: jsPDF,
  label: string,
  x: number,
  y: number,
  lineWidth: number
): void {
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('Helvetica', 'normal');
  doc.text(label, x, y);

  const lineStart = x + doc.getTextWidth(label) + 2;
  doc.setDrawColor(0, 0, 0);
  doc.line(lineStart, y + 1, lineStart + lineWidth, y + 1);
}

function drawStudentInfoFields(
  doc: jsPDF,
  margin: number,
  lineWidth: number,
  y: number
): number {
  drawFillInField(doc, 'Name:', margin, y, lineWidth);
  drawFillInField(doc, 'Date:', margin, y + 8, lineWidth);

  return y + 20;
}

/**
 * Shuffle array (Fisher-Yates algorithm)
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate default instructions based on test type
 */
export function getDefaultInstructions(testType: 'english-to-german' | 'german-to-english' | 'mixed'): string {
  const instructions: Record<string, string> = {
    'english-to-german': 'Übersetze die englischen Wörter ins Deutsche. Schreibe deine Antwort auf die Linie.',
    'german-to-english': 'Übersetze die deutschen Wörter ins Englische. Schreibe deine Antwort auf die Linie.',
    'mixed': 'Übersetze die Wörter. Manche sind auf Englisch, manche auf Deutsch. Schreibe deine Antwort auf die Linie.',
  };
  return instructions[testType] || instructions['english-to-german'];
}
