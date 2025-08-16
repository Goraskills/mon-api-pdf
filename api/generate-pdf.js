// Fichier : /api/generate-pdf.js (Version finale avec CORS)
const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');

const exePath = '/usr/bin/google-chrome';

async function getOptions() {
  return {
    args: chromium.args,
    executablePath: await chromium.executablePath || exePath,
    headless: chromium.headless,
  };
}

// La fonction principale
export default async function handler(request, response) {
  // ▼▼▼ PARTIE AJOUTÉE POUR LES AUTORISATIONS (CORS) ▼▼▼
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*'); // Autorise n'importe quel domaine
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  // Si c'est une requête "OPTIONS" (le navigateur vérifie les autorisations), on répond OK.
  if (request.method === 'OPTIONS') {
    response.status(200).end();
    return;
  }
  // ▲▲▲ FIN DE LA PARTIE AJOUTÉE ▲▲▲

  try {
    const html = request.body.html;

    const options = await getOptions();
    const browser = await puppeteer.launch(options);
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
    
    await browser.close();

    response.setHeader('Content-Type', 'application/pdf');
    response.send(pdfBuffer);

  } catch (error) {
    console.error(error);
    response.status(500).send("Erreur lors de la génération du PDF.");
  }
}
