import { jsPDF } from 'jspdf';
import { Vocabulary } from '@/types/game';

export type TestType =
  | 'english-to-german'
  | 'german-to-english'
  | 'mixed'
  | 'sentences-de-en'
  | 'sentences-en-de';

/** Satz-Tests: Die Einträge sind Sätze (english = englischer Satz, deutsch = deutscher Satz). */
export function isSentenceTest(testType: TestType): boolean {
  return testType === 'sentences-de-en' || testType === 'sentences-en-de';
}

/** Frage und Lösung für Eintrag Nummer `index` (0-basiert). */
export function buildQuestionAnswer(
  testType: TestType,
  vocab: { english: string; deutsch: string },
  index: number,
): { question: string; answer: string } {
  const enToDe = testType === 'english-to-german' || testType === 'sentences-en-de' || (testType === 'mixed' && index % 2 === 0);
  return enToDe
    ? { question: vocab.english, answer: vocab.deutsch }
    : { question: vocab.deutsch, answer: vocab.english };
}

export interface TestOptions {
  title: string;
  instructions: string;
  testType: TestType;
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

    const qa = buildQuestionAnswer(options.testType, vocab, index);
    const answerText = qa.answer;
    const sentenceMode = isSentenceTest(options.testType);
    // Sätze können länger sein als eine Zeile: umbrechen und volle Breite für die Antwort
    const questionLines: string[] = doc.splitTextToSize(`${index + 1}. ${qa.question}`, contentWidth);

    // Platz für Frage + Antwortlinie sicherstellen
    if (yPosition + questionLines.length * 5.5 + 16 > pageHeight - 15) {
      doc.addPage();
      yPosition = margin;
    }

    doc.text(questionLines, margin, yPosition);
    yPosition += questionLines.length * 5.5 + 1.5;

    // Answer line (1/3 page width for words, full width for sentences)
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    const lineLength = sentenceMode ? contentWidth - 5 : fillInLineWidth;
    yPosition += sentenceMode ? 4 : 0;
    doc.line(margin + 5, yPosition, margin + 5 + lineLength, yPosition);
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

      const qa = buildQuestionAnswer(options.testType, vocab, index);
      const keyLines: string[] = doc.splitTextToSize(`${index + 1}. ${qa.question} → ${qa.answer}`, contentWidth);
      if (yPosition + keyLines.length * 5 > pageHeight - 15) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(keyLines, margin, yPosition);
      yPosition += keyLines.length * 5 + 3;

    });
  }

  // Save PDF
  const filename = `${isSentenceTest(options.testType) ? 'Satztest' : 'Vokabeltest'}_${new Date().toISOString().split('T')[0]}.pdf`;
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
export function getDefaultInstructions(testType: TestType): string {
  const instructions: Record<string, string> = {
    'sentences-de-en': 'Übersetze die deutschen Sätze ins Englische. Schreibe jeden Satz vollständig auf die Linie.',
    'sentences-en-de': 'Übersetze die englischen Sätze ins Deutsche. Schreibe jeden Satz vollständig auf die Linie.',
    'english-to-german': 'Übersetze die englischen Wörter ins Deutsche. Schreibe deine Antwort auf die Linie.',
    'german-to-english': 'Übersetze die deutschen Wörter ins Englische. Schreibe deine Antwort auf die Linie.',
    'mixed': 'Übersetze die Wörter. Manche sind auf Englisch, manche auf Deutsch. Schreibe deine Antwort auf die Linie.',
  };
  return instructions[testType] || instructions['english-to-german'];
}
