# Environment & External Dependencies Setup Guide

**Effective Date:** 2026-11-10  
**Target Environments:** Windows 10/11 (Local Development) & Linux (Ubuntu/Debian CI)  
**Strict Policy:** Never install system-level binaries silently. System software must be explicitly provisioned by the operator following documented runbooks.

---

## 1. Local OCR: Tesseract with Bengali (`ben`) & English (`eng`) Data

CarbonOS processes utility bills locally using `pdfplumber` (for searchable digital PDFs) and `pytesseract` with Tesseract OCR (for scanned invoices). Bengali (`ben`) language models are strictly required to extract utility bills from Bangladesh power and gas distribution entities (DESCO, DPDC, TITAS, BREB, NESCO, WZPDCL).

### Windows Installation Guide
1. **Download the Tesseract Windows Installer:**
   - Official installer from UB-Mannheim: [https://github.com/UB-Mannheim/tesseract/wiki](https://github.com/UB-Mannheim/tesseract/wiki)
   - Choose the 64-bit installer: `tesseract-ocr-w64-setup-5.x.x.exe`.
2. **Select Additional Language Data during Setup:**
   - In the installer component selection dialog, expand **"Additional script data (download)"** and check **"Bengali script"**.
   - Expand **"Additional language data (download)"** and check **"Bengali (`ben`)"**.
3. **Add to System PATH:**
   - Default install path: `C:\Program Files\Tesseract-OCR`.
   - Add `C:\Program Files\Tesseract-OCR` to your user or system `PATH` environment variable.
4. **Set `TESSDATA_PREFIX` (if language data is in a custom path):**
   ```powershell
   [Environment]::SetEnvironmentVariable("TESSDATA_PREFIX", "C:\Program Files\Tesseract-OCR\tessdata", "User")
   ```
5. **Verify Installation:**
   ```powershell
   tesseract --version
   tesseract --list-langs
   ```
   *Expected output must include:*
   ```text
   List of available languages (3):
   ben
   eng
   osd
   ```

### Linux (Ubuntu / Debian / GitHub Actions CI) Installation
```bash
sudo apt-get update
sudo apt-get install -y --no-install-recommends \
  tesseract-ocr \
  tesseract-ocr-ben \
  fonts-noto-core \
  fonts-dejavu-core
```
To verify in CI:
```bash
tesseract --list-langs | grep -E "(ben|eng)"
```

---

## 2. Playwright Headless Browsers

CarbonOS uses Playwright for end-to-end browser regression, accessibility verification, and intake wizard testing across desktop and mobile viewports.

### Local Development (Windows & macOS)
1. **Ensure Node.js $\ge$ 20 is installed:**
   ```powershell
   node -v
   npm -v
   ```
2. **Install Node dependencies:**
   ```powershell
   npm install
   ```
3. **Install Chromium browser binary:**
   ```powershell
   npx playwright install chromium
   ```
   *(Optional for full browser matrix: `npx playwright install`)*
4. **Run E2E test suite:**
   ```powershell
   npx playwright test
   ```

### CI / Headless Linux
In headless Linux environments, Playwright requires system rendering libraries (e.g. fontconfig, nss, libasound2):
```bash
npx playwright install --with-deps chromium
```

---

## 3. PostgreSQL Database (Concurrency & Migrations)

For testing multi-threaded dual approval and transactional concurrency:
- Set environment variable `ESG_TEST_DATABASE_URL`:
  ```bash
  export ESG_TEST_DATABASE_URL="postgresql+psycopg2://esg:esg@localhost:5432/esg_test"
  ```
- In GitHub Actions CI, PostgreSQL is automatically provisioned as a service container (see `.github/workflows/esg-ci.yml`).
