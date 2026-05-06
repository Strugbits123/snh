"use client";
import { useState, useRef, useCallback } from "react";
import {
  Shield,
  ChevronRight,
  ChevronLeft,
  Upload,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
} from "lucide-react";

const LEGAL_TERMS = [
  {
    title: "New Hampshire Legal Acknowledgment",
    body: "I understand that Low Speed Vehicles (LSVs) are generally limited to 25 mph under New Hampshire law. Modifying the vehicle's speed beyond this limit may make the vehicle illegal for use on public roads.",
    icon: "scale",
  },
  {
    title: "Speed Modification Disclosure",
    body: "I acknowledge the following: The requested speed increase may exceed 25 mph. This may exceed legal limits for LSVs. The modified vehicle may be illegal to operate on public roads. Use may be restricted to private property only.",
    icon: "gauge",
  },
  {
    title: "Warranty & Mechanical Risk",
    body: "I understand that speed modifications may void the manufacturer's warranty. Increased wear and tear on components is expected. SNH Golf Carts LLC makes no guarantees regarding the long-term reliability of modified components.",
    icon: "wrench",
  },
  {
    title: "Assumption of Risk",
    body: "I acknowledge the increased risk of injury or death associated with higher speeds and assume all responsibility for safe operation. I assume all risks related to the use of a speed-modified vehicle.",
    icon: "alert",
  },
  {
    title: "Insurance Coverage",
    body: "Insurance may not cover modified vehicles. It is my responsibility to verify coverage with my insurance provider before operating the modified vehicle.",
    icon: "shield",
  },
  {
    title: "Hold Harmless",
    body: "I agree to indemnify and hold harmless SNH Golf Carts LLC, its owners, employees, and agents from any and all claims, damages, losses, or liabilities arising from these modifications.",
    icon: "handshake",
  },
];

