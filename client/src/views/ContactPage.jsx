"use client";
import { useState } from "react";
import { FiMail, FiPhone, FiMapPin, FiSend, FiCheckCircle } from "react-icons/fi";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 md:py-24 text-white font-sans">
      <div className="text-center mb-12">
        <span className="badge text-[10px] tracking-widest uppercase mb-4 inline-block">
          ✦ Reach Out
        </span>
        <h1 className="font-display font-bold text-4xl md:text-6xl gradient-text tracking-wide leading-tight mb-4">
          Contact Us
        </h1>
        <p className="font-serif italic text-[#9d8bbb] text-base max-w-xl mx-auto leading-relaxed">
          Have a question about our collections, orders, or sizing? Our support team is here to assist you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Info */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col gap-6">
            <h2 className="font-display font-semibold text-lg text-white mb-2">Get in Touch</h2>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-400/15 flex items-center justify-center text-primary-300 flex-shrink-0">
                <FiMail className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Email Us</p>
                <p className="text-sm mt-0.5 font-medium hover:text-primary-300 transition-colors">
                  <a href="mailto:support@aurabellaafroz.com">support@aurabellaafroz.com</a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-400/15 flex items-center justify-center text-primary-300 flex-shrink-0">
                <FiPhone className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Call Us</p>
                <p className="text-sm mt-0.5 font-medium">+91 98XXX XXXXX</p>
                <p className="text-[11px] text-[#9d8bbb] mt-0.5">Mon - Sat: 10 AM to 7 PM IST</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-400/15 flex items-center justify-center text-primary-300 flex-shrink-0">
                <FiMapPin className="text-lg" />
              </div>
              <div>
                <p className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">HQ Address</p>
                <p className="text-xs text-[#9d8bbb] leading-relaxed mt-0.5">
                  AuraBella HQ, Fashion District,<br />
                  Mumbai, Maharashtra – 400001, India
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="lg:col-span-2">
          <div className="glass-card p-8 flex flex-col gap-6">
            <h2 className="font-display font-semibold text-lg text-white border-b border-white/5 pb-3">Send a Message</h2>
            
            {submitted ? (
              <div className="flex flex-col items-center gap-3 py-12 text-center">
                <FiCheckCircle className="text-5xl text-green-400 animate-bounce" />
                <h3 className="font-display font-bold text-xl text-white">Thank You!</h3>
                <p className="text-sm text-[#9d8bbb] max-w-sm">Your message has been sent successfully. Our support staff will respond to you within 24 business hours.</p>
                <button onClick={() => setSubmitted(false)} className="btn-outline mt-4">Send Another Message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Your Name</span>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Email Address</span>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="jane@example.com"
                      className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-400 transition-colors"
                    />
                  </label>
                </div>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Subject</span>
                  <input
                    type="text"
                    required
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    placeholder="Order query, sizing feedback..."
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-400 transition-colors"
                  />
                </label>

                <label className="flex flex-col gap-1.5">
                  <span className="text-[10px] text-white/50 uppercase tracking-wider font-semibold">Message</span>
                  <textarea
                    rows="5"
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="Write details about your query..."
                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-400 transition-colors resize-none"
                  />
                </label>

                <button type="submit" className="btn-primary py-3 px-8 flex items-center justify-center gap-2 mt-2 w-fit">
                  <FiSend /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
