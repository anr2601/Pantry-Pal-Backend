const puppeteer = require('puppeteer');
const axios = require('axios');
const fetch = require('node-fetch');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cheerio = require('cheerio'); // For parsing the rendered HTML




async function scrapeIngredients(url) {
  try {
    // Use Rendertron to pre-render the page instead of Puppeteer
    const rendertronUrl = `https://rendertron-fl7w.onrender.com/render/${url}`; // Replace with your Rendertron URL

    // Fetch the pre-rendered HTML using Axios
    const { data: renderedHtml } = await axios.get(rendertronUrl);

    // Load the HTML with Cheerio
    const $ = cheerio.load(renderedHtml);

    // Scrape the ingredients from the pre-rendered HTML
    const rows = $('#productDetails_techSpec_section_1 tr');
    let ingredientsText = 'Ingredients not listed';

    rows.each((i, row) => {
      const header = $(row).find('th').text().toLowerCase();
      const data = $(row).find('td').text().trim();

      if (header.includes('ingredients')) {
        ingredientsText = data || 'Ingredients not found';
      }
    });

    console.log("Ingredients: ", ingredientsText);
    return ingredientsText;
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