export default function WaiverModal({
  isOpen,
  onClose,
  onSubmit,
  vehicleMakeModel,
  isSubmitting,
}) {
  const [step, setStep] = useState(0); // 0 = info, 1-6 = terms, 7 = final
  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    phone: "",
    email: "",
    vehicleMakeModel: vehicleMakeModel || "",
    vinSerial: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [initials, setInitials] = useState(["", "", "", "", "", ""]);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const totalSteps = 8; // 1 info + 6 terms + 1 final
  const progressSegment =
    step < 1 ? 0
    : step <= 6 ? 1
    : 2; // 0=info, 1=terms, 2=final

  const updateField = useCallback((field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    // Auto-populate first name when full name is typed
    if (field === "fullName") {
      const firstName = value.trim().split(/\s+/)[0] || "";
      setInitials(new Array(21).fill(firstName));
    }
  }, []);

  const validateStep0 = () => {
    const errs = {};
    if (!formData.fullName.trim()) errs.fullName = "Required";
    if (!formData.address.trim()) errs.address = "Required";
    if (!formData.phone.trim()) errs.phone = "Required";
    if (!formData.email.trim()) errs.email = "Required";
    if (!formData.vehicleMakeModel.trim()) errs.vehicleMakeModel = "Required";
    if (!formData.vinSerial.trim()) errs.vinSerial = "Required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (step === 0 && !validateStep0()) return;
    if (step >= 1 && step <= 6) {
      const idx = step - 1;
      if (!initials[idx]?.trim()) {
        setErrors({ initials: "Please enter your initials to proceed" });
        return;
      }
      setErrors({});
    }
    setStep((s) => Math.min(s + 1, 7));
  };

  const handleBack = () => {
    setErrors({});
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSignatureChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.type === "image/png" ||
      file.type === "image/jpeg" ||
      file.type === "image/jpg"
    ) {
      setSignatureFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setSignaturePreview(ev.target.result);
      reader.readAsDataURL(file);
      setErrors({});
    } else {
      setErrors({
        signature: "File type not supported. Please upload PNG, JPG or JPEG.",
      });
      setSignatureFile(null);
      setSignaturePreview(null);
    }
  };

  const handleSubmit = () => {
    if (!signatureFile) {
      setErrors({ signature: "Please upload your signature" });
      return;
    }
    onSubmit({
      ...formData,
      initials,
      signatureBase64: signaturePreview,
    });
  };

  const setInitial = (idx, val) => {
    setInitials((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.7)",
        backdropFilter: "blur(6px)",
        padding: 16,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          maxHeight: "90vh",
          background: "#0d0d1a",
          borderRadius: 20,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          animation: "waiverSlideIn 0.3s ease-out",
        }}
      >
        {/* Header */}
        <div style={{ padding: "20px 24px 0", position: "relative" }}>
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              padding: 4,
              lineHeight: 1,
            }}
          >
            <X size={18} />
          </button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Shield size={16} style={{ color: "#00bfff" }} />
            <span
              style={{
                color: "#00bfff",
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
              }}
            >
              Safety & Legal
            </span>
          </div>
          <h2
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: 700,
              margin: "0 0 4px",
            }}
          >
            Modification Waiver
          </h2>
          <p
            style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: 0 }}
          >
            Programming & Speed Modification Agreement
          </p>

          {/* Progress bar */}
          <div style={{ display: "flex", gap: 6, marginTop: 16 }}>
            {[0, 1, 2].map((seg) => (
              <div
                key={seg}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background:
                    seg <= progressSegment ? "#00bfff" : (
                      "rgba(255,255,255,0.12)"
                    ),
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {step === 0 && (
            <StepInfo
              formData={formData}
              updateField={updateField}
              errors={errors}
            />
          )}
          {step >= 1 && step <= 6 && (
            <StepTerm
              term={LEGAL_TERMS[step - 1]}
              termIndex={step - 1}
              initial={initials[step - 1]}
              onInitialChange={(val) => setInitial(step - 1, val)}
              error={errors.initials}
            />
          )}
          {step === 7 && (
            <StepFinal
              signaturePreview={signaturePreview}
              fileInputRef={fileInputRef}
              onFileChange={handleSignatureChange}
              error={errors.signature}
            />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px 20px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            {step > 0 && (
              <button
                onClick={handleBack}
                disabled={isSubmitting}
                style={{
                  flex: "0 0 auto",
                  padding: "12px 24px",
                  borderRadius: 30,
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "transparent",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)";
                }}
              >
                Back
              </button>
            )}
            {step < 7 ?
              <button
                onClick={handleNext}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: 30,
                  border: "none",
                  background:
                    step === 0 ?
                      "linear-gradient(135deg, #00bfff, #0088cc)"
                    : "rgba(255,255,255,0.95)",
                  color: step === 0 ? "#fff" : "#111",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {step === 0 ?
                  <>
                    Review Legal Terms <ChevronRight size={16} />
                  </>
                : <>
                    I Understand & Agree <CheckCircle2 size={16} />
                  </>
                }
              </button>
            : <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: "12px 24px",
                  borderRadius: 30,
                  border: "none",
                  background: "linear-gradient(135deg, #00bfff, #0088cc)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isSubmitting ? "wait" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: isSubmitting ? 0.7 : 1,
                  transition: "all 0.2s",
                }}
              >
                {isSubmitting ?
                  <>
                    <Loader2
                      size={16}
                      style={{ animation: "spin 1s linear infinite" }}
                    />{" "}
                    Processing...
                  </>
                : <>
                    <CheckCircle2 size={16} /> Complete & Submit
                  </>
                }
              </button>
            }
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 16,
            }}
          >
            <span
              style={{
                color: "rgba(255,255,255,0.25)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontWeight: 600,
              }}
            >
              Secure Digital Waiver
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.25)",
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontWeight: 600,
              }}
            >
              SNH Golf Carts LLC
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes waiverSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

