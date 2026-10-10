export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const TEMPLATES: TemplateItem[] = [
  {
    id: 'engineering-report',
    name: 'Engineering & Math Report',
    description: 'Publication report with formulas, circuit analysis, and booktabs tables',
    content: `---
title: "Technical Report: Analog Signal Processing & Slew Rate"
author: "Tasnimul Hasan"
date: "October 2026"
abstract: "This report analyzes small-signal frequency response and high-amplitude slew rate constraints in closed-loop operational amplifier circuits."
---

# 1. Frequency Response and Slew Rate

The full-power bandwidth of an amplifier is bounded by its internal compensation capacitor charging current:

$$SR = 2\\pi f V_m$$

### Maximum Undistorted Output Amplitude

**Given Parameters:**
- Signal frequency: $f = 105\\text{ kHz} = 105 \\times 10^3\\text{ Hz}$
- Measured slew rate: $SR = 0.96\\text{ V}/\\mu\\text{s} = 0.96 \\times 10^6\\text{ V/s}$

Condition for distortion-free output swing:

$$V_{m,\\max} = \\frac{SR}{2\\pi f} = \\frac{0.96 \\times 10^6}{2\\pi \\times (105 \\times 10^3)} \\approx 1.4551\\text{ V}$$

$$\\mathbf{V}_{\\mathbf{m},\\max} \\approx 1.455\\text{ V}$$

# 2. Performance Comparison

Table 1 summarizes measured laboratory results:

| Amplifier Stage | Slew Rate (V/μs) | Max Bandwidth (kHz) | Distortion (THD) |
| :--- | :--- | :--- | :--- |
| Precision Stage A | 0.96 | 105 | < 0.02% |
| High-Speed Stage B| 4.50 | 480 | < 0.05% |
| Buffer Stage C   | 12.80 | 1,200 | < 0.01% |

# 3. Mathematical Foundations

The general closed-loop transfer function is governed by:

$$H(s) = \\frac{A_0}{1 + s/\\omega_c}$$

For harmonic inputs where $\\omega = 2\\pi f$, the phase delay satisfies:

$$\\theta(\\omega) = -\\arctan\\left(\\frac{\\omega}{\\omega_c}\\right)$$

# 4. Summary

Careful matching of slew rate and feedback resistance guarantees distortion-free transmission across the entire operational passband.
`,
  },
  {
    id: 'academic-paper',
    name: 'Academic Paper',
    description: 'Formal academic paper structure with abstract, sections, and references',
    content: `---
title: "Distributed Consensus in Latency-Constrained Edge Networks"
author: "Alex Morgan & Dr. Elena Vance"
date: "Fall 2026"
abstract: "We evaluate Byzantine Fault Tolerant consensus algorithms deployed across heterogeneous edge nodes with asymmetric network latency. Empirical measurements demonstrate a 34% reduction in commit finality."
---

# 1. Background & Motivation

Edge computing environments violate classic assumptions of uniform round-trip times (RTT) across distributed cluster nodes. When edge devices communicate over volatile wireless backhauls:

$$\\Delta t_{\\text{network}} \\gg \\Delta t_{\\text{computation}}$$

Traditional Paxos and Raft protocols suffer from leader heartbeats timing out prematurely under bursty traffic conditions.

# 2. Mathematical Formalism

Let $N = 3f + 1$ denote the total number of validator nodes tolerating up to $f$ adversarial Byzantine failures. The round state progression satisfies:

$$\\mathcal{P}_{\\text{commit}} = \\prod_{i=1}^{2f+1} \\left( 1 - \\epsilon_i \\right)$$

where $\\epsilon_i$ represents the individual message loss probability of node $i$.

# 3. Experimental Evaluation

| Topology | Node Count | Mean Latency (ms) | Throughput (tx/s) |
| :--- | :--- | :--- | :--- |
| Star Network | 16 | 42.1 | 1,840 |
| Mesh Grid | 32 | 68.4 | 2,420 |
| Hierarchical Cluster | 64 | 31.8 | 4,150 |

> "Decentralized state verification is bounded by the slowest quorum validator." — Dr. Elena Vance

# 4. Summary

Our protocol maintains safety and liveness invariants while mitigating tail-latency spikes through dynamic voting quorum thresholds.
`,
  },
  {
    id: 'tech-spec',
    name: 'Technical Specification',
    description: 'Architecture specification with endpoints and system invariants',
    content: `---
title: "Document Ingestion Pipeline Specification"
author: "Platform Engineering Core"
date: "October 2026"
---

# Architecture Overview

The ingestion service receives Markdown payloads, extracts metadata, formats vector typography, and compiles high-resolution PDF outputs.

### Endpoints

**POST /api/v1/compile**

Request Payload:
\`\`\`json
{
  "source": "# Document\\n\\nContent here",
  "margin": "1.0in",
  "font": "Arev Sans"
}
\`\`\`

### System Invariants
1. Maximum document compilation timeout: **15 seconds**
2. Standard uniform margin: **1.0 inch**
3. Default typography: **Arev Sans**
`,
  },
  {
    id: 'resume',
    name: 'Professional Resume',
    description: 'Clean single-page CV layout with standard document flow',
    content: `---
title: "TASNIMUL HASAN"
author: "Full-Stack Engineer & Systems Architect"
date: "San Francisco, CA · notify.tasnimul@gmail.com"
---

# Professional Summary

Software Engineer with 8+ years experience architecting distributed cloud systems, modern web runtimes, and document transformation pipelines.

# Core Skills
- **Languages**: TypeScript, Python, Rust, Go, SQL
- **Frameworks**: React, Node.js, Express, Next.js, Vite, Tailwind CSS
- **Document Tooling**: LaTeX, Pandoc, KaTeX, Markdown

# Experience

### Lead Systems Architect · HyperScale Cloud (2023 – Present)
- Engineered document transformation engine processing 5M+ monthly PDF generations.
- Implemented client-side parser compiling 50,000 lines of technical markdown in under 100ms.
- Built automated continuous delivery pipeline achieving 99.98% production reliability.

### Senior Software Engineer · DataStream Labs (2020 – 2023)
- Led frontend architecture team delivering high-performance technical dashboard.
- Reduced render latency by 45% using optimized canvas virtualization.

# Education
**B.S. in Computer Science** — University of Technology
*Summa Cum Laude, Dean's Honors List*
`,
  },
];
