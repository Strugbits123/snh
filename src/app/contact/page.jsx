"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

const CONTACT_INFO = [
  { icon: MapPin, label: "Visit Us", value: "Londonderry, NH", sub: "Southern New Hampshire" },
  { icon: Phone, label: "Call Us", value: "(603) 555-1234", href: "tel:+16035551234" },
  { icon: Mail, label: "Email Us", value: "info@snhgolfcarts.com", href: "mailto:info@snhgolfcarts.com" },
  { icon: Clock, label: "Business Hours", value: "Mon-Sat: 9AM-6PM", sub: "Closed Sunday" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", inquiry_type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const response = await fetch("/api/forms/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          formName: "Contact Us Page",
          message: form.message,
          metadata: {
            inquiry_type: form.inquiry_type
          }
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setSubmitted(true);
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Contact form error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const updateField = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  return (
    <div>
      <section className="pt-32 pb-16 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-block text-accent text-xs font-semibold uppercase tracking-[0.2em] mb-4">
              Get in Touch
            </span>
            <h1 className="font-display font-bold text-4xl sm:text-5xl mb-4">Contact Us</h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Have a question about a cart, need to schedule service, or want a custom quote? We'd love to hear from you.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {CONTACT_INFO.map((info, i) => (
              <motion.div
                key={info.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-6 border border-border text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <info.icon className="w-5 h-5 text-accent" />
                </div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{info.label}</p>
                {info.href ? (
                  <a href={info.href} className="font-semibold text-sm hover:text-accent transition-colors">
                    {info.value}
                  </a>
                ) : (
                  <p className="font-semibold text-sm">{info.value}</p>
                )}
                {info.sub && <p className="text-xs text-muted-foreground mt-1">{info.sub}</p>}
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {submitted ? (
                <div className="bg-accent/5 border border-accent/20 rounded-2xl p-12 text-center">
                  <CheckCircle className="w-16 h-16 text-accent mx-auto mb-4" />
                  <h3 className="font-display font-bold text-2xl mb-2">Message Sent!</h3>
                  <p className="text-muted-foreground">
                    Thank you for reaching out. We'll get back to you within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 rounded-full"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: "", email: "", phone: "", inquiry_type: "", message: "" });
                    }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h2 className="font-display font-bold text-2xl mb-6">Send Us a Message</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        required
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => updateField("name", e.target.value)}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        required
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="rounded-xl h-12"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        placeholder="(603) 555-0000"
                        value={form.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="rounded-xl h-12"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Inquiry Type</Label>
                      <Select value={form.inquiry_type} onValueChange={(v) => updateField("inquiry_type", v)}>
                        <SelectTrigger className="rounded-xl h-12">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sales">Sales</SelectItem>
                          <SelectItem value="Service">Service</SelectItem>
                          <SelectItem value="Rental">Rental</SelectItem>
                          <SelectItem value="Quote">Request a Quote</SelectItem>
                          <SelectItem value="General">General Question</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Message *</Label>
                    <Textarea
                      required
                      rows={5}
                      placeholder="Tell us how we can help..."
                      value={form.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      className="rounded-xl resize-none"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={submitting}
                    size="lg"
                    className="bg-accent hover:bg-accent/90 text-white rounded-full px-8 h-14 text-base"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    {submitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-2xl overflow-hidden h-[500px] border border-border"
            >
              <MapContainer
                center={[42.8651, -71.3738]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[42.8651, -71.3738]}>
                  <Popup>SNH Golf Carts LLC<br />Londonderry, NH</Popup>
                </Marker>
              </MapContainer>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}