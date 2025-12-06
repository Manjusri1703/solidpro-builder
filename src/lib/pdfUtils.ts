import html2pdf from "html2pdf.js";

// Type for html2pdf options with onclone callback
interface Html2PdfOptions {
  margin?: [number, number, number, number];
  filename?: string;
  image?: { type: string; quality: number };
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    logging?: boolean;
    letterRendering?: boolean;
    allowTaint?: boolean;
  };
  jsPDF?: { unit: string; format: string; orientation: string };
  pagebreak?: {
    mode?: string[];
    before?: string;
    after?: string;
  };
  onclone?: (document: Document) => void;
}

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

// ... (keep the existing imports and interfaces at the top of the file)

export const generateResumePdf = async (options: PdfGeneratorOptions): Promise<void> => {
  const { element, filename } = options;

  // Load watermark
  const watermarkUrl = "/solidpro.svg";
  let watermarkBase64: string | null = null;

  try {
    watermarkBase64 = await loadImageAsBase64(watermarkUrl);
  } catch (e) {
    console.warn("Could not load watermark image:", e);
  }

  // Create a clone of the element to avoid modifying the original
  const elementClone = element.cloneNode(true) as HTMLElement;
  document.body.appendChild(elementClone);

  try {
    // We'll handle the watermark in the onclone callback to ensure it appears on all pages

    // Generate and save the PDF
    const pdfOptions: Omit<Html2PdfOptions, 'onclone'> = {
      margin: [5, 10, 10, 10],
      filename: filename.endsWith('.pdf') ? filename : `${filename}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: true,
        letterRendering: true
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      },
      pagebreak: {
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after'
      }
    };
    const options: Html2PdfOptions = {
      ...pdfOptions,
      // In the onclone callback of html2pdf
      onclone: (document: Document) => {
        // Ensure the watermark is on all pages
        if (watermarkBase64) {
          const style = document.createElement('style');
          style.textContent = `
      .watermark {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url(${watermarkBase64});
        background-repeat: no-repeat;
        background-position: center;
        background-size: 40% auto;
        opacity: 0.05;
        pointer-events: none;
        z-index: -1;
      }
    `;
          document.head.appendChild(style);

          const watermarks = document.querySelectorAll('.watermark');
          if (watermarks.length === 0) {
            const watermark = document.createElement('div');
            watermark.className = 'watermark';
            document.body.insertBefore(watermark, document.body.firstChild);
          }
        }

        // Ensure the SVG header is visible
        const svgs = document.querySelectorAll('svg');
        svgs.forEach(svg => {
          svg.style.position = 'relative';
          svg.style.zIndex = '10';
        });
      }
    }

    await html2pdf()
      .set(options as any)
      .from(elementClone)
      .save(filename);

  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  } finally {
    // Clean up
    if (elementClone.parentNode) {
      elementClone.parentNode.removeChild(elementClone);
    }
  }
};

// ... (keep the rest of the file as is)
// Simple PDF generation without extra features (fallback)
export const generateSimplePdf = async (
  element: HTMLElement,
  filename: string
): Promise<void> => {
  const pdfOptions = {
    margin: [5, 10, 10, 10] as [number, number, number, number],
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
