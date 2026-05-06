import { NextResponse } from "next/server";
import { jsPDF } from "jspdf";

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      fullName,
      address,
      phone,
      email,
      vehicleMakeModel,
      vinSerial,
      date,
      initials,
      signatureBase64,
    } = body;

    // ── 1. Generate PDF ──
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // Helper functions
    const addLine = () => {
      doc.setDrawColor(200, 168, 75);
      doc.setLineWidth(0.5);
      doc.line(margin, y, pageWidth - margin, y);
      y += 6;
    };

    const checkPage = (needed = 30) => {
      if (y + needed > 270) {
        doc.addPage();
        y = 20;
      }
    };

    // ── Header ──
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(26, 26, 46);
    doc.text("SNH Golf Carts LLC", margin, y);
    y += 8;

    doc.setFontSize(14);
    doc.setTextColor(80, 80, 80);
    doc.text("Programming & Speed Modification Waiver", margin, y);
    y += 8;
    addLine();

    // ── Customer Information ──
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(26, 26, 46);
    doc.text("Customer Information", margin, y);
    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);

    const infoFields = [
      ["Customer Name", fullName],
      ["Address", address],
      ["Phone", phone],
      ["Email", email],
      ["Vehicle Make/Model", vehicleMakeModel],
      ["VIN/Serial #", vinSerial],
      ["Date", date],
    ];

    infoFields.forEach(([label, value]) => {
      doc.setFont("helvetica", "bold");
      doc.text(`${label}:`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.text(value || "N/A", margin + 45, y);
      y += 6;
    });

    y += 4;
    addLine();

    // ── Purpose of Modification ──
    checkPage(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 46);
    doc.text("Purpose of Modification", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const purposeText = "I am requesting modification to my vehicle's factory programming, including speed adjustments beyond standard LSV limits.";
    const purposeLines = doc.splitTextToSize(purposeText, contentWidth);
    doc.text(purposeLines, margin, y);
    y += purposeLines.length * 5 + 6;

    // ── Legal Terms ──
    const terms = [
      {
        title: "New Hampshire Legal Acknowledgment",
        text: "I understand LSVs are generally limited to 25 mph and modifying speed may make the vehicle illegal for public road use.",
      },
      {
        title: "Speed Modification Disclosure",
        text: "Requested speed increase beyond 25 mph. May exceed legal limits. May be illegal on public roads. May be restricted to private property.",
      },
      {
        title: "Warranty & Mechanical Risk",
        text: "May void warranties. Increased wear and tear. No reliability guarantees.",
      },
      {
        title: "Assumption of Risk",
        text: "Increased risk of injury or death. Responsible for safe operation. Assume all risks.",
      },
      {
        title: "Insurance Responsibility",
        text: "Insurance may not cover modified vehicle. Responsible to verify coverage.",
      },
      {
        title: "Hold Harmless",
        text: "I agree to indemnify and hold harmless SNH Golf Carts LLC from any claims arising from modifications.",
      },
    ];

    terms.forEach((term, idx) => {
      checkPage(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(26, 26, 46);
      doc.text(`${idx + 1}. ${term.title}`, margin, y);
      y += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(60, 60, 60);
      const lines = doc.splitTextToSize(term.text, contentWidth - 10);
      doc.text(lines, margin + 5, y);
      y += lines.length * 4.5 + 3;

      doc.setFont("helvetica", "bold");
      doc.setTextColor(26, 26, 46);
      doc.text(`Initials: ${initials?.[idx] || "___"}`, margin + 5, y);
      y += 8;
    });

    y += 2;
    addLine();

    // ── Final Acknowledgment ──
    checkPage(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 46);
    doc.text("Final Acknowledgment", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const ackText = "I have read and understand all terms above. I am requesting these modifications voluntarily and accept all consequences and liability.";
    const ackLines = doc.splitTextToSize(ackText, contentWidth);
    doc.text(ackLines, margin, y);
    y += ackLines.length * 5 + 6;

    // Add signature image if provided
    if (signatureBase64) {
      checkPage(40);
      doc.setFont("helvetica", "bold");
      doc.text("Customer Signature:", margin, y);
      y += 4;

      try {
        doc.addImage(signatureBase64, "JPEG", margin, y, 60, 25);
        y += 30;
      } catch (imgErr) {
        doc.setFont("helvetica", "italic");
        doc.text("[Signature image attached]", margin, y);
        y += 8;
      }
    }

    // Print Name & Date
    doc.setFont("helvetica", "normal");
    doc.text(`Printed Name: ${fullName}`, margin, y);
    y += 6;
    doc.text(`Date: ${date}`, margin, y);
    y += 10;

    // SNH Representative section
    doc.text("SNH Representative: ________________________________", margin, y);
    y += 6;
    doc.text("Date: __________", margin, y);

    // ── Footer ──
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("SNH Golf Carts LLC – Modification Waiver", margin, 287);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 25, 287);
    }

    // Convert to buffer
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    // ── 2. Upload to Wix Media ──
    const API_KEY = process.env.WIX_API_KEY;
    const SITE_ID = process.env.WIX_SITE_ID;

    const headers = {
      "Content-Type": "application/json",
      Authorization: API_KEY,
      "wix-site-id": SITE_ID,
    };

    const safeName = (fullName || "customer").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
    const fileName = `waiver_${safeName}_${Date.now()}.pdf`;

    // Step 2a: Get upload URL from Wix
    const uploadUrlRes = await fetch(
      "https://www.wixapis.com/site-media/v1/files/generate-upload-url",
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          mimeType: "application/pdf",
          fileName: fileName,
          parentFolderId: null,
        }),
      }
    );

    if (!uploadUrlRes.ok) {
      const errText = await uploadUrlRes.text();
      console.error("Wix upload URL error:", errText);

      // Fallback: return PDF as base64 data URI
      const base64Pdf = pdfBuffer.toString("base64");
      return NextResponse.json({
        success: true,
        pdfUrl: `data:application/pdf;base64,${base64Pdf.substring(0, 100)}...`,
        pdfBase64: base64Pdf,
        fallback: true,
        message: "PDF generated but Wix upload failed, using base64 fallback",
      });
    }

    const uploadUrlData = await uploadUrlRes.json();
    const uploadUrl = uploadUrlData.uploadUrl;

    // Step 2b: Upload the PDF binary
    const formData = new FormData();
    const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });
    formData.append("file", pdfBlob, fileName);

    const uploadRes = await fetch(uploadUrl, {
      method: "PUT",
      body: pdfBuffer,
      headers: {
        "Content-Type": "application/pdf",
      },
    });

    if (!uploadRes.ok) {
      const uploadErr = await uploadRes.text();
      console.error("Wix file upload error:", uploadErr);

      // Fallback
      const base64Pdf = pdfBuffer.toString("base64");
      return NextResponse.json({
        success: true,
        pdfBase64: base64Pdf,
        fallback: true,
        message: "PDF generated but file upload failed",
      });
    }

    const uploadResult = await uploadRes.json();
    const fileUrl =
      uploadResult.file?.url ||
      uploadResult.file?.fileUrl ||
      uploadResult.url ||
      `https://static.wixstatic.com/media/${fileName}`;

    console.log("Waiver PDF uploaded to Wix:", fileUrl);

    return NextResponse.json({
      success: true,
      pdfUrl: fileUrl,
      fileName: fileName,
    });
  } catch (err) {
    console.error("Waiver upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate waiver PDF" },
      { status: 500 }
    );
  }
}
