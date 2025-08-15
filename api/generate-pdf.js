// Fichier : /api/generate-pdf.js
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

// On configure pour que ça marche sur Vercel
const exePath = '/usr/bin/google-chrome';

async function getOptions() {
  return {
    args: chromium.args,
    executablePath: await chromium.executablePath || exePath,
    headless: chromium.headless,
  };
}

// La fonction principale qui sera appelée par Vercel
export default async function handler(request, response) {
  try {
    const html = request.body.html; // On récupère le HTML envoyé par Glide

    const options = await getOptions();
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    // On applique le HTML à une page web invisible
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // On génère le PDF à partir de cette page
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    // On renvoie le fichier PDF terminé
    response.setHeader('Content-Type', 'application/pdf');
    response.send(pdfBuffer);

  } catch (error) {
    console.error(error);
    response.status(500).send("Erreur lors de la génération du PDF.");
  }
}