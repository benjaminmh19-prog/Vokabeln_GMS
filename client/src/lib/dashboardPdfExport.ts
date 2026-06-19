import jsPDF from 'jspdf';
import { DashboardStats } from '@/lib/dashboardStats';

export function exportDashboardToPDF(stats: DashboardStats) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (spaceNeeded: number) => {
    if (yPosition + spaceNeeded > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
    }
  };

  // Header
  doc.setFillColor(46, 49, 146); // #2E3192
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(255, 217, 61); // #FFD93D
  doc.text('VOKABEL-CHAMPION', margin, 15);
  doc.setFontSize(12);
  doc.setTextColor(255, 217, 61);
  doc.text('Lehrer-Dashboard Bericht', margin, 22);

  yPosition = 40;

  // Report Date
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const now = new Date();
  const dateStr = now.toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.text(`Bericht erstellt: ${dateStr}`, margin, yPosition);
  yPosition += 10;

  // Overview Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(46, 49, 146);
  doc.text('ÜBERSICHT', margin, yPosition);
  yPosition += 8;

  // Overview Cards
  const cardWidth = (contentWidth - 6) / 4;
  const cardHeight = 25;
  const cardData = [
    { label: 'SPIELER', value: stats.totalPlayers.toString() },
    { label: 'SPIELE', value: stats.totalGames.toString() },
    { label: 'DURCHSCHNITT', value: stats.averageScore.toString() },
    { label: 'FEHLER', value: stats.totalErrors.toString() },
  ];

  cardData.forEach((card, idx) => {
    const xPos = margin + idx * (cardWidth + 1.5);
    doc.setFillColor(255, 217, 61); // #FFD93D
    doc.rect(xPos, yPosition, cardWidth, cardHeight, 'F');
    doc.setDrawColor(46, 49, 146);
    doc.setLineWidth(0.5);
    doc.rect(xPos, yPosition, cardWidth, cardHeight);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(46, 49, 146);
    doc.text(card.label, xPos + cardWidth / 2, yPosition + 6, {
      align: 'center',
    });

    doc.setFontSize(14);
    doc.text(card.value, xPos + cardWidth / 2, yPosition + 17, {
      align: 'center',
    });
  });

  yPosition += cardHeight + 12;

  // Top Players Section
  checkPageBreak(50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(46, 49, 146);
  doc.text('TOP 5 SPIELER', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const tableData = stats.topPlayers.map((player, idx) => [
    (idx + 1).toString(),
    player.name,
    player.gamesPlayed.toString(),
    player.averageScore.toFixed(1),
    player.totalScore.toString(),
  ]);

  const columns = ['#', 'Spieler', 'Spiele', 'Ø Punkte', 'Gesamt'];
  const colWidths = [10, 60, 20, 25, 25];

  // Table header
  doc.setFillColor(46, 49, 146);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');

  let xPos = margin;
  columns.forEach((col, idx) => {
    doc.rect(xPos, yPosition, colWidths[idx], 7, 'F');
    doc.text(col, xPos + colWidths[idx] / 2, yPosition + 5, {
      align: 'center',
    });
    xPos += colWidths[idx];
  });

  yPosition += 7;

  // Table rows
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  tableData.forEach((row, rowIdx) => {
    if (rowIdx % 2 === 0) {
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, contentWidth, 6, 'F');
    }

    xPos = margin;
    row.forEach((cell, colIdx) => {
      doc.text(cell, xPos + colWidths[colIdx] / 2, yPosition + 4.5, {
        align: 'center',
      });
      xPos += colWidths[colIdx];
    });

    yPosition += 6;
  });

  yPosition += 8;

  // Test Statistics Section
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(46, 49, 146);
  doc.text('TEST-STATISTIKEN', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  // Tests by Unit
  const unitData = Object.entries(stats.testStats.testsByUnit);
  if (unitData.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Tests nach Unit:', margin, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    unitData.forEach(([unit, count]) => {
      doc.text(`${unit}: ${count}`, margin + 5, yPosition);
      yPosition += 5;
    });
    yPosition += 3;
  }

  // Tests by Type
  const typeData = Object.entries(stats.testStats.testsByType);
  if (typeData.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('Tests nach Typ:', margin, yPosition);
    yPosition += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const typeLabels: Record<string, string> = {
      'english-to-german': 'Englisch → Deutsch',
      'german-to-english': 'Deutsch → Englisch',
      mixed: 'Gemischt',
    };

    typeData.forEach(([type, count]) => {
      const label = typeLabels[type] || type;
      doc.text(`${label}: ${count}`, margin + 5, yPosition);
      yPosition += 5;
    });
  }

  yPosition += 5;

  // Error Analysis Section
  checkPageBreak(60);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(46, 49, 146);
  doc.text('FEHLERANALYSE', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const errorTableData = stats.errorStats.topErrorWords.map((error, idx) => [
    (idx + 1).toString(),
    error.word,
    error.errorCount.toString(),
    `${error.percentage}%`,
  ]);

  const errorColumns = ['#', 'Wort', 'Fehler', '%'];
  const errorColWidths = [10, 100, 30, 30];

  // Error table header
  doc.setFillColor(220, 53, 69); // Red
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');

  xPos = margin;
  errorColumns.forEach((col, idx) => {
    doc.rect(xPos, yPosition, errorColWidths[idx], 7, 'F');
    doc.text(col, xPos + errorColWidths[idx] / 2, yPosition + 5, {
      align: 'center',
    });
    xPos += errorColWidths[idx];
  });

  yPosition += 7;

  // Error table rows
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  errorTableData.forEach((row, rowIdx) => {
    if (rowIdx % 2 === 0) {
      doc.setFillColor(245, 245, 245);
      doc.rect(margin, yPosition, contentWidth, 6, 'F');
    }

    xPos = margin;
    row.forEach((cell, colIdx) => {
      doc.text(cell, xPos + errorColWidths[colIdx] / 2, yPosition + 4.5, {
        align: 'center',
      });
      xPos += errorColWidths[colIdx];
    });

    yPosition += 6;
  });

  yPosition += 8;

  // Summary Statistics
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(46, 49, 146);
  doc.text('ZUSAMMENFASSUNG', margin, yPosition);
  yPosition += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);

  const summaryData = [
    `Tests erstellt: ${stats.testStats.totalTests}`,
    `Fehler-Wörter: ${stats.errorStats.totalErrorWords}`,
    `Durchschn. Fehler/Spiel: ${stats.totalGames > 0 ? (stats.totalErrors / stats.totalGames).toFixed(1) : 0}`,
    `Erfolgsquote: ${stats.totalGames > 0 ? (((stats.totalGames * 100 - stats.totalErrors) / (stats.totalGames * 100)) * 100).toFixed(0) : 0}%`,
  ];

  summaryData.forEach((item) => {
    doc.text(item, margin + 5, yPosition);
    yPosition += 6;
  });

  // Footer
  const pageCount = (doc as any).internal.pages.length - 1;
  for (let i = 1; i <= pageCount; i++) {
    (doc as any).setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Seite ${i} von ${pageCount}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Download PDF
  const filename = `Vokabel-Champion-Bericht-${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
}
