"use client";

import { useMemo, useState } from "react";
import registry from "./cookbook-data.json";

const categoryNames = [
  "Agents",
  "Responses API",
  "Realtime",
  "RAG & Search",
  "Vision & Images",
  "Audio",
  "Evals",
  "Fine-tuning",
] as const;

type Category = (typeof categoryNames)[number];
type CategoryKey = "All" | Category;
type Language = "Python" | "JavaScript" | "Guide";
type Difficulty = "Beginner" | "Intermediate" | "Advanced";

type Example = {
  title: string;
  description: string;
  path: string;
  slug: string | null;
  date: string | null;
  archived: boolean;
  authors: string[];
  tags: string[];
  categories: Category[];
  primaryCategory: Category;
  difficulty: Difficulty;
  languages: Language[];
  sourceUrl: string;
};

const examples = registry.examples as Example[];

const categoryMeta: Record<Category, { icon: string; accent: string }> = {
  Agents: { icon: "robot", accent: "#b6f36b" },
  "Responses API": { icon: "chat", accent: "#72e8a6" },
  Realtime: { icon: "bolt", accent: "#c7f781" },
  "RAG & Search": { icon: "search", accent: "#8de7c0" },
  "Vision & Images": { icon: "image", accent: "#b6f36b" },
  Audio: { icon: "audio", accent: "#72e8a6" },
  Evals: { icon: "check", accent: "#c7f781" },
  "Fine-tuning": { icon: "sliders", accent: "#8de7c0" },
};

const categories = categoryNames.map((name) => ({
  name,
  count: registry.categoryCounts[name],
  ...categoryMeta[name],
}));

const routes: Array<{
  step: string;
  title: string;
  copy: string;
  meta: string;
  category: Category;
  query: string;
}> = [
  {
    step: "01",
    title: "Make your first API call",
    copy: "Start with the Responses API, structured output and a small working example.",
    meta: "Beginner route",
    category: "Responses API",
    query: "getting started",
  },
  {
    step: "02",
    title: "Build a useful agent",
    copy: "Find tools, memory and guardrail patterns without jumping into architecture soup.",
    meta: "Agent route",
    category: "Agents",
    query: "",
  },
  {
    step: "03",
    title: "Evaluate and harden it",
    copy: "Trace behavior, define graders and catch regressions before users do.",
    meta: "Production route",
    category: "Evals",
    query: "",
  },
];

