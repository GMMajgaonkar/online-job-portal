import stringSimilarity from "string-similarity";

/** Canonical skill synonyms for semantic-style matching */
const SYNONYM_GROUPS = [
  ["react", "reactjs", "react.js", "react developer", "frontend engineer"],
  ["node", "nodejs", "node.js", "node developer"],
  ["rest api", "restful api", "restful", "rest"],
  ["javascript", "js", "ecmascript"],
  ["typescript", "ts"],
  ["mongodb", "mongo"],
  ["express", "expressjs", "express.js"],
  ["java", "core java"],
  ["python", "django", "flask"],
  ["aws", "amazon web services"],
  ["docker", "containerization"],
  ["kubernetes", "k8s"],
  ["sql", "mysql", "postgresql", "postgres"],
  ["machine learning", "ml", "deep learning"],
  ["full stack", "fullstack", "mern", "mean"],
];

const TECH_KEYWORDS = [
  "javascript", "typescript", "python", "java", "c++", "c#", "go", "rust",
  "react", "angular", "vue", "nextjs", "html", "css", "tailwind",
  "node", "express", "django", "flask", "spring", "spring boot",
  "mongodb", "mysql", "postgresql", "redis", "sql",
  "aws", "azure", "gcp", "docker", "kubernetes", "ci/cd", "git",
  "rest", "graphql", "api", "microservices", "agile", "scrum",
  "machine learning", "data science", "tensorflow", "pandas",
  "communication", "leadership", "problem solving",
];

export function normalizeToken(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^\w\s+#.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(text) {
  const n = normalizeToken(text);
  return n ? n.split(" ") : [];
}

function canonicalSkill(skill) {
  const s = normalizeToken(skill);
  for (const group of SYNONYM_GROUPS) {
    if (group.some((g) => s.includes(g) || g.includes(s))) {
      return group[0];
    }
  }
  return s;
}

/** Exact, partial, or synonym match */
export function skillsMatch(resumeSkill, jobSkill) {
  const a = canonicalSkill(resumeSkill);
  const b = canonicalSkill(jobSkill);
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.includes(b) || b.includes(a)) return true;
  for (const group of SYNONYM_GROUPS) {
    const inA = group.some((g) => a.includes(g) || g.includes(a));
    const inB = group.some((g) => b.includes(g) || g.includes(b));
    if (inA && inB) return true;
  }
  return stringSimilarity.compareTwoStrings(a, b) >= 0.72;
}

export function extractSkillsFromText(text, profileSkills = []) {
  const found = new Set();
  const normalized = normalizeToken(text);

  for (const kw of TECH_KEYWORDS) {
    if (normalized.includes(kw)) {
      found.add(canonicalSkill(kw));
    }
  }

  for (const s of profileSkills) {
    if (s) found.add(canonicalSkill(s));
  }

  const multiWord = [
    "rest api", "restful api", "machine learning", "spring boot",
    "data structures", "object oriented",
  ];
  for (const phrase of multiWord) {
    if (normalized.includes(phrase)) found.add(canonicalSkill(phrase));
  }

  return [...found];
}

export function compareSkillLists(resumeSkills, jobSkills) {
  const matched = [];
  const missing = [];

  for (const js of jobSkills) {
    const hit = resumeSkills.some((rs) => skillsMatch(rs, js));
    if (hit) matched.push(js);
    else missing.push(js);
  }

  const strong = resumeSkills.filter(
    (rs) => !jobSkills.some((js) => skillsMatch(rs, js)) && rs.length > 1
  );

  return { matched, missing, strong: strong.slice(0, 8) };
}

export function booleanSearchMatch(query, resumeText, skills = []) {
  if (!query?.trim()) return true;
  const parts = query
    .split(/\s+AND\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);
  const haystack = `${normalizeToken(resumeText)} ${skills.map(normalizeToken).join(" ")}`;

  return parts.every((term) => {
    const t = normalizeToken(term);
    if (haystack.includes(t)) return true;
    return skills.some((s) => skillsMatch(s, t));
  });
}

export { TECH_KEYWORDS };