/* ─── Step 0: Customer Info ─── */
function StepInfo({ formData, updateField, errors }) {
  const fieldStyle = (hasError) => ({
    width: "100%",
    padding: "12px 14px",
    background: "#1a1a2e",
    border: `1px solid ${hasError ? "#ff4444" : "rgba(255,255,255,0.08)"}`,
    borderRadius: 10,
    color: "#fff",
    fontSize: 14,
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  });

  const labelStyle = {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
    marginBottom: 6,
    display: "block",
  };

  const errorStyle = { color: "#ff4444", fontSize: 11, marginTop: 4 };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Row: Name + Address */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={labelStyle}>Full Name</label>
          <input
            style={fieldStyle(errors.fullName)}
            placeholder="Full Name"
            value={formData.fullName}
            onChange={(e) => updateField("fullName", e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = "#00bfff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor =
                errors.fullName ? "#ff4444" : "rgba(255,255,255,0.08)";
            }}
          />
          {errors.fullName && <p style={errorStyle}>{errors.fullName}</p>}
        </div>
        <div>
          <label style={labelStyle}>Address</label>
          <input
            style={fieldStyle(errors.address)}
            placeholder="Street, City, Zip"
            value={formData.address}
            onChange={(e) => updateField("address", e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = "#00bfff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor =
                errors.address ? "#ff4444" : "rgba(255,255,255,0.08)";
            }}
          />
          {errors.address && <p style={errorStyle}>{errors.address}</p>}
        </div>
      </div>

      {/* Row: Phone + Email */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div>
          <label style={labelStyle}>Phone Number</label>
          <input
            style={fieldStyle(errors.phone)}
            placeholder="603-XXX-XXXX"
            value={formData.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = "#00bfff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor =
                errors.phone ? "#ff4444" : "rgba(255,255,255,0.08)";
            }}
          />
          {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
        </div>
        <div>
          <label style={labelStyle}>Email Address</label>
          <input
            style={fieldStyle(errors.email)}
            placeholder="email@example.com"
            value={formData.email}
            onChange={(e) => updateField("email", e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = "#00bfff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor =
                errors.email ? "#ff4444" : "rgba(255,255,255,0.08)";
            }}
          />
          {errors.email && <p style={errorStyle}>{errors.email}</p>}
        </div>
      </div>

      {/* Vehicle Details */}
      <div>
        <p
          style={{
            color: "#00bfff",
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.12em",
            marginBottom: 12,
          }}
        >
          Vehicle Details
        </p>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}
        >
          <div>
            <label style={labelStyle}>Make / Model</label>
            <input
              style={fieldStyle(errors.vehicleMakeModel)}
              placeholder="e.g. Apollo Gen2"
              value={formData.vehicleMakeModel}
              onChange={(e) => updateField("vehicleMakeModel", e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = "#00bfff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor =
                  errors.vehicleMakeModel ? "#ff4444" : (
                    "rgba(255,255,255,0.08)"
                  );
              }}
            />
            {errors.vehicleMakeModel && (
              <p style={errorStyle}>{errors.vehicleMakeModel}</p>
            )}
          </div>
          <div>
            <label style={labelStyle}>VIN / Serial #</label>
            <input
              style={fieldStyle(errors.vinSerial)}
              placeholder="Serial Number"
              value={formData.vinSerial}
              onChange={(e) => updateField("vinSerial", e.target.value)}
              onFocus={(e) => {
                e.target.style.borderColor = "#00bfff";
              }}
              onBlur={(e) => {
                e.target.style.borderColor =
                  errors.vinSerial ? "#ff4444" : "rgba(255,255,255,0.08)";
              }}
            />
            {errors.vinSerial && <p style={errorStyle}>{errors.vinSerial}</p>}
          </div>
        </div>
      </div>

      {/* Date (auto-filled) */}
      <div>
        <label style={labelStyle}>Date</label>
        <input
          style={fieldStyle(false)}
          type="date"
          value={formData.date}
          onChange={(e) => updateField("date", e.target.value)}
          onFocus={(e) => {
            e.target.style.borderColor = "#00bfff";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "rgba(255,255,255,0.08)";
          }}
        />
      </div>
    </div>
  );
}

