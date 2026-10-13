export interface TemplateItem {
  id: string;
  name: string;
  description: string;
  content: string;
}

export const TEMPLATES: TemplateItem[] = [
  {
    id: 'biostatistics-fisher',
    name: 'Fisher\'s Exact Test & Combinations',
    description: 'Statistical analysis with 2x2 contingency tables, combination formulas, and extreme configurations',
    content: `---
title: "Fisher's Exact Test & Statistical Hypothesis Analysis"
author: "Tasnimul Hasan"
date: "October 2026"
abstract: "This document provides a complete step-by-step evaluation of 2x2 contingency tables, extreme configurations, and hyper-geometric probability computation via Fisher-Irwin combinations."
---

# PART 1: How to Find Extreme Configurations

### 1. The One-Degree-of-Freedom Rule
In any $2 \\times 2$ table, the row totals ($R_1, R_2$), column totals ($C_1, C_2$), and grand total ($N$) are strictly fixed. Because marginal totals cannot change, choosing a value for any single cell automatically forces the values of all other three cells:

- If top-left cell $= a$:
  - Top-right cell: $b = R_1 - a$
  - Bottom-left cell: $c = C_1 - a$
  - Bottom-right cell: $d = R_2 - c$

### 2. How to Determine the Number of Possible Configurations
Since no cell count can be negative ($a, b, c, d \\ge 0$), the value of $a$ is constrained by:

$$\\max(0, R_1 + C_1 - N) \\le a \\le \\min(R_1, C_1)$$

For this problem:
- $R_1 = 7$, $R_2 = 9$, $C_1 = 5$, $C_2 = 11$, $N = 16$
- Minimum possible value for $a$: $\\max(0, 7 + 5 - 16) = \\max(0, -4) = 0$
- Maximum possible value for $a$: $\\min(7, 5) = 5$

Thus, $a$ can only take values: $0, 1, 2, 3, 4, 5$ (6 possible tables total).

### 3. How to Identify the "More Extreme" Configurations
- **The Exam / Classroom Rule**: Look at the top-left cell $a$. If $a$ is closer to $0$, you **decrease a step-by-step toward $0$** until you reach the minimum boundary.
  - Observed value: $a = 2$
  - Step 1 toward boundary: $a = 1$ (**Extreme Configuration 1**)
  - Step 2 toward boundary: $a = 0$ (**Extreme Configuration 2**)
  - Total extreme configurations available: 2 (besides the observed one).
- **How to update the rest of the table**: Whenever you subtract 1 from $a$:
  - **Add 1 to $b$** (to keep row total $R_1 = 7$ constant).
  - **Add 1 to $c$** (to keep column total $C_1 = 5$ constant).
  - **Subtract 1 from $d$** (to keep row total $R_2 = 9$ and column total $C_2 = 11$ constant).

---

# PART 2: Full Step-by-Step Solution

### 1. Hypotheses
- **Null Hypothesis ($H_0$)**: There is no association between eating sea-fish and outbreak of cholera (eating sea-fish is not a risk factor).
- **Alternative Hypothesis ($H_1$)**: There is an association between eating sea-fish and outbreak of cholera (eating sea-fish is a risk factor).
- **Significance Level**: $\\alpha = 0.05$

### 2. The Fisher-Irwin Probability Formula
For any $2 \\times 2$ configuration with fixed totals:

$$P = \\frac{(a+b)!(c+d)!(a+c)!(b+d)!}{N!\\,a!\\,b!\\,c!\\,d!} = \\frac{7! \\times 9! \\times 5! \\times 11!}{16! \\times a!\\,b!\\,c!\\,d!}$$

Using combinations $\\frac{\\binom{R_1}{a}\\binom{R_2}{C_1 - a}}{\\binom{N}{C_1}}$, the denominator factor evaluates to:

$$\\binom{16}{5} = \\frac{16 \\times 15 \\times 14 \\times 13 \\times 12}{5 \\times 4 \\times 3 \\times 2 \\times 1} = 4368$$

### 3. Computing Probabilities for Each Configuration

#### Configuration 0: Observed Table ($a = 2$)

| Category | Got Cholera | No Cholera | Total |
| :--- | :---: | :---: | :---: |
| Ate Sea-Fish | 2 | 5 | 7 |
| Didn't Eat | 3 | 6 | 9 |
| Total | 5 | 11 | 16 |

$$P(\\text{observed}) = \\frac{\\binom{7}{2}\\binom{9}{3}}{\\binom{16}{5}} = \\frac{21 \\times 84}{4368} = \\frac{1764}{4368} \\approx 0.4038$$

#### Configuration 1: First Extreme Table ($a = 1$)

| Category | Got Cholera | No Cholera | Total |
| :--- | :---: | :---: | :---: |
| Ate Sea-Fish | 1 | 6 | 7 |
| Didn't Eat | 4 | 5 | 9 |
| Total | 5 | 11 | 16 |

$$P(\\text{i}) = \\frac{\\binom{7}{1}\\binom{9}{4}}{\\binom{16}{5}} = \\frac{7 \\times 126}{4368} = \\frac{882}{4368} \\approx 0.2019$$

#### Configuration 2: Second Extreme Table ($a = 0$)

| Category | Got Cholera | No Cholera | Total |
| :--- | :---: | :---: | :---: |
| Ate Sea-Fish | 0 | 7 | 7 |
| Didn't Eat | 5 | 4 | 9 |
| Total | 5 | 11 | 16 |

$$P(\\text{ii}) = \\frac{\\binom{7}{0}\\binom{9}{5}}{\\binom{16}{5}} = \\frac{1 \\times 126}{4368} = \\frac{126}{4368} \\approx 0.0288$$

### 4. Test Statistic ($P_0$)
Sum the probabilities of the observed and all more extreme configurations:

$$P_0 = P(\\text{observed}) + P(\\text{i}) + P(\\text{ii})$$

$$P_0 = 0.4038 + 0.2019 + 0.0288 = 0.6345$$

$$\\mathbf{P_0 = 0.6345}$$

### 5. Comparison and Decision
- **Decision Criterion**:
  - If $P_0 < \\alpha \\implies \\text{Reject } H_0$
  - If $P_0 \\ge \\alpha \\implies \\text{Fail to reject } H_0$
- **Evaluation**:

$$P_0 = 0.6345 > 0.05$$

- **Decision**: Fail to reject $H_0$ at the 5% level of significance.

---

### Conclusion
There is no statistically significant association between eating sea-fish and the outbreak of cholera. Eating sea-fish cannot be concluded to be a risk factor.
`,
  },
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
