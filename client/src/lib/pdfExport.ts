import { jsPDF } from 'jspdf';

export interface VocabularyItem {
  id: string;
  unit: string;
  page: string;
  english: string;
  deutsch: string;
  collection_id?: string;
}

export interface CollectionInfo {
  id: string;
  name: string;
  learning_year: number;
  description?: string;
}

export async function exportVocabularyToPDF(
  vocabulary: VocabularyItem[],
  collections: CollectionInfo[],
  selectedYear?: number
) {
  // Filter vocabulary by learning year if specified
  let filteredVocab = vocabulary;
  if (selectedYear) {
    const collectionIds = collections
      .filter(c => c.learning_year === selectedYear)
      .map(c => c.id);
    filteredVocab = vocabulary.filter(v => 
      collectionIds.includes(v.collection_id || '')
    );
  }

  // Create PDF
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  // Set colors
  const primaryColor = [46, 49, 146]; // #2E3192
  
  // Title
  doc.setFontSize(24);
  doc.setTextColor(46, 49, 146);
  doc.text('Vokabel-Champion', pageWidth / 2, 20, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  const subtitle = selectedYear ? `Lernjahr ${selectedYear}` : 'Alle Vokabeln';
  doc.text(subtitle, pageWidth / 2, 30, { align: 'center' });
  
  // Export date
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text(`Exportiert am: ${new Date().toLocaleDateString('de-DE')}`, pageWidth / 2, 37, { align: 'center' });
  
  // Create simple table manually
  const startY = 45;
  const margin = 10;
  const tableWidth = pageWidth - 2 * margin;
  const colWidth = tableWidth / 4;
  const rowHeight = 8;
  
  let currentY = startY;
  
  // Header
  doc.setFillColor(46, 49, 146);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont(undefined as any, 'bold');
  
  const headers = ['Unit', 'Seite', 'English', 'Deutsch'];
  headers.forEach((header, i) => {
    doc.rect(margin + i * colWidth, currentY, colWidth, rowHeight, 'F');
    doc.text(header || '', margin + i * colWidth + 2, currentY + 6, { maxWidth: colWidth - 4 } as any);
  });
  
  currentY += rowHeight;
  
  // Body
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined as any, 'normal');
  doc.setFontSize(10);
  
  filteredVocab.forEach((vocab, index) => {
    // Add new page if needed
    if (currentY + rowHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
      
      // Repeat header on new page
      doc.setFillColor(46, 49, 146);
      doc.setTextColor(255, 255, 255);
      doc.setFont(undefined as any, 'bold');
      doc.setFontSize(11);
      
      headers.forEach((header, i) => {
        doc.rect(margin + i * colWidth, currentY, rowHeight, rowHeight, 'F');
        doc.text(header || '', margin + i * colWidth + 2, currentY + 6, { maxWidth: colWidth - 4 } as any);
      });
      
      currentY += rowHeight;
      doc.setTextColor(0, 0, 0);
      doc.setFont(undefined as any, 'normal');
      doc.setFontSize(10);
    }
    
    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(255, 248, 231);
      doc.rect(margin, currentY, tableWidth, rowHeight, 'F');
    }
    
    // Row border
    doc.setDrawColor(200, 200, 200);
    doc.rect(margin, currentY, tableWidth, rowHeight);
    
    // Cell content
    const rowData = [vocab.unit, vocab.page, vocab.english, vocab.deutsch];
    rowData.forEach((cell, i) => {
      doc.text(cell, margin + i * colWidth + 2, currentY + 6, { maxWidth: colWidth - 4 });
    });
    
    currentY += rowHeight;
  });
  
  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `${filteredVocab.length} Vokabeln | Seite 1`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  );

  // Save PDF
  const filename = selectedYear 
    ? `vokabeln-lernjahr-${selectedYear}.pdf`
    : `vokabeln-export-${new Date().toISOString().split('T')[0]}.pdf`;
  
  doc.save(filename);
}

export async function exportVocabularyToCSV(
  vocabulary: VocabularyItem[],
  collections: CollectionInfo[],
  selectedYear?: number
) {
  // Filter vocabulary by learning year if specified
  let filteredVocab = vocabulary;
  if (selectedYear) {
    const collectionIds = collections
      .filter(c => c.learning_year === selectedYear)
      .map(c => c.id);
    filteredVocab = vocabulary.filter(v => 
      collectionIds.includes(v.collection_id || '')
    );
  }

  // Create CSV content
  const headers = ['Unit', 'Seite', 'English', 'Deutsch'];
  const rows = filteredVocab.map(vocab => [
    vocab.unit,
    vocab.page,
    `"${vocab.english}"`,
    `"${vocab.deutsch}"`,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const filename = selectedYear 
    ? `vokabeln-lernjahr-${selectedYear}.csv`
    : `vokabeln-export-${new Date().toISOString().split('T')[0]}.csv`;
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
