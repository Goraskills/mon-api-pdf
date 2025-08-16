// Fichier : /api/generate-pdf.js (Version finale avec arguments pour Vercel)
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

export default async function handler(request, response) {
  // Autorisations (CORS)
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }

  let browser = null;

  try {
    const html = request.body.html;
    if (!html) {
      return response.status(400).send("Erreur : Le contenu HTML est manquant.");
    }

    // Configuration minimale pour la compatibilité Vercel
    browser = await puppeteer.launch({
      args: [
        ...chromium.args,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    response.setHeader('Content-Type', 'application/pdf');
    response.send(pdfBuffer);

  } catch (error) {
    console.error(error);
    response.status(500).send(`Erreur lors de la génération du PDF: ${error.message}`);
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}
