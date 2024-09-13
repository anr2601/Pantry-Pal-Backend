const puppeteer = require('puppeteer');
const axios = require('axios');
const fetch = require('node-fetch');
const { GoogleGenerativeAI } = require("@google/generative-ai");




async function scrapeIngredients(url) {
  try {
    const browser = await puppeteer.launch({ headless: true }); 
    const page = await browser.newPage(); // Open a new page
    await page.goto(url, { waitUntil: 'networkidle2' }); // Go to the product page

    // Use the specific selector to scrape ingredients from the 'Product Information' section #productDetails_techSpec_section_1 > tbody > tr:nth-child(5) > td
    const ingredients = await page.evaluate(() => {
      const rows = document.querySelectorAll('#productDetails_techSpec_section_1 tr');
    let ingredientsText = 'Ingredients not listed';

    rows.forEach((row) => {
      const header = row.querySelector('th'); // Find the header in the row
      const data = row.querySelector('td');   // Find the data cell in the row

      if (header && header.innerText.toLowerCase().includes('ingredients')) {
        ingredientsText = data ? data.innerText.trim() : 'Ingredients not found';
      }
    });
    
    return ingredientsText; // Fallback if the ingredients are not found 
    });
    console.log("ingre: ",ingredients);
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