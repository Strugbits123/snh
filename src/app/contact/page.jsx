"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const CONTACT_INFO = [
  { icon: MapPin, label: "Visit Us", value: "Londonderry, NH", sub: "Southern New Hampshire" },
  { icon: Phone, label: "Call Us", value: "603-777-7831", href: "tel:6037777831" },
  { icon: Mail, label: "Email Us", value: "info@snhgolfcarts.com", href: "mailto:info@snhgolfcarts.com" },
  { icon: Clock, label: "Business Hours", value: "Mon-Sat: 9AM-6PM", sub: "Closed Sunday" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", inquiry_type: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = form.phone.replace(/\D/g, "");

    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!emailRegex.test(form.email)) e.email = "Please enter a valid email address";
    
    if (form.phone.trim() && phoneDigits.length < 10) {
      e.phone = "Please enter a valid 10-digit phone number";
    }

    if (!form.inquiry_type) e.inquiry_type = "Please select an inquiry type";
    if (!form.message.trim()) e.message = "Message is required";
    else if (form.message.trim().length < 10) e.message = "Message must be at least 10 characters";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
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
        setErrors({});
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-16">
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
                  <a href={info.href} className="font-semibold text-sm hover:text-accent transition-colors break-all">
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
                <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                  <h2 className="font-display font-bold text-2xl mb-6">Send Us a Message</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input
                        placeholder="John Doe"
                        value={form.name}
                        onChange={(e) => { updateField("name", e.target.value); if(errors.name) setErrors({...errors, name:null}); }}
                        className={`rounded-xl h-12 ${errors.name ? "border-red-500 focus:ring-red-200" : ""}`}
                      />
                      {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        value={form.email}
                        onChange={(e) => { updateField("email", e.target.value); if(errors.email) setErrors({...errors, email:null}); }}
                        className={`rounded-xl h-12 ${errors.email ? "border-red-500 focus:ring-red-200" : ""}`}
                      />
                      {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        placeholder="603-777-7831"
                        value={form.phone}
                        onChange={(e) => { updateField("phone", e.target.value); if(errors.phone) setErrors({...errors, phone:null}); }}
                        className={`rounded-xl h-12 ${errors.phone ? "border-red-500 focus:ring-red-200" : ""}`}
                      />
                      {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label>Inquiry Type *</Label>
                      <Select 
                        value={form.inquiry_type} 
                        onValueChange={(v) => { updateField("inquiry_type", v); if(errors.inquiry_type) setErrors({...errors, inquiry_type:null}); }}
                      >
                        <SelectTrigger className={`rounded-xl h-12 ${errors.inquiry_type ? "border-red-500" : ""}`}>
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
                      {errors.inquiry_type && <p className="text-red-500 text-xs mt-1">{errors.inquiry_type}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Message *</Label>
                    <Textarea
                      rows={5}
                      placeholder="Tell us how we can help..."
                      value={form.message}
                      onChange={(e) => { updateField("message", e.target.value); if(errors.message) setErrors({...errors, message:null}); }}
                      className={`rounded-xl resize-none ${errors.message ? "border-red-500 focus:ring-red-200" : ""}`}
                    />
                    {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
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
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d2921.433744715386!2d-71.407091!3d42.926982!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89e24d005fae9693%3A0x3acb317d61226cca!2sSNH%20Golf%20Carts%20LLC!5e0!3m2!1sen!2sus!4v1777472561810!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}