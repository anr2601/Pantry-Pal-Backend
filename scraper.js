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
    const ingredients = await page.evaluate(() => {
      const rows = document.querySelectorAll('#productDetails_techSpec_section_1 > tbody > tr');
      
      // Iterate through each row to find ingredients
      let ingredientsText = 'Ingredients not listed';
      rows.forEach(row => {
        const header = row.querySelector('th'); // Find the header in the row
        const data = row.querySelector('td');   // Find the data cell in the row

        if (header && header.innerText.toLowerCase().includes('ingredients')) {
          ingredientsText = data ? data.innerText.trim() : 'Ingredients not found';
        }
      });

      return ingredientsText;// Fallback if the ingredients are not found
    });
    console.log("ingredients found after scraping: ",ingredients);
    return ingredients;
     // Print the ingredients
    await browser.close(); // Close the browser
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