const puppeteer = require('puppeteer');
const axios = require('axios');
const fetch = require('node-fetch');
const { GoogleGenerativeAI } = require("@google/generative-ai");




async function scrapeIngredients(url) {
  try {

    console.log("Running the scrape function");
    const browser = await puppeteer.launch({headless: true, 
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-accelerated-2d-canvas', '--disable-gpu']});  
    const page = await browser.newPage(); // Open a new page


    // Set request interception to block unwanted resources
    await page.setRequestInterception(true);

    // Intercept and block non-essential resources
    page.on('request', (request) => {
      const resourceType = request.resourceType();

      // Block images, stylesheets, fonts, media, etc.
      if (['image', 'stylesheet', 'font', 'media', 'other'].includes(resourceType)) {
        request.abort(); // Abort the request
      } else {
        request.continue(); // Allow only essential resources like scripts and documents
      }
    });

    
    console.log("Setting request headers");
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Referer': 'https://www.amazon.com/',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
    });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.102 Safari/537.36'
    );
    console.log("Navigating to amazon");
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0  }); // Go to the product page
    const content = await page.content();
    console.log(content)

    // Use the specific selector to scrape ingredients from the 'Product Information' section #productDetails_techSpec_section_1 > tbody > tr:nth-child(5) > td
    // Scrape product information from the page
    const productInfo = await page.evaluate(() => {
      const rows = document.querySelectorAll('#productDetails_techSpec_section_1 tr');
      let productDetails = {};

      rows.forEach((row) => {
        const header = row.querySelector('th');
        const data = row.querySelector('td');

        if (header && data) {
          const key = header.innerText.trim();
          const value = data.innerText.trim();
          productDetails[key] = value;
        }
      });

      return productDetails;
    });

    console.log('Product Information:', productInfo);
    await browser.close();
    return productInfo;
  } catch (error) {
    console.error('Error scraping ingredients:', error);
  }
}


async function getIngredients(url) {
  

  // Rotate through proxies
    try {
      console.log("Scraping now...");
      const ingredients = await scrapeIngredients(url);
      console.log("Ingredients: ", ingredients)
      return ingredients;
    } catch (error) {
      console.error(`Error: ${error}`);
    }
  }


  async function getAllergenMatches(ingredients, userAllergies) {

    try {
  
      const question = `
      Which ingredients listed in the product are allergies? Allergies List: ${userAllergies.join(', ')}, Ingredients List: ${ingredients.join(', ')}.
      IN THE FINAL RESPONSE, PRINT NOTHING BUT THE NAMES OF INGREDIENTS THAT MATCH THE ALLERGIES IN THE LIST.
        `;

        
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(question);
      console.log(result.response.text());

      const res = result.response.text();
  
      return res;
  
      // Process the response from the model
      
    } catch (error) {
      console.error('Error interacting with Hugging Face API:', error.message);
      throw error;
    }
  }
  
module.exports = { getIngredients, getAllergenMatches};