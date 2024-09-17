const User = require('../models/User'); // Import your function
const { getIngredients } = require('../scraper');
const axios = require('axios');
const fetch = require('node-fetch');
const {getAllergenMatches} = require('../scraper')




const fetchallergies =  async (req, res) => {

  const { username } = req.body;

  if (typeof username !== 'string') {
    console.log("Invalid username");
    return res.status(400).send('Invalid username');
  }

  try {

    console.log(req.body);
    console.log(username);
    
    const user = await User.findOne({ username });
    if (!user) {
      console.log("User not found");
      return res.status(404).send('User not found');
    }
    

    console.log("User found");
    console.log(user)
    console.log(user.allergies)
    res.json({ allergies: user.allergies });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

const addallergy = async (req, res) => {
  const { username, allergy } = req.body;

  if (typeof username !== 'string' || typeof allergy !== 'string') {
    return res.status(400).send('Invalid input');
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    if (!user.allergies.includes(allergy)) {
      user.allergies.push(allergy);
      await user.save();
    }

    res.status(200).send('Allergy added');
  } catch (error) {
    res.status(500).send('Server error');
  }
}

const removeallergy = async (req, res) => {
  const { username, allergy } = req.body;

  if (typeof username !== 'string' || typeof allergy !== 'string') {
    return res.status(400).send('Invalid input');
  }

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send('User not found');
    }

    user.allergies = user.allergies.filter(a => a !== allergy);
    await user.save();

    res.status(200).send('Allergy removed');
  } catch (error) {
    res.status(500).send('Server error');
  }
}






const scraper =  async (req, res) => {


  const username = req.body.username;
  const amazonUrl = req.body.url;

  try {
    const user = await User.findOne({ username });


      if (!user) {
        console.log("User not found");
        return res.status(404).send('User not found');
      }
      

      console.log("User found");
      console.log(user.username);
      console.log(user.allergies);


    if (!amazonUrl) {
      return res.status(400).send('Amazon URL is required.');
    }

  
    // Get ingredients from the scraper
    const ingredientsText = await getIngredients(amazonUrl);

    console.log("Ing: ", ingredientsText);

    // Normalize and split ingredients
    const ingredients = ingredientsText
      .toLowerCase()
      .split(',')
      .map((ing) => ing.trim());

      console.log("Trimmed Ingredients",ingredients);
      console.log("Current User Allergies: ", user.allergies)

      console.log("Fetching matching allergies...");

    // Get allergen matches from Hugging Face
    const matchedAllergies = await getAllergenMatches(ingredients, user.allergies);

    console.log("Allergy Controller Matches:", matchedAllergies);
    const array = matchedAllergies.split(',');
    res.json({matchedAllergies: array});
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error scraping ingredients or matching allergies.');
  }
};





module.exports = { fetchallergies, addallergy, removeallergy, scraper };
