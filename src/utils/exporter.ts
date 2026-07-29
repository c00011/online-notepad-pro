import { marked } from 'marked';

// Helper to trigger browser file download
function downloadBlob(content: string, fileName: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export as Markdown (.md)
export function exportAsMarkdown(title: string, content: string) {
  const fileName = title.endsWith('.md') ? title : `${title.replace(/\.[^/.]+$/, '')}.md`;
  downloadBlob(content, fileName, 'text/markdown;charset=utf-8;');
}

// Export as Plain Text (.txt)
export function exportAsText(title: string, content: string) {
  const fileName = title.endsWith('.txt') ? title : `${title.replace(/\.[^/.]+$/, '')}.txt`;
  downloadBlob(content, fileName, 'text/plain;charset=utf-8;');
}

// Export as MS Word Document (.doc)
export function exportAsWordDoc(title: string, content: string) {
  const fileName = title.endsWith('.doc') ? title : `${title.replace(/\.[^/.]+$/, '')}.doc`;
  
  // Render Markdown or Text to HTML
  const parsedHtml = marked.parse(content);

  const wordHeader = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office'
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        body {
          font-family: 'Segoe UI', Calibri, Arial, sans-serif;
          font-size: 11pt;
          line-height: 1.5;
          color: #1c1c1c;
          margin: 1in;
        }
        h1 { font-size: 20pt; color: #0078d4; margin-bottom: 12pt; border-bottom: 1px solid #ccc; padding-bottom: 4pt; }
        h2 { font-size: 15pt; color: #106ebe; margin-top: 14pt; margin-bottom: 8pt; }
        h3 { font-size: 13pt; color: #333333; margin-top: 12pt; margin-bottom: 6pt; }
        p { margin-bottom: 10pt; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 12pt; }
        th, td { border: 1px solid #cccccc; padding: 6pt 8pt; text-align: left; }
        th { background-color: #f3f3f3; font-weight: bold; }
        blockquote { border-left: 3pt solid #0078d4; padding-left: 10pt; color: #555555; margin: 10pt 0; }
        code { font-family: Consolas, monospace; background-color: #f4f4f4; padding: 2pt 4pt; }
        pre { background-color: #f4f4f4; padding: 10pt; border-radius: 4pt; font-family: Consolas, monospace; }
      </style>
    </head>
    <body>
      ${parsedHtml}
    </body>
    </html>
  `;

  downloadBlob(wordHeader, fileName, 'application/msword');
}

// Export as PDF via html2pdf.js or fallback print
export async function exportAsPDF(title: string, content: string, sourceElement?: HTMLElement | null) {
  const fileName = title.endsWith('.pdf') ? title : `${title.replace(/\.[^/.]+$/, '')}.pdf`;
  
  // Try importing html2pdf.js dynamically or using element
  try {
    const html2pdf = (await import('html2pdf.js')).default;

    let container: HTMLElement;
    if (sourceElement) {
      container = sourceElement.cloneNode(true) as HTMLElement;
    } else {
      container = document.createElement('div');
      container.style.padding = '20px';
      container.style.fontFamily = "'Segoe UI', sans-serif";
      container.innerHTML = await marked.parse(content);
    }

    const opt = {
      margin: 15,
      filename: fileName,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };

    await html2pdf().set(opt).from(container).save();
  } catch (err) {
    console.warn('html2pdf.js export fallback to print window:', err);
    printContent(title, content);
  }
}

// Print formatted document
export function printContent(title: string, content: string) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const parsedHtml = marked.parse(content);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body {
            font-family: "Segoe UI", -apple-system, sans-serif;
            padding: 40px;
            color: #1c1c1c;
            line-height: 1.6;
          }
          h1, h2, h3 { color: #0078d4; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          th, td { border: 1px solid #ddd; padding: 8px 12px; }
          th { background: #f0f0f0; }
          blockquote { border-left: 4px solid #0078d4; padding-left: 12px; color: #555; }
          pre { background: #f5f5f5; padding: 12px; border-radius: 4px; overflow-x: auto; }
          code { font-family: monospace; background: #eee; padding: 2px 4px; border-radius: 2px; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        ${parsedHtml}
        <script>
          setTimeout(() => {
            window.print();
            window.close();
          }, 300);
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
