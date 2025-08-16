import chromium from "@sparticuz/chrome-aws-lambda";
import puppeteer from "puppeteer-core";

export default async function handler(req, res) {
  try {
    const { html } = req.body;

    // Lancer Chromium depuis chrome-aws-lambda
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath, // 🔑 obligatoire
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html || "<h1>Hello depuis Vercel 🚀</h1>");

    const pdf = await page.pdf({ format: "A4" });

    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.send(pdf);
  } catch (error) {
    console.error("Erreur lors de la génération du PDF:", error);
    res.status(500).json({ error: error.message });
  }
}
