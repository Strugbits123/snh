"use client";
import { useState, useRef, useEffect } from "react";
import { wixClient } from "@/lib/wixClient";

// Strip markdown formatting from bot replies
function stripMarkdown(text) {
  return text
    .replace(/^#{1,6}\s+/gm, "")        // headers
    .replace(/\*\*(.+?)\*\*/g, "$1")     // **bold**
    .replace(/\*(.+?)\*/g, "$1")         // *italic*
    .replace(/__(.+?)__/g, "$1")         // __bold__
    .replace(/_(.+?)_/g, "$1")           // _italic_
    .replace(/~~(.+?)~~/g, "$1")         // ~~strikethrough~~
    .replace(/^[-*+]\s+/gm, "• ")       // bullet lists
    .replace(/^\d+\.\s+/gm, "")         // numbered lists prefix cleanup
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // [text](url) -> text
    .replace(/`([^`]+)`/g, "$1")         // inline code
    .replace(/\n{3,}/g, "\n\n");          // collapse excess newlines
}
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const handleOpenChat = () => openChat();
    window.addEventListener("open-ai-chat", handleOpenChat);
    return () => window.removeEventListener("open-ai-chat", handleOpenChat);
  }, [greeted]);

  function openChat() {
    setOpen(true);
    if (!greeted) {
      setGreeted(true);
      setMessages([{ role: "bot", type: "greeting" }]);
    }
    setTimeout(() => textareaRef.current?.focus(), 100);
  }

  function closeChat() { setOpen(false); }

  async function callBot(newHistory) {
    setLoading(true);
    try {
      // Calls local Next.js API that can be wired up to your Chatbot/OpenAI backend
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });
      const data = await res.json();
      const reply = data.reply || "I am currently undergoing upgrades for Next.js!";
      setHistory((h) => [...h, { role: "assistant", content: reply }]);

      // Parse PRODUCTS_JSON if present — use greedy match to capture the full JSON array
      const productMatch = reply.match(/PRODUCTS_JSON:(\[.*\])/s);
      let products = [];
      let cleanText = reply;
      if (productMatch) {
        try { products = JSON.parse(productMatch[1]); } catch(e) {}
        cleanText = reply.replace(/PRODUCTS_JSON:\[.*\]/s, "").trim();
      }
      // Strip markdown formatting for clean display
      cleanText = stripMarkdown(cleanText);
      setMessages((m) => [...m, { role: "bot", text: cleanText, products }]);
    } catch {
      setMessages((m) => [...m, { role: "bot", text: "Connection error. Please try again.", products: [] }]);
    }
    setLoading(false);
  }

  function handleQuickReply(text) {
    const newHistory = [...history, { role: "user", content: text }];
    setHistory(newHistory);
    setMessages((m) => [...m, { role: "user", text }]);
    callBot(newHistory);
  }

  function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    const newHistory = [...history, { role: "user", content: text }];
    setHistory(newHistory);
    setMessages((m) => [...m, { role: "user", text }]);
    callBot(newHistory);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  }

  function autoResize(el) {
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 80) + "px";
  }

  return (
    <>
      {/* Launcher */}
      <button
        onClick={open ? closeChat : openChat}
        style={{
          position: "fixed", bottom: 24, right: 24, width: 56, height: 56,
          background: "#1a1a2e", borderRadius: "50%", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          border: "none", zIndex: 9999, boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={e => e.currentTarget.style.transform = "scale(1.08)"}
        onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" fill="white" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      <div style={{
        position: "fixed", bottom: 90, right: 24, width: 360, height: 520,
        background: "#0f0f1e", borderRadius: 16, display: "flex", flexDirection: "column",
        overflow: "hidden", zIndex: 9998, border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        transition: "opacity 0.2s, transform 0.2s",
        opacity: open ? 1 : 0,
        pointerEvents: open ? "auto" : "none",
        transform: open ? "translateY(0)" : "translateY(12px)",
      }}>
        {/* Header */}
        <div style={{
          background: "#1a1a2e", padding: "14px 16px", display: "flex",
          alignItems: "center", gap: 10, borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%", background: "#2d2d4e",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
          }}>🛒</div>
          <div style={{ flex: 1 }}>
            <p style={{ color: "#fff", fontWeight: 500, fontSize: 14, margin: 0 }}>AI Cart Finder</p>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, margin: 0 }}>SNH Golf Carts LLC</p>
          </div>
          <button onClick={closeChat} style={{
            background: "none", border: "none", color: "rgba(255,255,255,0.5)",
            cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1,
          }}>×</button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: 16, display: "flex",
          flexDirection: "column", gap: 12,
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", maxWidth: "85%", alignSelf: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.type === "greeting" ? (
                <>
                  <div style={{
                    padding: "10px 14px", borderRadius: 14, fontSize: 13.5, lineHeight: 1.5,
                    background: "#1e1e36", color: "rgba(255,255,255,0.9)", borderBottomLeftRadius: 4,
                  }}>
                    Hey there! I'm SNH's AI cart finder<br /><br />
                    I can help you find the perfect golf cart in about 60 seconds.<br /><br />
                    Want to start?
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {["Yes, let's go!", "I have a question", "Just browsing"].map((opt) => (
                      <button key={opt} onClick={() => handleQuickReply(opt)} style={{
                        background: "transparent", border: "1px solid rgba(200,168,75,0.5)",
                        color: "#c8a84b", borderRadius: 20, padding: "5px 12px", fontSize: 12,
                        cursor: "pointer", transition: "all 0.15s",
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(200,168,75,0.15)"; e.currentTarget.style.borderColor = "#c8a84b"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(200,168,75,0.5)"; }}
                      >{opt}</button>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div style={{
                    padding: "10px 14px", borderRadius: 14, fontSize: 13.5, lineHeight: 1.5,
                    background: msg.role === "user" ? "#c8a84b" : "#1e1e36",
                    color: msg.role === "user" ? "#1a1a00" : "rgba(255,255,255,0.9)",
                    fontWeight: msg.role === "user" ? 500 : 400,
                    borderBottomRightRadius: msg.role === "user" ? 4 : 14,
                    borderBottomLeftRadius: msg.role === "bot" ? 4 : 14,
                    whiteSpace: "pre-wrap",
                  }}>
                    {msg.text}
                  </div>
                  {/* Product cards */}
                  {msg.products && msg.products.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 10 }}>
                      {msg.products.map((p, pi) => (
                        <div key={pi} style={{
                          background: "#1e1e36", border: "1px solid rgba(200,168,75,0.25)",
                          borderRadius: 10, padding: "10px 12px", display: "flex",
                          alignItems: "center", justifyContent: "space-between", gap: 8,
                        }}>
                          <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
                            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</span>
                            <span style={{ color: "#c8a84b", fontSize: 11, fontWeight: 600 }}>{p.price}</span>
                          </div>
                          <a href={p.url} target="_blank" rel="noopener noreferrer" style={{
                            background: "#c8a84b", color: "#1a1a00", border: "none", borderRadius: 20,
                            padding: "5px 12px", fontSize: 11, fontWeight: 600, cursor: "pointer",
                            textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
                          }}>View Product →</a>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", maxWidth: "85%", alignSelf: "flex-start" }}>
              <div style={{
                display: "flex", gap: 4, alignItems: "center", padding: "10px 14px",
                background: "#1e1e36", borderRadius: 14, borderBottomLeftRadius: 4, width: "fit-content",
              }}>
                {[0, 0.2, 0.4].map((delay, i) => (
                  <div key={i} style={{
                    width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,0.4)",
                    animation: "snhBounce 1.2s infinite", animationDelay: `${delay}s`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: 12, borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex", gap: 8, alignItems: "center", background: "#0f0f1e",
        }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => { setInput(e.target.value); autoResize(e.target); }}
            onKeyDown={handleKey}
            placeholder="Type your question..."
            rows={1}
            style={{
              flex: 1, background: "#1e1e36", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 22, padding: "8px 14px", color: "rgba(255,255,255,0.9)",
              fontSize: 13, outline: "none", resize: "none", minHeight: 36, maxHeight: 80,
              fontFamily: "inherit", scrollbarWidth: "thin", scrollbarColor: "rgba(200,168,75,0.4) transparent",
            }}
            onFocus={e => e.target.style.borderColor = "rgba(200,168,75,0.5)"}
            onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
          />
          <button onClick={sendMessage} disabled={loading} style={{
            width: 36, height: 36, borderRadius: "50%", background: "#c8a84b",
            border: "none", cursor: "pointer", display: "flex", alignItems: "center",
            justifyContent: "center", flexShrink: 0, opacity: loading ? 0.6 : 1,
            transition: "transform 0.15s",
          }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = "scale(1.08)"; }}
            onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

      </div>

      <style>{`
        @keyframes snhBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
}