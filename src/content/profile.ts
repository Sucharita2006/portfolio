export const profile = {
  name: "Sucharita Chattopadhyay",
  shortName: "Sucharita",
  role: "Software engineer",
  location: "Bankura, West Bengal, India",
  email: "sucharita.chatterjee100@gmail.com",
  phone: "+91 88492 88735",
  github: "https://github.com/Sucharita2006",
  githubUser: "Sucharita2006",
  linkedin:
    "https://linkedin.com/in/sucharita-chattopadhyay-500b572b4",
  resumeHref: "/resume.pdf",

  // The hero statement. Kept to one claim, in your own register — no "passionate
  // developer", no adjectives that a hiring manager has read four hundred times.
  heroLead: "I build backends that hold up",
  heroTrail: "when the data misbehaves.",

  heroBody:
    "Computer science at VIT-AP, and an AI engineer intern at Open Paws, where I spent a summer on the unglamorous half of shipping: test harnesses, rate-limit handling, malformed upstream data, and the migrations nobody wants to write. I care about systems that stay correct on a bad day.",

  // Facts the reader can check. Ordered by how much they'd move a hiring decision.
  facts: [
    { label: "CGPA", value: "9.79", note: "branch rank holder" },
    { label: "DSA solved", value: "200+", note: "Java, LeetCode + GFG" },
    { label: "Batch", value: "2028", note: "B.Tech CSE, VIT-AP" },
  ],

  aboutParagraphs: [
    "I'm a computer science undergraduate at VIT-AP University, graduating in 2028. Most of what I know I learned by shipping things that broke and then figuring out why.",
    "The summer of 2026 I spent as an AI engineer intern at Open Paws in Bengaluru, working on a legislative-monitoring product for an animal advocacy organisation. The interesting part wasn't the LLM work — it was everything around it. Congress.gov returns malformed PDFs. Timezone logic quietly rots. An email service with no tests is a liability the moment someone else touches it. I ended up writing a 55-test pytest harness across six suites and taking the delivery and rendering services to full coverage, because that was the thing actually blocking releases.",
    "Before that I was selected for AARC's Code for Compassion programme, where I built VERDE — a tool that lets cafés model the sustainability impact of swapping menu items. Outside of coursework I work through data structures and algorithms in Java, mostly arrays, hashing, two pointers, and sliding window, and I've solved over 200 problems across LeetCode and GeeksforGeeks.",
    "I'm looking for software engineering internships and new-grad roles, with a preference for backend and infrastructure work. If you're hiring, or you just want to argue about retry semantics, my inbox is open.",
  ],

  // Grouped so a reader scanning for a keyword finds it, without a skill-bar
  // chart claiming I'm 87% good at React.
  //
  // These groups mirror the résumé so the two documents agree when a reader has
  // both open. Eight rather than the six the build spec assumed — "CS
  // foundations" and "Security" exist on the résumé and had no home here, and
  // they are the groups a new-grad screen actually greps for.
  skills: [
    {
      group: "Languages",
      items: ["Java", "Python", "TypeScript", "JavaScript", "SQL", "C/C++"],
    },
    {
      group: "CS foundations",
      items: [
        "Data structures & algorithms",
        "Object-oriented programming",
        "DBMS",
        "Operating systems",
        "Computer networks (TCP/IP)",
        "SDLC",
        "Agile / Scrum",
      ],
    },
    {
      group: "Backend & API design",
      items: [
        "FastAPI",
        "REST API design",
        "HTTP request lifecycle",
        "Webhooks & event-driven processing",
        "PostgreSQL",
        "pgvector semantic search",
        "SQLAlchemy",
        "Redis",
        "Schema design & migrations",
        "Caching",
      ],
    },
    {
      group: "Reliability & testing",
      items: [
        "pytest",
        "Unit & integration testing",
        "Test harness design",
        "Coverage analysis",
        "Code reviews",
        "Rate-limit & failure handling",
        "Fault-tolerant pipelines",
        "Root-cause analysis",
        "Systematic debugging",
        "Monitoring & observability",
        "Performance optimisation",
      ],
    },
    {
      group: "Security",
      items: [
        "Secure coding practices",
        "JWT authentication & authorisation",
        "HTTPS / TLS",
        "Input validation (Pydantic)",
        "Secrets management",
      ],
    },
    {
      group: "Applied AI",
      items: [
        "RAG",
        "LangGraph",
        "LlamaIndex",
        "Multi-agent orchestration",
        "Tool calling",
        "OpenAI API",
        "Gemini / Vertex AI",
      ],
    },
    {
      group: "Infrastructure & delivery",
      items: [
        "Docker",
        "Linux",
        "Google Cloud Platform",
        "Vercel",
        "Git",
        "CI/CD",
        "High-availability & zero-downtime deploys",
      ],
    },
    {
      group: "Frontend",
      items: ["React", "Next.js", "Tailwind CSS"],
    },
  ],

  education: [
    {
      school: "VIT-AP University",
      detail: "B.Tech, Computer Science Engineering",
      meta: "Amaravati · Aug 2024 – Jul 2028 · CGPA 9.79 · CSE branch rank holder",
    },
    {
      school: "D.A.V. Public School",
      detail: "Higher Secondary, PCMB — 92.2%",
      meta: "Bankura, West Bengal",
    },
    {
      school: "Delhi Public School",
      detail: "CBSE Class X — 98.8%",
      meta: "Rourkela, Odisha · District topper, 100/100 in five subjects",
    },
  ],

  awards: [
    {
      title: "District topper, Class X board examinations",
      meta: "Sundergarh district · 100/100 in five subjects",
    },
    {
      title: "Post-a-thon hackathon finalist",
      meta: "Led a team to the top 5 of 90+ with a sustainability web platform",
    },
    {
      title: "Selected participant, AARC Code for Compassion",
      meta: "Competitive engineering-for-nonprofits programme",
    },
  ],
} as const;

export type Profile = typeof profile;
