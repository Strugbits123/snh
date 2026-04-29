import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, email, phone, formName, message, metadata } = data;

    const API_KEY = process.env.WIX_API_KEY;
    const SITE_ID = process.env.WIX_SITE_ID;

    if (!API_KEY || !SITE_ID) {
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const headers = {
      "Authorization": API_KEY,
      "wix-site-id": SITE_ID,
      "Content-Type": "application/json",
    };

    // 1. Create or Update Contact (Wix Contacts v4)
    const nameParts = (name || "").trim().split(/\s+/);
    const firstName = nameParts[0] || "Anonymous";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const contactPayload = {
      info: {
        name: { first: firstName, last: lastName },
        emails: { items: [{ email: email, tag: "MAIN" }] },
      }
    };

    if (phone) {
      contactPayload.info.phones = { items: [{ phone: phone, tag: "MOBILE" }] };
    }

    let contactId = null;
    try {
      const contactResponse = await fetch("https://www.wixapis.com/contacts/v4/contacts", {
        method: "POST",
        headers,
        body: JSON.stringify(contactPayload)
      });

      const contactData = await contactResponse.json();
      if (contactResponse.ok) {
        contactId = contactData.id || contactData.contact?.id;
      } else {
        console.warn("Wix Contact Creation Warning:", contactData);
      }
    } catch (contactErr) {
      console.warn("Wix Contact Creation failed, continuing to submission:", contactErr.message);
    }

    // 2. Determine which Wix Form ID to use
    let formId = process.env.WIX_FORM_ID; 

    if (formName === "Contact Us Page") {
      formId = process.env.WIX_CONTACT_FORM_ID || formId;
    } else if (formName === "Sales Appointment" || formName === "Service Request") {
      formId = process.env.WIX_LEAD_FORM_ID || formId;
    }

    // Default placeholder if none found
    if (!formId || formId === "your-lead-form-id-here" || formId === "your-contact-form-id-here") {
      formId = "00000000-0000-0000-0000-000000000000";
    }

    // Map fields for Wix Submissions v4 (requires submissionsMap)
    const submissionsMap = {
      "name": name || "N/A",
      "email": email || "N/A",
    };

    if (phone) submissionsMap["phone"] = phone;
    if (message) submissionsMap["message"] = message;
    
    if (metadata) {
      Object.entries(metadata).forEach(([key, val]) => {
        if (val) submissionsMap[key] = String(val);
      });
    }

    const submissionPayload = {
      submission: {
        formId: formId,
        namespace: "wix.form_app.form", // Standard namespace for Wix Forms
        submissionsMap: submissionsMap
      }
    };

    const formResponse = await fetch("https://www.wixapis.com/form-submission-service/v4/submissions", {
      method: "POST",
      headers,
      body: JSON.stringify(submissionPayload)
    });

    // Check for HTML response before parsing JSON
    const contentType = formResponse.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      const htmlError = await formResponse.text();
      console.error("Wix returned HTML instead of JSON. Check your URL/Form ID.");
      return NextResponse.json({ error: "Wix Form Service unavailable (HTML Error)", details: htmlError.slice(0, 200) }, { status: 502 });
    }

    const formData = await formResponse.json();

    if (!formResponse.ok) {
      console.error("Wix Forms Error:", formData);
      return NextResponse.json({ 
        error: formData.message || "Wix Form Submission failed",
        details: formData
      }, { status: formResponse.status });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Form submitted successfully",
      submissionId: formData.submission?.id,
      contactId
    });

  } catch (err) {
    console.error("Critical Form Submission Error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
