import { useState, useRef, useCallback } from "react";

const MARKETPLACES = [
  {
    id: "facebook",
    name: "Facebook Marketplace",
    icon: "📘",
    color: "#1877F2",
    url: "https://www.facebook.com/marketplace/create/item",
    fields: ["title", "price", "category", "description", "condition"],
  },
  {
    id: "ebay",
    name: "eBay",
    icon: "🛒",
    color: "#E53238",
    url: "https://sell.ebay.com/sellhub",
    fields: ["title", "price", "category", "description", "condition", "tags"],
  },
  {
    id: "depop",
    name: "Depop",
    icon: "🔴",
    color: "#FF2300",
    url: "https://www.depop.com/sell/",
    fields: ["title", "price", "description", "tags", "condition"],
  },
  {
    id: "mercari",
    name: "Mercari",
    icon: "🟥",
    color: "#E84B63",
    url: "https://www.mercari.com/sell/",
    fields: ["title", "price", "category", "description", "condition"],
  },
  {
    id: "poshmark",
    name: "Poshmark",
    icon: "👗",
    color: "#7B2D8B",
    url: "https://poshmark.com/create-listing",
    fields: ["title", "price", "category", "description", "condition", "tags"],
  },
  {
    id: "craigslist",
    name: "Craigslist",
    icon: "📋",
    color: "#5B6670",
    url: "https://post.craigslist.org/",
    fields: ["title", "price", "description"],
  },
  {
    id: "offerup",
    name: "OfferUp",
    icon: "🏷️",
    color: "#00A860",
    url: "https://offerup.com/post/",
    fields: ["title", "price", "category", "description", "condition"],
  },
];

