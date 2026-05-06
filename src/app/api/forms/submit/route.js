import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, email, phone, formName, message, metadata } = data;

    const API_KEY = process.env.WIX_API_KEY;
    const SITE_ID = process.env.WIX_SITE_ID;

    if (!API_KEY || !SITE_ID) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const headers = {
      Authorization: API_KEY,
      "wix-site-id": SITE_ID,
      "Content-Type": "application/json",
    };

    const nameParts = (name || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "Anonymous";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const contactPayload = {
      info: {
        name: { first: firstName, last: lastName },
        emails: { items: [{ email: email, tag: "MAIN" }] },
      },
    };

    if (phone) {
      contactPayload.info.phones = { items: [{ phone: phone, tag: "MOBILE" }] };
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
        contactId = contactData.id || contactData.contact?.id;
      } else {
        console.warn("Wix Contact Creation Warning:", contactData);
      }
    } catch (contactErr) {
      console.warn(
        "Wix Contact Creation failed, continuing to submission:",
        contactErr.message,
      );
    }

    let formId = process.env.WIX_FORM_ID;

    if (formName === "Contact Us Page") {
      formId = process.env.WIX_CONTACT_FORM_ID || formId;
    } else if (
      formName === "Sales Appointment" ||
      formName === "Service Request"
    ) {
      formId = process.env.WIX_LEAD_FORM_ID || formId;
    }

    if (
      !formId ||
      formId === "your-lead-form-id-here" ||
      formId === "your-contact-form-id-here"
    ) {
      formId = "00000000-0000-0000-0000-000000000000";
    }

    const formatPhone = (p) => {
      if (!p) return undefined;

      const cleaned = String(p).replace(/\D/g, "");
      if (cleaned.length === 0) return p;
      if (cleaned.length === 10) return `+1${cleaned}`;
      if (cleaned.length > 10 && !p.startsWith("+")) return `+${cleaned}`;
      return p.startsWith("+") ? p : `+${cleaned}`;
    };

    const submissionsMap = {
      inquiry_type: metadata?.inquiry_type,
      name: name,
      email: email,
      message: message,
      phone: formatPhone(phone),
      appointment_time: metadata?.appointment_time,
      cart_interest: metadata?.cart_interest,
      appointment_date: metadata?.appointment_date,
      budget_1: metadata?.budget_1,
    };

    const { wixClient } = await import("@/lib/wixClient");

    try {
      const form = await wixClient.submissions.getForm(formId);

      if (form && form.fields) {
        form.fields.forEach((field) => {
          const label = field.label?.toLowerCase() || "";
          const fid = field._id;

          if (label.includes("first name") || label.includes("name"))
            submissionsMap[fid] = name;
          if (label.includes("email")) submissionsMap[fid] = email;
          if (label.includes("phone")) submissionsMap[fid] = phone;
          if (label.includes("message")) submissionsMap[fid] = message;
          if (label.includes("inquiry"))
            submissionsMap[fid] = metadata?.inquiry_type;
          if (label.includes("appointment time"))
            submissionsMap[fid] = metadata?.appointment_time;
          if (label.includes("appointment date"))
            submissionsMap[fid] = metadata?.appointment_date;
          if (label.includes("budget"))
            submissionsMap[fid] = metadata?.budget_1;
          if (label.includes("interest"))
            submissionsMap[fid] = metadata?.cart_interest;
        });
      }
    } catch (discoveryErr) {
      console.warn(
        "Deep scan failed, using provided IDs:",
        discoveryErr.message,
      );
    }

    try {
      const collectionsRes = await wixClient.items.listDataCollections();
      const collections = collectionsRes.collections || [];

      const targetColl = collections.find((c) => {
        const fieldKeys = c.fields?.map((f) => f.key) || [];
        return (
          fieldKeys.includes("budget_1") ||
          fieldKeys.includes("inquiry_type") ||
          fieldKeys.includes("appointment_time")
        );
      });

      if (targetColl) {
        await wixClient.items.insertDataItem({
          dataCollectionId: targetColl._id,
          item: submissionsMap,
        });
      }
    } catch (discoveryErr) {
      console.warn("Collection insertion failed:", discoveryErr.message);
    }

    const submissionPayload = {
      submission: {
        formId: formId,
        namespace: "wix.form_app.form",
        submissions: submissionsMap,
      },
    };

    const formResponse = await fetch(
      "https://www.wixapis.com/form-submission-service/v4/submissions",
      {
        method: "POST",
        headers: {
          Authorization: API_KEY,
          "wix-site-id": SITE_ID,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionPayload),
      },
    );

    const submissionResult = await formResponse.json();

    if (contactId) {
      try {
        const noteContent =
          `--- Form Submission: ${formName} ---\n` +
          Object.entries(submissionsMap)
            .filter(([k, v]) => v && !k.startsWith("0000"))
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n");

        await wixClient.contacts.createNote(contactId, {
          content: noteContent,
        });
      } catch (noteErr) {
        console.warn("Could not add fallback note:", noteErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Form submitted successfully",
      submission: submissionResult,
      contactId,
    });
  } catch (err) {
    console.error("Critical Form Submission Error:", err);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