/* ─── Steps 1-6: Legal Terms ─── */
function StepTerm({ term, termIndex, initial, onInitialChange, error }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <span
          style={{
            display: "inline-block",
            background: "rgba(0,191,255,0.12)",
            color: "#00bfff",
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 12px",
            borderRadius: 20,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Term {termIndex + 1} of 6
        </span>
      </div>

      <h3
        style={{
          color: "#fff",
          fontSize: 22,
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.3,
        }}
      >
        {term.title}
      </h3>

      <div
        style={{
          background: "#1a1a2e",
          borderRadius: 14,
          padding: "20px 20px 20px 20px",
          position: "relative",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p
          style={{
            color: "rgba(255,255,255,0.75)",
            fontSize: 14,
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          {term.body}
        </p>
        <div
          style={{ position: "absolute", right: 16, bottom: 16, opacity: 0.1 }}
        >
          <AlertTriangle size={48} color="#00bfff" />
        </div>
      </div>

      <div>
        <p
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: 13,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          By entering your initials below, you acknowledge and agree to this
          term.
        </p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <input
            placeholder="Your Initials"
            value={initial}
            onChange={(e) => onInitialChange(e.target.value.toUpperCase())}
            maxLength={5}
            style={{
              width: 160,
              textAlign: "center",
              padding: "10px 14px",
              background: "#1a1a2e",
              border: `1px solid ${error ? "#ff4444" : "rgba(255,255,255,0.12)"}`,
              borderRadius: 10,
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: "0.1em",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#00bfff";
            }}
            onBlur={(e) => {
              e.target.style.borderColor =
                error ? "#ff4444" : "rgba(255,255,255,0.12)";
            }}
          />
        </div>
        {error && (
          <p
            style={{
              color: "#ff4444",
              fontSize: 12,
              textAlign: "center",
              marginTop: 6,
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Step 7: Final Acknowledgment ─── */
function StepFinal({ signaturePreview, fileInputRef, onFileChange, error }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 20,
        textAlign: "center",
      }}
    >
      <div
        style={{
          background: "rgba(0,191,255,0.08)",
          borderRadius: 16,
          padding: 16,
          display: "inline-flex",
        }}
      >
        <CheckCircle2 size={36} color="#00bfff" />
      </div>

      <div>
        <h3
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: 700,
            margin: "0 0 6px",
          }}
        >
          Final Acknowledgment
        </h3>
        <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, margin: 0 }}>
          Please upload a clear photo of your handwritten signature.
        </p>
      </div>

      {/* Upload area */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: "100%",
          padding: signaturePreview ? 8 : 40,
          background: "#1a1a2e",
          border: `2px dashed ${error ? "#ff4444" : "rgba(0,191,255,0.25)"}`,
          borderRadius: 14,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "#00bfff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor =
            error ? "#ff4444" : "rgba(0,191,255,0.25)";
        }}
      >
        {signaturePreview ?
          <img
            src={signaturePreview}
            alt="Signature"
            style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 8 }}
          />
        : <>
            <Upload size={28} color="rgba(255,255,255,0.35)" />
            <p
              style={{
                color: "rgba(255,255,255,0.6)",
                fontSize: 14,
                fontWeight: 600,
                margin: 0,
              }}
            >
              Tap to Upload Photo
            </p>
            <p
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: 12,
                margin: 0,
              }}
            >
              PNG, JPG or JPEG
            </p>
          </>
        }
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg"
        onChange={onFileChange}
        style={{ display: "none" }}
      />

      {error && <p style={{ color: "#ff4444", fontSize: 12 }}>{error}</p>}

      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          background: "rgba(0,191,255,0.06)",
          borderRadius: 10,
          padding: "12px 14px",
          width: "100%",
          textAlign: "left",
        }}
      >
        <Shield
          size={16}
          style={{ color: "#00bfff", flexShrink: 0, marginTop: 2 }}
        />
        <p
          style={{
            color: "rgba(255,255,255,0.55)",
            fontSize: 12,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          By submitting this form, you certify that all information is accurate
          and you are the authorized owner of the vehicle.
        </p>
      </div>
    </div>
  );
}
