const express = require('express');
const router = express.Router();
const allergyController = require('../controllers/allergyController');

router.post('/allergies', allergyController.fetchallergies);
router.post('/addallergy', allergyController.addallergy);
router.post('/removeallergy', allergyController.removeallergy);
router.post('/scrape',allergyController.scraper);

module.exports = router;
