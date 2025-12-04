import html2pdf from "html2pdf.js";

export interface PdfGeneratorOptions {
  element: HTMLElement;
  filename: string;
  watermarkUrl?: string;
  logoUrl?: string;
}

// Convert image URL to base64
const loadImageAsBase64 = async (url: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } else {
        reject(new Error("Failed to get canvas context"));
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

// Generate multi-page PDF with watermark and logo (NO page numbers)
export const generateResumePdf = async (options: PdfGeneratorOptions): Promise<void> => {
  const { element, filename } = options;

  // Load assets
  const logoUrl = "/solidpro.svg";
  const watermarkUrl = "/solidpro.svg"; // Using same SVG as watermark

  let logoBase64: string | null = null;
  let watermarkBase64: string | null = null;

  try {
    logoBase64 = await loadImageAsBase64(logoUrl);
    watermarkBase64 = await loadImageAsBase64(watermarkUrl);
  } catch (e) {
    console.warn("Could not load logo/watermark images:", e);
  }

  const pdfOptions = {
    margin: [20, 15, 15, 15] as [number, number, number, number], // top, right, bottom, left
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

  // Generate PDF
  const pdf = await html2pdf()
    .set(pdfOptions)
    .from(element)
    .toPdf()
    .get("pdf");

  const totalPages = pdf.internal.getNumberOfPages();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // Add logo and watermark to each page
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);

    // Add watermark (centered, low opacity)
    if (watermarkBase64) {
      pdf.saveGraphicsState();
      // @ts-ignore - setGState exists in jsPDF
      const gState = new pdf.GState({ opacity: 0.08 });
      pdf.setGState(gState);
      
      const watermarkWidth = 80;
      const watermarkHeight = 80;
      const watermarkX = (pageWidth - watermarkWidth) / 2;
      const watermarkY = (pageHeight - watermarkHeight) / 2;
      
      pdf.addImage(
        watermarkBase64,
        "PNG",
        watermarkX,
        watermarkY,
        watermarkWidth,
        watermarkHeight
      );
      pdf.restoreGraphicsState();
    }

    // Add logo (top-left corner)
    if (logoBase64) {
      const logoWidth = 25;
      const logoHeight = 10;
      pdf.addImage(logoBase64, "PNG", 10, 5, logoWidth, logoHeight);
    }
  }

  pdf.save(filename);
};

// Simple PDF generation without extra features (fallback)
export const generateSimplePdf = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  const pdfOptions = {
    margin: [15, 10, 10, 10] as [number, number, number, number],
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
