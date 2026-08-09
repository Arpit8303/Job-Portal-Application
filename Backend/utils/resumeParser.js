/**
 * resumeParser.js — Phase 2
 * Regex-based keyword extraction from resume text.
 * No external deps needed — pure JS.
 */

// ─── Master skills dictionary ────────────────────────────────────────────────
const SKILLS_DICTIONARY = {
  // Languages
  languages: [
    "javascript", "typescript", "python", "java", "c++", "c#", "c",
    "go", "golang", "rust", "ruby", "php", "swift", "kotlin", "scala",
    "r", "matlab", "perl", "bash", "shell", "powershell", "dart", "elixir",
  ],
  // Frontend
  frontend: [
    "react", "reactjs", "react.js", "next.js", "nextjs", "vue", "vuejs",
    "vue.js", "angular", "angularjs", "svelte", "html", "css", "sass",
    "scss", "less", "tailwind", "tailwindcss", "bootstrap", "material-ui",
    "mui", "chakra", "styled-components", "emotion", "webpack", "vite",
    "redux", "zustand", "recoil", "mobx", "graphql", "apollo",
  ],
  // Backend
  backend: [
    "node", "nodejs", "node.js", "express", "expressjs", "fastapi",
    "django", "flask", "spring", "laravel", "rails", "asp.net", "dotnet",
    "nestjs", "hapi", "koa", "restapi", "rest api", "grpc", "websocket",
    "socket.io",
  ],
  // Databases
  databases: [
    "mongodb", "mongoose", "mysql", "postgresql", "postgres", "sqlite",
    "redis", "cassandra", "dynamodb", "firebase", "supabase", "prisma",
    "sequelize", "typeorm", "elasticsearch",
  ],
  // Cloud & DevOps
  devops: [
    "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "k8s",
    "jenkins", "github actions", "gitlab ci", "terraform", "ansible",
    "nginx", "apache", "linux", "ubuntu", "ci/cd", "devops",
  ],
  // Mobile
  mobile: [
    "react native", "flutter", "android", "ios", "swift", "kotlin",
    "expo", "capacitor",
  ],
  // Data & ML
  data: [
    "machine learning", "deep learning", "tensorflow", "pytorch", "keras",
    "scikit-learn", "pandas", "numpy", "data science", "nlp",
    "computer vision", "big data", "spark", "hadoop", "tableau", "power bi",
  ],
  // Tools
  tools: [
    "git", "github", "gitlab", "bitbucket", "jira", "confluence",
    "figma", "photoshop", "postman", "swagger", "vs code", "vim",
    "linux", "agile", "scrum", "kanban",
  ],
};

// Flatten to a single Set for fast lookup
const ALL_SKILLS = new Set(
  Object.values(SKILLS_DICTIONARY).flat()
);

// ─── Experience extraction patterns ─────────────────────────────────────────
const EXPERIENCE_PATTERNS = [
  /(\d+)\+?\s*years?\s*of\s*experience/gi,
  /(\d+)\+?\s*years?\s*(?:in|of|working)/gi,
  /experience\s*of\s*(\d+)\+?\s*years?/gi,
  /(\d+)\+?\s*yrs?\s*(?:exp|experience)/gi,
];

// ─── Education extraction ────────────────────────────────────────────────────
const EDUCATION_KEYWORDS = [
  "b.tech", "btech", "b.e", "be", "m.tech", "mtech",
  "bachelor", "master", "mba", "phd", "bca", "mca",
  "b.sc", "bsc", "m.sc", "msc", "diploma",
];

// ─── Main extraction function ────────────────────────────────────────────────
/**
 * @param {string} resumeText  — raw text content of the resume
 * @returns {{ skills: string[], yearsOfExperience: number|null, education: string[] }}
 */
export const extractResumeData = (resumeText) => {
  if (!resumeText || typeof resumeText !== "string") {
    return { skills: [], yearsOfExperience: null, education: [] };
  }

  const text = resumeText.toLowerCase();

  // ── 1. Skills extraction ──────────────────────────────────────────────────
  const foundSkills = [];
  for (const skill of ALL_SKILLS) {
    // Use word-boundary-style matching — handle special chars in skill names
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<![a-z])${escaped}(?![a-z])`, "gi");
    if (pattern.test(text)) {
      foundSkills.push(skill);
    }
  }

  // ── 2. Years of experience extraction ────────────────────────────────────
  let yearsOfExperience = null;
  for (const pattern of EXPERIENCE_PATTERNS) {
    const matches = [...text.matchAll(pattern)];
    for (const m of matches) {
      const years = parseInt(m[1], 10);
      if (!isNaN(years) && (yearsOfExperience === null || years > yearsOfExperience)) {
        yearsOfExperience = years;
      }
    }
  }

  // ── 3. Education extraction ───────────────────────────────────────────────
  const foundEducation = [];
  for (const edu of EDUCATION_KEYWORDS) {
    if (text.includes(edu)) {
      foundEducation.push(edu.toUpperCase());
    }
  }

  return {
    skills: [...new Set(foundSkills)], // deduplicate
    yearsOfExperience,
    education: [...new Set(foundEducation)],
  };
};

/**
 * scoreJobMatch — given a user's skill set and a job document,
 * returns a numeric relevance score (higher = better match).
 * Used by the recommendation engine.
 *
 * @param {string[]} userSkills       — skills from user profile / resume
 * @param {object}   job              — jobsModel document
 * @returns {number}                  — match score (0–100)
 */
export const scoreJobMatch = (userSkills, job) => {
  if (!userSkills || userSkills.length === 0) return 0;

  const jobText = `${job.position} ${job.company} ${job.workLocation}`.toLowerCase();

  const userSkillsLower = userSkills.map((s) => s.toLowerCase());
  let score = 0;
  let hits = 0;

  for (const skill of userSkillsLower) {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`(?<![a-z])${escaped}(?![a-z])`, "gi");
    if (pattern.test(jobText)) {
      hits++;
    }
  }

  // score as a percentage of user skills matched
  if (userSkillsLower.length > 0) {
    score = Math.round((hits / userSkillsLower.length) * 100);
  }

  return score;
};

/**
 * extractSkillsFromText — lightweight wrapper for extracting only skills.
 * Useful when you just need the skills array from raw text.
 */
export const extractSkillsFromText = (text) => {
  return extractResumeData(text).skills;
};

export default { extractResumeData, scoreJobMatch, extractSkillsFromText };
