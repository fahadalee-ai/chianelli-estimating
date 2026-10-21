function pdfEscape(value) {
  return String(value)
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .slice(0, 92);
}

function buildPdf(linePages) {
  const fontObj = 3;
  const objects = [];
  const kids = [];
  linePages.forEach((lines, pageIndex) => {
    const contentObj = 4 + pageIndex * 2;
    const pageObj = 5 + pageIndex * 2;
    kids.push(`${pageObj} 0 R`);
    const stream = lines
      .map((line, i) => `BT /F1 10 Tf 48 ${790 - i * 16} Td (${line}) Tj ET`)
      .join("\n");
    objects[contentObj - 1] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
    objects[pageObj - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 842] /Contents ${contentObj} 0 R /Resources << /Font << /F1 ${fontObj} 0 R >> >> >>`;
  });
  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Count ${linePages.length} /Kids [${kids.join(" ")}] >>`;
  objects[2] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let body = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((obj, index) => {
    offsets.push(body.length);
    body += `${index + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = body.length;
  body += `xref\n0 ${objects.length + 1}\n`;
  body += "0000000000 65535 f \n";
  offsets.forEach((offset) => {
    body += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return body;
}

function triggerDownload(filename, blob) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadPdf(filename, lines) {
  const clean = (lines.length ? lines : ["Chianelli Estimating"]).map(pdfEscape);
  const pages = [];
  for (let i = 0; i < clean.length; i += 42) pages.push(clean.slice(i, i + 42));
  triggerDownload(filename, new Blob([buildPdf(pages)], { type: "application/pdf" }));
}

function icsStamp(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}T${pad(date.getHours())}${pad(date.getMinutes())}00`;
}

export function downloadIcs({ title, description, start, location, filename }) {
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Chianelli Estimating//EN",
    "BEGIN:VEVENT",
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description || ""}`,
    `LOCATION:${location || ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  triggerDownload(filename || "chianelli-appointment.ics", new Blob([ics], { type: "text/calendar" }));
}

export async function shareOrCopy(title, text) {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({ title, text });
      return "shared";
    } catch (error) {
      if (error && error.name === "AbortError") return "cancelled";
    }
  }
  if (typeof navigator !== "undefined" && navigator.clipboard) {
    await navigator.clipboard.writeText(text);
    return "copied";
  }
  return "failed";
}
