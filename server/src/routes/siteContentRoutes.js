const express = require('express');
const router = express.Router();
const siteContentController = require('../controllers/siteContentController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validate = require('../middleware/validate');
const {
  updateSiteContentValidator,
} = require('../utils/validators/siteContentValidators');

router.get('/', siteContentController.getSiteContent);
router.put(
  '/',
  auth,
  admin,
  updateSiteContentValidator,
  validate,
  siteContentController.updateSiteContent
);

module.exports = router;