function Icon({ name }: { name: string }) {
  const common = {
    width: 30,
    height: 30,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (name === "robot")
    return <svg {...common}><rect x="5" y="7" width="14" height="11" rx="3"/><path d="M9 3h6M12 3v4M8.5 12h.01M15.5 12h.01M9 16h6M3 10v5M21 10v5"/></svg>;
  if (name === "chat")
    return <svg {...common}><path d="M21 12a8 8 0 0 1-8 8H6l-4 2 1.3-4.6A8 8 0 1 1 21 12Z"/></svg>;
  if (name === "bolt")
    return <svg {...common}><path d="m13 2-8 12h7l-1 8 8-12h-7l1-8Z"/></svg>;
  if (name === "search")
    return <svg {...common}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
  if (name === "image")
    return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9" r="1.5"/><path d="m21 15-5-5L5 20"/></svg>;
  if (name === "audio")
    return <svg {...common}><path d="M4 10v4M8 7v10M12 3v18M16 7v10M20 10v4"/></svg>;
  if (name === "check")
    return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m8 12 2.5 2.5L16 9M8 18h8"/></svg>;
  return <svg {...common}><path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h7M15 18h5"/><circle cx="16" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="13" cy="18" r="2"/></svg>;
}

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey>("All");
  const [language, setLanguage] = useState<"All" | Language>("All");
  const [difficulty, setDifficulty] = useState<"All" | Difficulty>("All");
  const [includeArchived, setIncludeArchived] = useState(false);
  const [visibleCount, setVisibleCount] = useState(24);
  const [selected, setSelected] = useState<Example | null>(null);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return examples.filter((item) => {
      const searchable = `${item.title} ${item.description} ${item.authors.join(" ")} ${item.tags.join(" ")}`.toLowerCase();
      return (
        (!needle || searchable.includes(needle)) &&
        (category === "All" || item.categories.includes(category)) &&
        (language === "All" || item.languages.includes(language)) &&
        (difficulty === "All" || item.difficulty === difficulty) &&
        (includeArchived || !item.archived)
      );
    });
  }, [query, category, language, difficulty, includeArchived]);

  const visible = filtered.slice(0, visibleCount);
  const jumpToExplorer = () => document.getElementById("explorer")?.scrollIntoView({ behavior: "smooth" });
  const resetFilters = () => {
    setQuery("");
    setCategory("All");
    setLanguage("All");
    setDifficulty("All");
    setIncludeArchived(false);
  };
  const openRoute = (route: (typeof routes)[number]) => {
    setCategory(route.category);
    setQuery(route.query);
    setDifficulty(route.step === "01" ? "Beginner" : "All");
    jumpToExplorer();
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Cookbook Atlas home">
          <span className="brand-mark">◫</span>
          Cookbook Atlas
          <small className="unofficial-badge">Unofficial</small>
        </a>
        <label className="header-search">
          <span aria-hidden="true">⌕</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} onFocus={jumpToExplorer} placeholder="Search examples, APIs, or patterns…" aria-label="Search Cookbook examples" />
          <kbd>⌘ K</kbd>
        </label>
        <a className="github-link" href="https://github.com/openai/openai-cookbook" target="_blank" rel="noreferrer">Source repo <span>↗</span></a>
      </header>

      <section className="hero" id="top">
        <div className="hero-art" aria-hidden="true" />
        <div className="hero-copy">
          <div className="eyebrow"><span /> Independent visual guide to the official repository</div>
          <h1>Build with OpenAI,<br />without getting lost<br />in the repo.</h1>
          <p>Search every practical example, pattern and guide indexed by the OpenAI Cookbook.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={jumpToExplorer}>Explore {registry.total} items <span>→</span></button>
            <a className="text-link" href="#routes">Show me a learning path <span>↓</span></a>
          </div>
        </div>
        <div className="atlas-label atlas-one"><Icon name="robot" /><span>Agents</span></div>
        <div className="atlas-label atlas-two"><Icon name="search" /><span>Search</span></div>
        <div className="atlas-label atlas-three"><Icon name="audio" /><span>Realtime</span></div>
      </section>

      <section className="category-section" aria-label="Browse by category">
        <div className="filter-row compact-filters">
          <div className="segmented" aria-label="Language filter">
            {(["All", "Python", "JavaScript", "Guide"] as const).map((item) => (
              <button key={item} className={language === item ? "active" : ""} onClick={() => setLanguage(item)}>{item}</button>
            ))}
          </div>
          <span className="filter-divider" />
          {(["Beginner", "Intermediate", "Advanced"] as const).map((item) => (
            <button key={item} className={`difficulty-pill ${difficulty === item ? "active" : ""}`} onClick={() => setDifficulty(difficulty === item ? "All" : item)}>
              <i className={`dot ${item.toLowerCase()}`} /> {item}
            </button>
          ))}
          <button className={`archive-toggle ${includeArchived ? "active" : ""}`} onClick={() => setIncludeArchived((value) => !value)}>
            {includeArchived ? "✓ " : "+ "}Archived ({registry.archived})
          </button>
        </div>

        <div className="category-grid">
          {categories.map((item) => (
            <button key={item.name} className={`category-card ${category === item.name ? "selected" : ""}`} style={{ "--accent": item.accent } as React.CSSProperties} onClick={() => { setCategory(category === item.name ? "All" : item.name); jumpToExplorer(); }}>
              <Icon name={item.icon} />
              <strong>{item.name}</strong>
              <span>{item.count} indexed items</span>
              <b>↗</b>
            </button>
          ))}
        </div>

        <div className="stats-strip">
          <div><strong>{registry.total}</strong><span>indexed guides & examples</span></div>
          <div><strong>{registry.active}</strong><span>current, non-archived items</span></div>
          <div><strong>{registry.archived}</strong><span>historical examples retained</span></div>
          <div><strong>Synced</strong><span>{registry.generatedAt.slice(0, 10)} from registry.yaml</span></div>
        </div>
      </section>

      <section className="routes-section" id="routes">
        <div className="section-heading">
          <div><span className="kicker">Guided routes</span><h2>Start from your goal,<br />not from a folder tree.</h2></div>
          <p>Each route cuts through the full index to a useful starting point. No twenty-tab archaeology expedition required.</p>
        </div>
        <div className="route-grid">
          {routes.map((route) => (
            <article className="route-card" key={route.step}>
              <span className="route-number">{route.step}</span>
              <div className="route-line"><i /><i /><i /></div>
              <h3>{route.title}</h3><p>{route.copy}</p><span className="route-meta">{route.meta}</span>
              <button onClick={() => openRoute(route)}>Open route <span>→</span></button>
            </article>
          ))}
        </div>
      </section>

      <section className="explorer-section" id="explorer">
        <div className="section-heading explorer-heading">
          <div><span className="kicker">Repository explorer</span><h2>Find the example that<br />actually solves your problem.</h2></div>
          <div className="result-count"><strong>{filtered.length}</strong><span>matching items<br />from the full registry</span></div>
        </div>

        <div className="explorer-toolbar">
          <label className="large-search"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try ‘agent memory’, ‘audio transcription’ or ‘evals’…" /></label>
          <select value={category} onChange={(event) => setCategory(event.target.value as CategoryKey)} aria-label="Filter by category">
            <option>All</option>{categories.map((item) => <option key={item.name}>{item.name}</option>)}
          </select>
          <button className="reset-button" onClick={resetFilters}>Reset</button>
        </div>

        <div className="active-filter-line">
          <span>Source: openai/openai-cookbook</span><span>{category !== "All" ? category : "All categories"}</span><span>{language !== "All" ? language : "All formats"}</span><span>{difficulty !== "All" ? difficulty : "All levels"}</span><span>{includeArchived ? "Including archived" : "Current only"}</span>
        </div>

        {filtered.length ? (
          <>
            <div className="example-grid">
              {visible.map((item) => (
                <button className="example-card" key={item.path} onClick={() => setSelected(item)}>
                  <div className="example-topline"><span>{item.primaryCategory}</span><time>{item.date ?? "Undated"}</time></div>
                  {item.archived && <span className="archived-badge">Archived</span>}
                  <h3>{item.title}</h3><p>{item.description}</p>
                  <div className="tag-row">{item.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
                  <div className="example-footer"><span><i className={`dot ${item.difficulty.toLowerCase()}`} /> {item.difficulty}</span><span>{item.languages.join(" · ")}</span><b>View details →</b></div>
                </button>
              ))}
            </div>
            {visible.length < filtered.length && <div className="load-more"><button className="secondary-button" onClick={() => setVisibleCount((count) => count + 24)}>Load 24 more <span>{visible.length} / {filtered.length}</span></button></div>}
          </>
        ) : (
          <div className="empty-state"><span>⌕</span><h3>No matching example.</h3><p>Clear a filter or search for a broader concept.</p><button className="primary-button" onClick={resetFilters}>Clear filters</button></div>
        )}
      </section>

      <section className="source-section">
        <div><span className="kicker">One source of truth</span><h2>The repository already contains<br />the map. We make it visible.</h2></div>
        <div className="source-flow" aria-label="How repository data becomes the explorer">
          <div><span>01</span><strong>GitHub repo</strong><small>notebooks + guides</small></div><i>→</i><div><span>02</span><strong>registry.yaml</strong><small>metadata + tags</small></div><i>→</i><div><span>03</span><strong>Cookbook Atlas</strong><small>search + routes</small></div>
        </div>
      </section>

      <footer>
        <a className="brand" href="#top"><span className="brand-mark">◫</span> Cookbook Atlas</a>
        <p>Unofficial visual explorer for the OpenAI Cookbook. Not affiliated with or endorsed by OpenAI.</p>
        <a href="https://github.com/openai/openai-cookbook" target="_blank" rel="noreferrer">Original repository ↗</a>
      </footer>

      {selected && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setSelected(null)}>
          <article className="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detail-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="close-button" onClick={() => setSelected(null)} aria-label="Close details">×</button>
            <div className="detail-badge">{selected.primaryCategory}{selected.archived ? " · Archived" : ""}</div>
            <h2 id="detail-title">{selected.title}</h2><p className="detail-description">{selected.description}</p>
            <div className="detail-facts"><div><span>Difficulty</span><strong>{selected.difficulty}</strong></div><div><span>Format</span><strong>{selected.languages.join(" + ")}</strong></div><div><span>Updated</span><strong>{selected.date ?? "Unknown"}</strong></div></div>
            {selected.authors.length > 0 && <div className="detail-path"><span>Authors</span><code>{selected.authors.join(", ")}</code></div>}
            <div className="detail-path"><span>Repository path</span><code>{selected.path}</code></div>
            <div className="tag-row detail-tags">{selected.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="detail-actions"><a className="primary-button" href={selected.sourceUrl} target="_blank" rel="noreferrer">Open official source <span>↗</span></a><button className="secondary-button" onClick={() => setSelected(null)}>Back to explorer</button></div>
          </article>
        </div>
      )}
    </main>
  );
}
