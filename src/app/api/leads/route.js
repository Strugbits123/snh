
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const data = await req.json();
    const { name, email, phone, appointmentType, message } = data;

    // Stronger validation
    if (!name?.trim() && !email?.trim()) {
      return NextResponse.json(
        { error: "Name or Email is required" },
        { status: 400 },
      );
    }

    const trimmedName = name?.trim() || "";
    const trimmedEmail = email?.trim().toLowerCase() || "";
    const trimmedPhone = phone?.trim() || "";

    const nameParts = trimmedName.split(/\s+/);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";

    const API_KEY = process.env.WIX_API_KEY;
    const SITE_ID = process.env.WIX_SITE_ID;

    if (!API_KEY || !SITE_ID) {
      console.error("Missing Wix API credentials in environment variables");
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

    // Build info object carefully
    const info = {};

    // Add name only if we have something
    if (firstName || lastName) {
      info.name = {
        first: firstName,
        last: lastName,
      };
    }

    // Add email (v4 requires items wrapper)
    if (trimmedEmail) {
      info.emails = {
        items: [
          {
            email: trimmedEmail,
            tag: "MAIN",
          },
        ],
      };
    }

    // Add phone (v4 requires items wrapper)
    if (trimmedPhone) {
      info.phones = {
        items: [
          {
            phone: trimmedPhone,
            tag: "MOBILE",
          },
        ],
      };
    }

    // Final safety check
    if (Object.keys(info).length === 0) {
      return NextResponse.json(
        { error: "No valid contact information provided" },
        { status: 400 },
      );
    }

    // V4 structure: "info" is at the top level
    const contactPayload = {
      info: info,
    };

    console.log("Sending to Wix V4:", JSON.stringify(contactPayload, null, 2));

    const contactResponse = await fetch(
      "https://www.wixapis.com/contacts/v4/contacts",
      {
        method: "POST",
        headers,
        body: JSON.stringify(contactPayload),
      },
    );

    const contactData = await contactResponse.json();
    console.log("Wix Response:", JSON.stringify(contactData, null, 2));

    if (!contactResponse.ok) {
      console.error("Wix API Error:", contactData);
      return NextResponse.json(
        {
          error:
            contactData.message ||
            contactData.details?.[0]?.message ||
            "Failed to create contact",
        },
        { status: contactResponse.status },
      );
    }

    // V4 returns the contact directly at the root
    const contactId = contactData.id || contactData.contact?.id;

    // Add note (optional)
    if (contactId && message?.trim()) {
      const noteContent = `--- Appointment Request ---\nType: ${appointmentType || "Not specified"}\n\n${message.trim()}`;

      try {
        await fetch(
          `https://www.wixapis.com/contacts/v1/contacts/${contactId}/notes`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ note: { content: noteContent } }),
          },
        );
      } catch (noteError) {
        console.warn("Could not add note:", noteError);
      }
    }

    return NextResponse.json({
      success: true,
      contactId,
      message: "Appointment request received successfully",
    });
  } catch (err) {
    console.error("Lead submission error:", err);
    return NextResponse.json(
      { error: "Failed to process request. Please try again." },
      { status: 500 },
    );
  }
}
