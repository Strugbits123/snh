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

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

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

    checkPage(25);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 46);
    doc.text("Purpose of Modification", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const purposeText =
      "I am requesting modification to my vehicle's factory programming, including speed adjustments beyond standard LSV limits.";
    const purposeLines = doc.splitTextToSize(purposeText, contentWidth);
    doc.text(purposeLines, margin, y);
    y += purposeLines.length * 5 + 6;

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

    checkPage(40);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(26, 26, 46);
    doc.text("Final Acknowledgment", margin, y);
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    const ackText =
      "I have read and understand all terms above. I am requesting these modifications voluntarily and accept all consequences and liability.";
    const ackLines = doc.splitTextToSize(ackText, contentWidth);
    doc.text(ackLines, margin, y);
    y += ackLines.length * 5 + 6;

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

    doc.setFont("helvetica", "normal");
    doc.text(`Printed Name: ${fullName}`, margin, y);
    y += 6;
    doc.text(`Date: ${date}`, margin, y);
    y += 10;

    doc.text("SNH Representative: ________________________________", margin, y);
    y += 6;
    doc.text("Date: __________", margin, y);

    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("SNH Golf Carts LLC – Modification Waiver", margin, 287);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 25, 287);
    }

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));

    const API_KEY = process.env.WIX_API_KEY;
    const SITE_ID = process.env.WIX_SITE_ID;

    const headers = {
      "Content-Type": "application/json",
      Authorization: API_KEY,
      "wix-site-id": SITE_ID,
    };

    const uploadToWix = async (buffer, fileName, mimeType) => {
      try {
        const urlRes = await fetch(
          "https://www.wixapis.com/site-media/v1/files/generate-upload-url",
          {
            method: "POST",
            headers,
            body: JSON.stringify({ mimeType, fileName }),
          },
        );
        if (!urlRes.ok) return null;
        const { uploadUrl } = await urlRes.json();

        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          body: buffer,
          headers: { "Content-Type": mimeType },
        });
        if (!uploadRes.ok) return null;
        const uploadResult = await uploadRes.json();
        return (
          uploadResult.file?.url ||
          uploadResult.file?.fileUrl ||
          uploadResult.url ||
          `https://static.wixstatic.com/media/${fileName}`
        );
      } catch (e) {
        console.error(`Upload failed for ${fileName}:`, e);
        return null;
      }
    };

    const safeName = (fullName || "customer")
      .replace(/[^a-zA-Z0-9]/g, "_")
      .substring(0, 30);
    const pdfName = `waiver_${safeName}_${Date.now()}.pdf`;
    const sigName = `sig_${safeName}_${Date.now()}.png`;

    const signatureBuffer =
      signatureBase64 ?
        Buffer.from(signatureBase64.split(",")[1], "base64")
      : null;

    const [pdfUrl, sigUrl] = await Promise.all([
      uploadToWix(pdfBuffer, pdfName, "application/pdf"),
      signatureBuffer ?
        uploadToWix(signatureBuffer, sigName, "image/png")
      : Promise.resolve(null),
    ]);

    if (pdfUrl) {
      try {
        const formatPhone = (p) => {
          if (!p) return undefined;
          const cleaned = String(p).replace(/\D/g, "");
          if (cleaned.length === 0) return p;
          if (cleaned.length === 10) return `+1${cleaned}`;
          return p.startsWith("+") ? p : `+${cleaned}`;
        };

        const formattedPhone = formatPhone(phone);

        const nameParts = (fullName || "").trim().split(/\s+/);
        const firstName = nameParts[0] || "Customer";
        const lastName =
          nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

        const contactPayload = {
          info: {
            name: { first: firstName, last: lastName },
            emails: { items: [{ email: email, tag: "MAIN" }] },
          },
        };

        if (formattedPhone) {
          contactPayload.info.phones = {
            items: [{ phone: formattedPhone, tag: "MOBILE" }],
          };
        }

        let contactId = null;
        try {
          const contactResponse = await fetch(
            "https://www.wixapis.com/contacts/v4/contacts",
            {
              method: "POST",
              headers,
              body: JSON.stringify(contactPayload),
            },
          );

          const contactData = await contactResponse.json();
          if (contactResponse.ok) {
            contactId = contactData.contact?.id || contactData.id;
          } else {
            console.warn("Wix Contact Creation Warning:", contactData);
          }
        } catch (contactErr) {
          console.warn(
            "Wix Contact Creation failed, continuing:",
            contactErr.message,
          );
        }

        const submissionPayload = {
          submission: {
            formId: "1ce6728e-dd5b-4c48-88ac-0f30abce6a0d",
            namespace: "wix.form_app.form",
            contactId: contactId,
            status: "CONFIRMED",
            submissions: {
              full_name: fullName,
              address_f460: address,
              email_464e: email,
              phone_e572: formattedPhone,
              vehicle_make_model: vehicleMakeModel,
              vin_serial: vinSerial,
              message: `Waiver PDF: ${pdfUrl}`,
              signature_1: sigUrl || "Base64 provided in PDF",
            },
          },
        };

        const formResponse = await fetch(
          "https://www.wixapis.com/form-submission-service/v4/submissions",
          {
            method: "POST",
            headers,
            body: JSON.stringify(submissionPayload),
          },
        );

        const formResult = await formResponse.json();
        console.log("Wix Form submission result:", formResult);

        if (contactId) {
          try {
            const { wixClient } = await import("@/lib/wixClient");
            const noteContent =
              `--- Waiver Form Submission ---\n` +
              `Name: ${fullName}\n` +
              `Address: ${address}\n` +
              `Email: ${email}\n` +
              `Phone: ${formattedPhone}\n` +
              `Vehicle: ${vehicleMakeModel}\n` +
              `VIN/Serial: ${vinSerial}\n` +
              `Waiver PDF: ${pdfUrl}\n` +
              `Signature: ${sigUrl || "Base64 provided in PDF"}`;

            await wixClient.contacts.createNote(contactId, {
              content: noteContent,
            });
            console.log("Fallback note added to contact successfully.");
          } catch (noteErr) {
            console.warn("Could not add fallback note:", noteErr.message);
          }
        }
      } catch (formErr) {
        console.error("Wix Form submission error:", formErr);
      }
    }

    return NextResponse.json({
      success: true,
      pdfUrl: pdfUrl || "Fallback to base64",
      pdfBase64: pdfUrl ? undefined : pdfBuffer.toString("base64"),
      sigUrl,
    });
  } catch (err) {
    console.error("Waiver upload error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate waiver PDF" },
      { status: 500 },
    );
  }
}
