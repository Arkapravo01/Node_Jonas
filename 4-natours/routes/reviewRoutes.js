const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
console.log('REVIEW ROUTES FILE LOADED');

const router = express.Router();

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview,
  );

module.exports = router;
