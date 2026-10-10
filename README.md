# MD to PDF Converter | Convert MD to PDF Online Free

[![Deploy to GitHub Pages](https://github.com/actions/deploy-pages/actions/workflows/deploy.yml/badge.svg)](https://github.com/actions/deploy-pages)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?logo=vite)](https://vitejs.dev/)

**md to pdf converter** is a lightning-fast, privacy-first open-source web application designed to **convert MD to PDF** online in seconds. It combines real-time Markdown editing, KaTeX mathematical typesetting, Pandoc LaTeX academic typography, customizable margins, and high-resolution PDF rendering—completely in the browser with zero server data storage.

Whether you need to convert technical reports, scientific papers, research summaries, resumes, or lecture notes, this **MD to PDF converter** produces clean, publication-ready PDFs without requiring a local TeX Live or Pandoc installation.

---

## ⚡ Why Use This MD to PDF Converter?

- **100% Free & Private**: No account registration, no paywalls, no tracking. Your Markdown text and PDF files never leave your device.
- **Convert MD to PDF Instantly**: Side-by-side split screen allows live interactive previews as you type or paste Markdown.
- **LaTeX Math Formula Support**: Full KaTeX equation rendering for inline math ($E = mc^2$) and display equations ($$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$).
- **Academic Typography**: Features LaTeX-grade fonts (Arev Sans, EB Garamond, Tinos, Latin Modern Roman, JetBrains Mono) with standard 1-inch margins and 11pt sizing.
- **Pandoc Flags Mirror**: Interactive configuration bar replicates Pandoc flags (`pdflatex`, `xelatex`, `typst`, `-V geometry:margin=1in`, `-V fontfamily=arev`).
- **One-Click Deployment**: Pre-configured GitHub Actions workflow (`deploy.yml`) allows hosting on GitHub Pages in under two minutes.

---

## 🔍 How to Convert MD to PDF in 3 Easy Steps

1. **Enter or Upload Markdown**: Paste your Markdown text directly into the editor pane, or click the **Import** button to load any `.md` file from your computer.
2. **Preview & Adjust Layout**: Customize paper margins, typography, section numbering, and table of contents in real time.
3. **Download PDF**: Click **Download PDF** to generate an immediate vector PDF download stream, or press `Ctrl + P` / `Cmd + P` for native print preview.

---

## 🛠️ Markdown & LaTeX Features Supported

| Markdown Feature | Example Syntax | Output Style |
| :--- | :--- | :--- |
| **Frontmatter** | `title: "My Report"`<br>`author: "Author Name"` | Formatted title block, author byline, date & abstract |
| **Inline Math** | `$SR = 2\pi f V_m$` | Standard KaTeX inline mathematical symbols |
| **Display Equations**| `$$V_{m,\max} = \frac{SR}{2\pi f}$$` | Centered, scrollable LaTeX equation blocks |
| **Tables** | `\| Stage \| Slew Rate \| Bandwidth \|` | Pandoc Booktabs academic table styling |
| **Code Blocks** | ` ```python ... ``` ` | Monospace syntax container with custom background |
| **Section Breaks** | `\newpage` | Clean page break during multi-page PDF compilation |

---

## 🚀 How to Host on GitHub Pages (From Downloaded Zip)

### Step 1: Extract the Downloaded Zip
Unzip the downloaded project archive into a folder on your local machine (e.g., `md-to-pdf-converter`).

### Step 2: Create a New GitHub Repository
1. Navigate to [github.com/new](https://github.com/new).
2. Choose a repository name (e.g., `md-to-pdf-converter`).
3. Set the repository visibility to **Public** (required for free GitHub Pages hosting).
4. Leave **"Add a README file" unchecked** (this repository already provides it).
5. Click **Create repository**.

### Step 3: Initialize Git & Push Your Code
Open your terminal (macOS/Linux) or Command Prompt / PowerShell / Git Bash (Windows) in your project directory:

```bash
# 1. Initialize local git repository
git init

# 2. Stage all files
git add .

# 3. Create your first commit
git commit -m "Initial release: md to pdf converter"

# 4. Set branch to main
git branch -M main

# 5. Link local repository to GitHub (replace with your username and repo name)
git remote add origin https://github.com/<YOUR-GITHUB-USERNAME>/<YOUR-REPO-NAME>.git

# 6. Push code to GitHub
git push -u origin main
```

### Step 4: Turn on GitHub Pages Deployment
1. On GitHub, navigate to your repository's **Settings** tab.
2. In the left sidebar, click **Pages** (under the "Code and automation" section).
3. Under **Build and deployment** → **Source**, select **GitHub Actions** (instead of "Deploy from a branch").
4. GitHub Actions will trigger `.github/workflows/deploy.yml` automatically.
5. In 60–90 seconds, your live **MD to PDF converter** will be online at:
   ```
   https://<YOUR-GITHUB-USERNAME>.github.io/<YOUR-REPO-NAME>/
   ```

---

## 🔄 How to Push Future Updates to Live

When you make changes, add new templates, or tweak styles, push the updates live in 3 quick commands:

```bash
# 1. Stage the modified files
git add .

# 2. Commit your updates
git commit -m "Update features and improve performance"

# 3. Push to GitHub
git push origin main
```

GitHub Actions will automatically run the build and redeploy your live website within moments!

---

## 💻 Local Development

To run the application locally on your machine:

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev

# 3. Build for production
npm run build
```

---

## ❓ Frequently Asked Questions (FAQ)

### What is an MD to PDF converter?
An **MD to PDF converter** is a software tool that takes Markdown (`.md`) formatted text and transforms it into a standardized, printable Portable Document Format (`.pdf`) file.

### Is this MD to PDF converter free?
Yes. This application is 100% open-source and free to use with no usage limits or registration requirements.

### Are my documents secure when converting MD to PDF?
Yes. Unlike cloud-based converters, all Markdown rendering and PDF rasterization happen client-side within your browser engine. No document text or attachments are sent to any external servers.

### Can I convert math formulas and tables with this tool?
Yes. It includes built-in KaTeX support for both inline and display math equations, alongside standard GitHub Flavored Markdown (GFM) tables and Pandoc booktabs formatting.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Contributions, forks, and feature requests are welcome!


