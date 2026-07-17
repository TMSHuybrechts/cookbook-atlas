import { mkdir, readFile, writeFile } from "node:fs/promises";
import process from "node:process";
import { parse } from "yaml";

const SOURCE_URL =
  "https://raw.githubusercontent.com/openai/openai-cookbook/main/registry.yaml";
const OUTPUT_PATH = new URL("../app/cookbook-data.json", import.meta.url);

const CATEGORY_RULES = [
  {
    name: "Agents",
    pattern:
      /agents?|agents-sdk|agentkit|computer-use|workspace-agents|multi-agent|handoffs?|guardrails?/i,
  },
  {
    name: "Realtime",
    pattern: /realtime|real-time|websocket|webrtc/i,
  },
  {
    name: "RAG & Search",
    pattern:
      /\brag\b|search|retrieval|embeddings?|file-search|vector|grounding|knowledge-base/i,
  },
  {
    name: "Vision & Images",
    pattern:
      /vision|images?|multimodal|sora|video|ocr|spatial|dall-e|image-generation/i,
  },
  {
    name: "Audio",
    pattern:
      /audio|speech|transcri|text-to-speech|tts|voice|whisper|diarization/i,
  },
  {
    name: "Evals",
    pattern: /evals?|evaluation|graders?|tracing|benchmark|promptfoo/i,
  },
  {
    name: "Fine-tuning",
    pattern:
      /fine-tun|finetun|distillation|training|reinforcement|dpo|sft|grpo/i,
  },
  {
    name: "Responses API",
    pattern:
      /responses?|completions?|functions?|structured-output|reasoning|prompt|api|models?|gpt-/i,
  },
];

function readStdin() {
  return new Promise((resolve, reject) => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", (chunk) => (data += chunk));
    process.stdin.on("end", () => resolve(data));
    process.stdin.on("error", reject);
  });
}

function categoriesFor(entry) {
  const haystack = [
    entry.title,
    entry.description,
    entry.path,
    ...(entry.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ");
  const matches = CATEGORY_RULES.filter((rule) =>
    rule.pattern.test(haystack),
  ).map((rule) => rule.name);
  return matches.length ? matches : ["Responses API"];
}

function languagesFor(entry) {
  const path = String(entry.path ?? "").toLowerCase();
  const haystack = [entry.title, entry.description, ...(entry.tags ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  const languages = new Set();

  if (path.endsWith(".ipynb") || /python|pytorch|pandas/.test(haystack)) {
    languages.add("Python");
  }
  if (/javascript|typescript|node\.js|\bnode\b|deno|react/.test(haystack)) {
    languages.add("JavaScript");
  }
  if (path.endsWith(".md") || path.endsWith(".mdx")) {
    languages.add("Guide");
  }
  if (!languages.size) languages.add("Guide");
  return [...languages];
}

function difficultyFor(entry, categories) {
  const haystack = [
    entry.title,
    entry.description,
    entry.path,
    ...(entry.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ");

  if (
    /getting-started|getting started|quickstart|introduction|\bintro\b|basics?|first api|how to run|beginner/i.test(
      haystack,
    )
  ) {
    return "Beginner";
  }
  if (
    categories.some((category) =>
      ["Fine-tuning", "Evals"].includes(category),
    ) ||
    /advanced|migration|multi-agent|deep-research|security|governance|production|optimization/i.test(
      haystack,
    )
  ) {
    return "Advanced";
  }
  return "Intermediate";
}

function normalizeEntry(entry) {
  const categories = categoriesFor(entry);
  const path = String(entry.path ?? "");
  const title = String(entry.title ?? entry.slug ?? path);
  return {
    title,
    description:
      entry.description ??
      `Open the official Cookbook guide for ${title.toLowerCase()}.`,
    path,
    slug: entry.slug ?? null,
    date: entry.date ? String(entry.date).slice(0, 10) : null,
    archived: entry.archived === true,
    authors: Array.isArray(entry.authors) ? entry.authors.map(String) : [],
    tags: Array.isArray(entry.tags) ? entry.tags.map(String) : [],
    categories,
    primaryCategory: categories[0],
    difficulty: difficultyFor(entry, categories),
    languages: languagesFor(entry),
    sourceUrl: `https://github.com/openai/openai-cookbook/blob/main/${path}`,
  };
}

async function main() {
  const input = process.argv.includes("--stdin")
    ? await readStdin()
    : process.argv.includes("--file")
      ? await readFile(process.argv[process.argv.indexOf("--file") + 1], "utf8")
      : await fetch(SOURCE_URL).then((response) => {
          if (!response.ok) {
            throw new Error(`Cookbook registry fetch failed: ${response.status}`);
          }
          return response.text();
        });

  const parsed = parse(input);
  if (!Array.isArray(parsed)) throw new Error("Expected registry.yaml to be a list");

  const examples = parsed
    .map(normalizeEntry)
    .filter((entry) => entry.path)
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

  const categoryCounts = Object.fromEntries(
    CATEGORY_RULES.map(({ name }) => [
      name,
      examples.filter((entry) => entry.categories.includes(name)).length,
    ]),
  );

  const output = {
    source: "openai/openai-cookbook registry.yaml",
    sourceUrl: SOURCE_URL,
    generatedAt: new Date().toISOString(),
    total: examples.length,
    active: examples.filter((entry) => !entry.archived).length,
    archived: examples.filter((entry) => entry.archived).length,
    categoryCounts,
    examples,
  };

  await mkdir(new URL("../app", import.meta.url), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(output, null, 2)}\n`);
  console.log(
    `Synced ${output.total} Cookbook items (${output.active} active, ${output.archived} archived).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
