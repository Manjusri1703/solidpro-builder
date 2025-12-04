import html2pdf from "html2pdf.js";

export interface PdfGeneratorOptions {
  element: HTMLElement;
  filename: string;
  watermarkUrl?: string;
  logoUrl?: string;
}

// Generate multi-page PDF with page numbers
export const generateResumePdf = async (options: PdfGeneratorOptions): Promise<void> => {
  const { element, filename } = options;

  const pdfOptions = {
    margin: [15, 10, 20, 10] as [number, number, number, number],
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      letterRendering: true,
    },
    jsPDF: {
      unit: "mm" as const,
      format: "a4" as const,
      orientation: "portrait" as const,
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] as const },
  };

  // Generate PDF with page numbers
  const pdf = await html2pdf()
    .set(pdfOptions)
    .from(element)
    .toPdf()
    .get("pdf");

  const totalPages = pdf.internal.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Add page numbers to each page
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    pdf.setFontSize(9);
    pdf.setTextColor(128, 128, 128);
    const pageText = `Page ${i} of ${totalPages}`;
    const textWidth = pdf.getTextWidth(pageText);
    pdf.text(pageText, (pageWidth - textWidth) / 2, pageHeight - 8);
  }

  pdf.save(filename);
};

// Simple PDF generation without extra features (fallback)
export const generateSimplePdf = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  const pdfOptions = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename,
    image: { type: "jpeg" as const, quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
    },
    jsPDF: {
      unit: "mm" as const,
      format: "a4" as const,
      orientation: "portrait" as const,
    },
    pagebreak: { mode: ["avoid-all", "css", "legacy"] as const },
  };

  await html2pdf().set(pdfOptions).from(element).save();
};