const FIELD_LABELS = {
  title: "Title",
  price: "Suggested Price",
  category: "Category",
  description: "Description",
  condition: "Condition",
  tags: "Tags / Keywords",
};

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        background: copied ? "#22c55e" : "rgba(255,255,255,0.12)",
        border: "1px solid rgba(255,255,255,0.18)",
        color: "#fff",
        borderRadius: 6,
        padding: "3px 10px",
        fontSize: 11,
        cursor: "pointer",
        transition: "all 0.2s",
        fontFamily: "inherit",
        letterSpacing: "0.03em",
      }}
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function MarketplaceCard({ marketplace, listing }) {
  const [open, setOpen] = useState(false);
  const fields = marketplace.fields;

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: `1px solid rgba(255,255,255,0.1)`,
        borderRadius: 14,
        overflow: "hidden",
        transition: "box-shadow 0.2s",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 18px",
          cursor: "pointer",
          userSelect: "none",
          borderLeft: `4px solid ${marketplace.color}`,
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <span style={{ fontSize: 22 }}>{marketplace.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f1f1" }}>
            {marketplace.name}
          </div>
          {listing?.title && (
            <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
              {listing.title.slice(0, 50)}…
            </div>
          )}
        </div>
        <a
          href={marketplace.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: marketplace.color,
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
            textDecoration: "none",
            fontFamily: "inherit",
            whiteSpace: "nowrap",
          }}
        >
          Open →
        </a>
        <span style={{ color: "#6b7280", fontSize: 12 }}>{open ? "▲" : "▼"}</span>
      </div>

      {open && listing && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          {fields.map((field) => (
            <div key={field} style={{ marginTop: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 5,
                }}
              >
                <span style={{ fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                  {FIELD_LABELS[field] || field}
                </span>
                <CopyButton text={listing[field] || ""} />
              </div>
              <div
                style={{
                  background: "rgba(0,0,0,0.25)",
                  borderRadius: 8,
                  padding: "10px 12px",
                  fontSize: 13,
                  color: "#e5e7eb",
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {listing[field] || <span style={{ color: "#6b7280" }}>—</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [images, setImages] = useState([]);
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const fileRef = useRef();
  const cameraRef = useRef();

  const processFiles = useCallback(async (files) => {
    const newImgs = [];
    for (const file of files) {
      if (!file.type.startsWith("image/")) continue;
      const base64 = await new Promise((res) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.readAsDataURL(file);
      });
      newImgs.push({ base64, type: file.type, preview: URL.createObjectURL(file) });
    }
    setImages((prev) => [...prev, ...newImgs].slice(0, 6));
  }, []);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const generateListings = async () => {
    if (!images.length) return;
    setLoading(true);
    setError(null);
    setListings(null);

    try {
      const imageContent = images.map((img) => ({
        type: "image",
        source: { type: "base64", media_type: img.type, data: img.base64 },
      }));

      const prompt = `You are an expert reseller and marketplace listing specialist. Analyze the item(s) in these photos carefully.

Generate optimized listings for each of these 7 marketplaces: Facebook Marketplace, eBay, Depop, Mercari, Poshmark, Craigslist, OfferUp.

Each listing should be tailored to that platform's audience and style (e.g., Depop is trendy/fashion-forward, eBay is detailed/keyword-rich, Craigslist is casual/local).

Return ONLY a valid JSON object with this exact structure:
{
  "itemSummary": "brief 1-sentence description of what the item is",
  "facebook": { "title": "", "price": "", "category": "", "description": "", "condition": "" },
  "ebay": { "title": "", "price": "", "category": "", "description": "", "condition": "", "tags": "" },
  "depop": { "title": "", "price": "", "description": "", "tags": "", "condition": "" },
  "mercari": { "title": "", "price": "", "category": "", "description": "", "condition": "" },
  "poshmark": { "title": "", "price": "", "category": "", "description": "", "condition": "", "tags": "" },
  "craigslist": { "title": "", "price": "", "description": "" },
  "offerup": { "title": "", "price": "", "category": "", "description": "", "condition": "" }
}

Rules:
- titles: compelling, keyword-rich, under 80 chars
- prices: realistic resale value as a string like "$45" or "$35-45"
- descriptions: platform-appropriate tone, include measurements/specs if visible
- tags: comma-separated relevant keywords
- condition: one of New, Like New, Good, Fair, Poor based on what you see
- NO markdown, NO backticks, ONLY raw JSON`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: [...imageContent, { type: "text", text: prompt }] }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((c) => c.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setListings(parsed);
    } catch (err) {
      setError("Couldn't generate listings. Make sure the images are clear and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setImages([]);
    setListings(null);
    setError(null);
  };

  const filteredMarketplaces =
    activeTab === "all"
      ? MARKETPLACES
      : MARKETPLACES.filter((m) => m.id === activeTab);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0d0d12",
        color: "#f1f1f1",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        padding: "0 0 60px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0d0d12; }
        ::-webkit-scrollbar-thumb { background: #2d2d3a; border-radius: 3px; }
        .img-thumb { transition: transform 0.2s; }
        .img-thumb:hover { transform: scale(1.04); }
        .gen-btn {
          background: linear-gradient(135deg, #f59e0b, #ef4444);
          border: none;
          color: #fff;
          font-family: inherit;
          font-weight: 800;
          font-size: 16px;
          padding: 16px 40px;
          border-radius: 12px;
          cursor: pointer;
          letter-spacing: 0.02em;
          transition: opacity 0.2s, transform 0.15s;
          box-shadow: 0 4px 24px rgba(245,158,11,0.3);
        }
        .gen-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .gen-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .tab-btn {
          background: none;
          border: 1px solid rgba(255,255,255,0.1);
          color: #9ca3af;
          font-family: inherit;
          font-size: 12px;
          padding: 6px 14px;
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .tab-btn.active {
          background: rgba(255,255,255,0.1);
          color: #f1f1f1;
          border-color: rgba(255,255,255,0.25);
        }
        .pulse-ring { animation: pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite; }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
      `}</style>

      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.02)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 14,
      }}>
        <div style={{
          width: 42, height: 42,
          background: "linear-gradient(135deg, #f59e0b, #ef4444)",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, flexShrink: 0,
        }}>🏪</div>
        <div>
          <div style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, fontSize: 20,
            background: "linear-gradient(90deg, #f59e0b, #ef4444)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            lineHeight: 1.1,
          }}>ListEverywhere</div>
          <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
            Photo → AI listings for 7 marketplaces
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 16px 0" }}>
        {/* Upload Zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !images.length && fileRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? "#f59e0b" : "rgba(255,255,255,0.15)"}`,
            borderRadius: 18,
            padding: images.length ? "20px" : "48px 24px",
            textAlign: "center",
            cursor: images.length ? "default" : "pointer",
            transition: "all 0.2s",
            background: dragOver ? "rgba(245,158,11,0.05)" : "rgba(255,255,255,0.02)",
            marginBottom: 20,
          }}
        >
          {!images.length ? (
            <>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
              <div style={{ fontWeight: 700, fontSize: 17, marginBottom: 6 }}>Drop photos here</div>
              <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 20 }}>or tap to browse — up to 6 photos</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} style={{
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#f1f1f1", fontFamily: "inherit", fontWeight: 600, fontSize: 13,
                  padding: "10px 20px", borderRadius: 10, cursor: "pointer",
                }}>📁 Browse Files</button>
                <button onClick={(e) => { e.stopPropagation(); cameraRef.current?.click(); }} style={{
                  background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#f1f1f1", fontFamily: "inherit", fontWeight: 600, fontSize: 13,
                  padding: "10px 20px", borderRadius: 10, cursor: "pointer",
                }}>📷 Take Photo</button>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 14 }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: "relative" }} className="img-thumb">
                    <img src={img.preview} alt="" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)" }} />
                    <button onClick={(e) => { e.stopPropagation(); setImages((prev) => prev.filter((_, j) => j !== i)); }} style={{
                      position: "absolute", top: -6, right: -6, width: 22, height: 22,
                      background: "#ef4444", border: "none", borderRadius: "50%",
                      color: "#fff", fontSize: 11, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
                    }}>✕</button>
                  </div>
                ))}
                {images.length < 6 && (
                  <button onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }} style={{
                    width: 90, height: 90, background: "rgba(255,255,255,0.05)",
                    border: "2px dashed rgba(255,255,255,0.15)", borderRadius: 10,
                    color: "#6b7280", fontSize: 24, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>+</button>
                )}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>{images.length} photo{images.length !== 1 ? "s" : ""} ready</div>
            </>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => processFiles(Array.from(e.target.files))} />
        <input ref={cameraRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={(e) => processFiles(Array.from(e.target.files))} />

        {images.length > 0 && !listings && (
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <button className="gen-btn" disabled={loading} onClick={generateListings}>
              {loading ? <span className="pulse-ring">✨ Analyzing & generating listings…</span> : "✨ Generate All Listings"}
            </button>
            {loading && <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>AI is analyzing your item and writing tailored listings for each marketplace…</div>}
          </div>
        )}

        {error && (
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", color: "#fca5a5", fontSize: 13, marginBottom: 20 }}>
            ⚠️ {error}
          </div>
        )}

        {listings && (
          <div>
            <div style={{
              background: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(239,68,68,0.08))",
              border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14,
              padding: "16px 20px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <span style={{ fontSize: 24 }}>✅</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: "#fbbf24" }}>Listings generated for {MARKETPLACES.length} marketplaces</div>
                <div style={{ fontSize: 13, color: "#d1d5db", marginTop: 3 }}>{listings.itemSummary}</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, marginBottom: 16 }}>
              <button className={`tab-btn ${activeTab === "all" ? "active" : ""}`} onClick={() => setActiveTab("all")}>All ({MARKETPLACES.length})</button>
              {MARKETPLACES.map((m) => (
                <button key={m.id} className={`tab-btn ${activeTab === m.id ? "active" : ""}`} onClick={() => setActiveTab(m.id)}>
                  {m.icon} {m.name.split(" ")[0]}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {filteredMarketplaces.map((marketplace) => (
                <MarketplaceCard key={marketplace.id} marketplace={marketplace} listing={listings[marketplace.id]} />
              ))}
            </div>

            <div style={{ textAlign: "center", marginTop: 28 }}>
              <button onClick={clearAll} style={{
                background: "none", border: "1px solid rgba(255,255,255,0.15)",
                color: "#9ca3af", fontFamily: "inherit", fontSize: 13,
                padding: "10px 22px", borderRadius: 10, cursor: "pointer",
              }}>↩ Start Over</button>
            </div>

            <div style={{ marginTop: 28, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "14px 18px" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>💡 How to use</div>
              <ol style={{ margin: 0, paddingLeft: 18, color: "#6b7280", fontSize: 12, lineHeight: 2 }}>
                <li>Expand any marketplace card to see the generated listing</li>
                <li>Hit <strong style={{ color: "#9ca3af" }}>Copy</strong> on any field to copy it</li>
                <li>Click <strong style={{ color: "#9ca3af" }}>Open →</strong> to go straight to that marketplace's posting page</li>
                <li>Paste your content and upload your photos — done!</li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
