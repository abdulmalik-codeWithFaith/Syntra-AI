import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

export interface PDFMeetingData {
  title: string;
  date: string;
  platform: string;
  summary: string;
  tasks: { title: string; ownerName?: string; deadline?: string }[];
  decisions: { text: string }[];
  transcript: { speaker: string; text: string }[];
}

export async function generateMeetingPDF(data: PDFMeetingData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const purple = rgb(0.486, 0.227, 0.929);
  const darkGray = rgb(0.067, 0.094, 0.153);
  const medGray = rgb(0.42, 0.447, 0.502);
  const lightGray = rgb(0.961, 0.961, 0.969);
  const white = rgb(1, 1, 1);

  const pageWidth = 595;
  const pageHeight = 842;
  const margin = 48;
  const contentWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  function checkNewPage(neededSpace: number) {
    if (y - neededSpace < margin + 40) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  }

  function drawText(
    text: string,
    x: number,
    fontSize: number,
    color: any,
    font: any,
    maxWidth?: number
  ) {
    if (!text) return;
    const safeText = text.replace(/[^\x00-\x7F]/g, "");
    if (maxWidth) {
      const words = safeText.split(" ");
      let line = "";
      for (const word of words) {
        const testLine = line + (line ? " " : "") + word;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxWidth && line) {
          page.drawText(line, { x, y, size: fontSize, font, color });
          y -= fontSize + 4;
          line = word;
          checkNewPage(fontSize + 4);
        } else {
          line = testLine;
        }
      }
      if (line) {
        page.drawText(line, { x, y, size: fontSize, font, color });
        y -= fontSize + 4;
      }
    } else {
      page.drawText(safeText, { x, y, size: fontSize, font, color });
      y -= fontSize + 4;
    }
  }

  function drawSection(title: string) {
    checkNewPage(60);
    y -= 12;
    page.drawRectangle({
      x: margin,
      y: y - 4,
      width: contentWidth,
      height: 26,
      color: lightGray,
    //   borderRadius: 4,
    });
    page.drawText(title.toUpperCase(), {
      x: margin + 10,
      y: y + 4,
      size: 9,
      font: boldFont,
      color: purple,
    });
    y -= 24;
  }

  // ─── Header ───────────────────────────────────────────────────────────────

  page.drawRectangle({
    x: 0,
    y: pageHeight - 90,
    width: pageWidth,
    height: 90,
    color: purple,
  });

  page.drawText("SYNTRA AI", {
    x: margin,
    y: pageHeight - 35,
    size: 11,
    font: boldFont,
    color: white,
  });

  page.drawText("Meeting Report", {
    x: margin,
    y: pageHeight - 52,
    size: 18,
    font: boldFont,
    color: white,
  });

  page.drawText(`${data.platform} · ${data.date}`, {
    x: margin,
    y: pageHeight - 70,
    size: 10,
    font: regularFont,
    color: rgb(0.8, 0.7, 1),
  });

  y = pageHeight - 110;

  // ─── Title ────────────────────────────────────────────────────────────────

  page.drawText(data.title.replace(/[^\x00-\x7F]/g, ""), {
    x: margin,
    y,
    size: 22,
    font: boldFont,
    color: darkGray,
  });
  y -= 32;

  // ─── Summary ──────────────────────────────────────────────────────────────

  if (data.summary) {
    drawSection("Summary");
    y -= 4;
    drawText(data.summary, margin + 10, 10, medGray, regularFont, contentWidth - 20);
    y -= 8;
  }

  // ─── Tasks ────────────────────────────────────────────────────────────────

  if (data.tasks.length > 0) {
    drawSection(`Action Items (${data.tasks.length})`);
    y -= 4;
    for (const task of data.tasks) {
      checkNewPage(40);
      page.drawCircle({ x: margin + 14, y: y + 3, size: 3, color: purple });
      drawText(task.title, margin + 24, 10, darkGray, boldFont, contentWidth - 34);
      if (task.ownerName || task.deadline) {
        const meta = [
          task.ownerName ? `Owner: ${task.ownerName}` : "",
          task.deadline ? `Due: ${task.deadline}` : "",
        ]
          .filter(Boolean)
          .join("  ·  ");
        drawText(meta, margin + 24, 9, medGray, regularFont, contentWidth - 34);
      }
      y -= 6;
    }
    y -= 4;
  }

  // ─── Decisions ────────────────────────────────────────────────────────────

  if (data.decisions.length > 0) {
    drawSection(`Decisions (${data.decisions.length})`);
    y -= 4;
    for (const decision of data.decisions) {
      checkNewPage(30);
      page.drawRectangle({
        x: margin + 10,
        y: y - 2,
        width: 3,
        height: 14,
        color: purple,
      });
      drawText(decision.text, margin + 20, 10, darkGray, regularFont, contentWidth - 30);
      y -= 4;
    }
    y -= 4;
  }

  // ─── Transcript ───────────────────────────────────────────────────────────

  if (data.transcript.length > 0) {
    drawSection("Transcript");
    y -= 4;
    let lastSpeaker = "";
    for (const line of data.transcript) {
      checkNewPage(30);
      if (line.speaker !== lastSpeaker) {
        y -= 4;
        drawText(line.speaker, margin + 10, 9, purple, boldFont, contentWidth - 20);
        lastSpeaker = line.speaker;
      }
      drawText(line.text, margin + 10, 9, medGray, regularFont, contentWidth - 20);
    }
  }

  // ─── Footer on each page ─────────────────────────────────────────────────

  const pages = pdfDoc.getPages();
  pages.forEach((p, i) => {
    p.drawText(`Syntra AI · Page ${i + 1} of ${pages.length}`, {
      x: margin,
      y: 24,
      size: 8,
      font: regularFont,
      color: medGray,
    });
  });

  return pdfDoc.save();
}