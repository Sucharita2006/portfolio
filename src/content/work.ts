export type WorkKind = "role" | "project";

export type Section = { heading: string; body: string[] };

export type WorkItem = {
  slug: string;
  title: string;
  subtitle: string;
  kind: WorkKind;
  org?: string;
  period: string;
  /** The single hardest number in this piece of work. Used as the index marker. */
  metric: { value: string; label: string };
  summary: string;
  stack: string[];
  links: { label: string; href: string }[];
  sections: Section[];
};

export const work: WorkItem[] = [
  {
    slug: "open-paws",
    title: "Legislative monitoring for animal advocacy",
    subtitle: "AI Engineer Intern, Open Paws",
    kind: "role",
    org: "Open Paws",
    period: "May – Jul 2026",
    metric: { value: "100%", label: "test coverage on delivery" },
    summary:
      "Ten production features across a 46-endpoint FastAPI backend and a Next.js interface, plus the test harness that made shipping them safe.",
    stack: [
      "FastAPI",
      "Python",
      "Next.js",
      "PostgreSQL",
      "pgvector",
      "LangGraph",
      "LlamaIndex",
      "OpenAI API",
      "GCP",
      "pytest",
      "JWT",
    ],
    links: [],
    sections: [
      {
        heading: "The product",
        body: [
          "Open Paws builds tooling for animal advocacy organisations. The product I worked on tracks legislation across US jurisdictions and tells advocates which bills are worth their attention this week — a research job that was previously done by hand, slowly, by people whose time is better spent elsewhere.",
          "I joined a distributed team working in Agile sprints, and the client was non-technical. A recurring part of the job was translating a requirement like 'we want to know what matters' into a scoring rule someone could argue with.",
        ],
      },
      {
        heading: "What I built",
        body: [
          "Ten-plus production features across a 46-endpoint FastAPI backend and the Next.js interface on top of it, deployed on GCP. The pieces I owned end to end were pgvector semantic search over bill text, a dual relevance-scoring model, personalised email digests, and JWT-authenticated access to all of it.",
          "I also shipped the data-ingestion service — a Python job syncing 300+ legislative bills a day from the congress.gov API, with historical backfill for the archive and a PDF-fallback parser for the days the API returns something other than what it promises.",
          "On the AI side, I designed concurrent multi-agent workflows in LangGraph and LlamaIndex, combining RAG over the bill corpus with tool calling. Measured against the manual process it replaced, it cut legislative research effort by about 35%.",
        ],
      },
      {
        heading: "The part that was actually hard",
        body: [
          "Upstream data was hostile. congress.gov would return bills with missing fields, PDFs where HTML was expected, and occasionally nothing at all under load. An ingestion job that assumes a well-formed response fails silently and leaves you with a database that looks fine and is quietly three days stale.",
          "The fix was to stop treating ingestion as a single operation. Each bill moves through parse, validate, and persist as separate stages with their own failure modes, so a malformed PDF degrades to a fallback parser rather than killing the run, and rate-limit responses back off and retry instead of dropping records. Failures are recorded per-bill, so a partial run is visible rather than invisible.",
          "The other hard problem was inherited: an email delivery and rendering service with no tests that everyone was afraid to touch. I wrote a 55-test pytest harness across six suites and took those two services to full coverage. That unblocked the feature work more than any single feature did.",
        ],
      },
      {
        heading: "Outcome",
        body: [
          "35+ tracked bugs resolved across SQL migrations, timezone handling, and the caching layer. 100% coverage on email delivery and rendering. Roughly 35% less manual research effort for the advocacy team, and an ingestion pipeline that stayed available through upstream data that previously would have broken it.",
        ],
      },
    ],
  },
  {
    slug: "legitrack-ai",
    title: "LegiTrack AI",
    subtitle: "Legislation intelligence across 50 state legislatures",
    kind: "project",
    period: "2026",
    metric: { value: "60–80%", label: "reduction in LLM API cost" },
    summary:
      "A full-stack pipeline that ingests up to 1,000 bills per run, classifies their stance with an LLM, and scores urgency deterministically — built solo.",
    stack: [
      "FastAPI",
      "SQLAlchemy",
      "React",
      "TypeScript",
      "NLTK",
      "GraphQL",
      "SQLite",
      "pytest",
    ],
    links: [
      { label: "Live site", href: "https://legi-track-ai.vercel.app" },
      { label: "Source", href: "https://github.com/Sucharita2006/LegiTrack-AI" },
    ],
    sections: [
      {
        heading: "The idea",
        body: [
          "Animal-welfare legislation moves in fifty state legislatures simultaneously and almost nobody has the capacity to watch all of them. LegiTrack ingests bills from every US state, works out whether each one helps or hurts, and ranks what deserves attention first.",
          "I built the whole thing independently — ingestion, classification, scoring, API, and interface.",
        ],
      },
      {
        heading: "Architecture",
        body: [
          "Async GraphQL ingestion pulls up to 1,000 bills per run. Each bill goes through an LLM stance classifier, then through a deterministic 100-point urgency-scoring algorithm that weighs stage, chamber, scope, and momentum. Normalised records land in a SQLAlchemy store behind filtered, paginated REST endpoints, and a React/TypeScript frontend reads from those.",
          "The split between the two scoring layers is deliberate. Stance is a judgement call, so an LLM makes it. Urgency is arithmetic, so a function makes it — and can be explained to a user who disagrees with the ranking.",
        ],
      },
      {
        heading: "The part that was actually hard",
        body: [
          "Running every ingested bill through a model is straightforward and financially ruinous. At 1,000 bills a run the API bill dominated everything else about the project, and most of those calls were spent confirming that a highway appropriations bill has nothing to do with animals.",
          "I put an NLTK keyword gatekeeper in front of the classifier. Bills that show no lexical signal never reach the model. Tuning it was the real work: too aggressive and you silently drop relevant legislation, which is a much worse failure than an unnecessary API call. I set the threshold by measuring recall against a manually labelled slice rather than by feel, and accepted a higher false-positive rate on purpose.",
          "That single filter, combined with async ingestion, cut LLM API costs by 60–80%.",
        ],
      },
      {
        heading: "Validation",
        body: [
          "Classification accuracy came in at 93.75%, measured with pytest unit tests over scoring and ingestion plus manual audits across the 50-state dataset. The scoring algorithm is deterministic and therefore properly unit-testable, which was much of the reason for keeping it out of the model.",
        ],
      },
    ],
  },
  {
    slug: "payflow",
    title: "PayFlow",
    subtitle: "Multi-gateway payment orchestrator",
    kind: "project",
    period: "2026",
    metric: { value: "3-level", label: "gateway fallback chain" },
    summary:
      "Payment orchestration across Stripe, Razorpay, and PayU with priority-based failover, a Redis config cache, and an operations dashboard.",
    stack: [
      "System design",
      "React",
      "TypeScript",
      "Tailwind CSS",
      "Redis",
      "Webhooks",
    ],
    links: [{ label: "Source", href: "https://github.com/Sucharita2006/PayFlow" }],
    sections: [
      {
        heading: "The problem",
        body: [
          "A single payment gateway is a single point of failure, and gateways differ in both reliability and fee structure. If one is down or declining a card the other would have accepted, that transaction is simply lost.",
          "PayFlow sits in front of Stripe, Razorpay, and PayU and routes each transaction according to a priority chain — maximising success rate and availability while keeping processing fees down.",
        ],
      },
      {
        heading: "Design",
        body: [
          "Routing rules and gateway priority live in a Redis config cache so behaviour can change without a redeploy. A failed attempt falls through three levels of the chain before the transaction is given up on, and each attempt is recorded so a failure is attributable to a specific gateway rather than to 'payments'.",
          "Gateway callbacks arrive as webhooks and are handled as an event stream rather than inline with the request, which keeps checkout latency independent of how slow a given provider decides to be.",
        ],
      },
      {
        heading: "The part that was actually hard",
        body: [
          "Falling back is easy. Deciding when to fall back is the part that took the time. A gateway that times out and a bank that declines a card arrive at the call site looking much the same — an attempt that did not succeed — and they mean opposite things. The first is worth retrying elsewhere. The second is a decision that has already been made correctly, and retrying it either repeats the decline on another provider or puts a second authorisation against a card that was only ever meant to be charged once. A chain that advances on every failure is not resilience; it is a way to turn one declined payment into three.",
          "So the chain advances only on failures attributable to the gateway itself, which is why every attempt is recorded against a named provider rather than into a general bucket called 'payments'. Three levels is a ceiling rather than a target — each extra attempt adds latency to a checkout someone is watching, and a customer who waits eight seconds to be told no has had a worse time than one who waits two.",
          "Gateway priority lives in the Redis config cache for the same reason the chain is bounded: the right order changes with reliability and with fee structure, and discovering mid-incident that reordering it needs a deploy is discovering it too late.",
        ],
      },
      {
        heading: "Operations dashboard",
        body: [
          "I built the operator-facing side in React, TypeScript, and Tailwind: eight-plus real-time metrics across five visualisation components covering traffic, success and failure rates, latency, and per-gateway health, plus transaction search and filtering by gateway and status.",
          "The design constraint was that someone should be able to answer 'is it us or is it Razorpay' in under ten seconds, which is why gateway health is the first thing on the page rather than aggregate volume.",
        ],
      },
    ],
  },
  {
    slug: "verde",
    title: "VERDE",
    subtitle: "Sustainability modelling for café menus",
    kind: "project",
    org: "AARC — Code for Compassion",
    period: "Feb – Mar 2026",
    metric: { value: "150+", label: "menu combinations modelled" },
    summary:
      "Built during a selective engineering-for-nonprofits programme: a platform letting cafés simulate the impact of plant-based menu alternatives.",
    stack: ["Node.js", "TypeScript", "Next.js", "React", "Tailwind CSS", "Vercel"],
    links: [],
    sections: [
      {
        heading: "Context",
        body: [
          "AARC's Code for Compassion selects a small group of developers to build software for advocacy organisations. VERDE was my project: cafés know that swapping menu items changes their footprint, but not by how much, and abstract sustainability advice doesn't survive contact with a menu planning meeting.",
        ],
      },
      {
        heading: "What it does",
        body: [
          "Node.js REST APIs process 150+ menu combinations into per-menu impact comparisons, so an owner can see what a specific substitution does rather than reading a general claim about plant-based food.",
          "The frontend is TypeScript, Next.js, React, and Tailwind, deployed on Vercel serverless with Git-based CI/CD for atomic zero-downtime releases — which mattered because the client was demoing the tool while I was still shipping to it.",
        ],
      },
      {
        heading: "The part that was actually hard",
        body: [
          "A single sustainability score is easy to compute and almost useless to act on. An owner deciding whether to change one item on a menu does not need their footprint; they need to know what that one change does to it. That turns the problem from a calculation into a comparison, and comparisons only hold if every combination is measured on the same basis — which is what makes 150+ of them a modelling requirement rather than a lookup table.",
          "The other constraint was that the client demonstrated the tool while I was still shipping to it. That is why the zero-downtime release setup belongs in the section above rather than filed under infrastructure: it was not a nice property of the pipeline, it was the condition under which any deploy could happen at all. A failed release during a demo is not a rollback, it is a client watching the product break.",
        ],
      },
    ],
  },
];

export const getWork = (slug: string) => work.find((w) => w.slug === slug);
