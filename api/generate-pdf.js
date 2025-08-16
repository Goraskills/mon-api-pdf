import chromium from "@sparticuz/chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  // Autorisations CORS pour Glide
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  // Réponse rapide pour OPTIONS
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  let browser = null;

  try {
    // Parser le body JSON manuellement
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => data += chunk);
      req.on('end', () => resolve(data ? JSON.parse(data) : {}));
      req.on('error', err => reject(err));
    });

    const html = body.html || "<h1>Hello depuis Vercel 🚀</h1>";

    // Lancer Chromium fourni par chrome-aws-lambda
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
    });

    await browser.close();

    // Envoyer le PDF en réponse
    res.setHeader("Content-Type", "application/pdf");
    res.send(pdfBuffer);

  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    if (browser) await browser.close();
    res.status(500).json({ error: error.message });
  }
}
