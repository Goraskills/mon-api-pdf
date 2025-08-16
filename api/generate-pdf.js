// Fichier : /api/generate-pdf.js (Version finale et propre)
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

  try {
    // On récupère le code HTML envoyé par Glide
    const html = request.body.html;

    // On s'assure que le HTML n'est pas vide
    if (!html) {
      return response.status(400).send("Erreur : Le contenu HTML est manquant.");
    }

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });

    await browser.close();

    response.setHeader('Content-Type', 'application/pdf');
    response.send(pdfBuffer);

  } catch (error) {
    console.error(error);
    // On renvoie une erreur plus détaillée si possible
    response.status(500).send(`Erreur lors de la génération du PDF: ${error.message}`);
  }
}
