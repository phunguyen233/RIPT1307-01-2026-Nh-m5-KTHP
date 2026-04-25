const express = require('express');
const router = express.Router();
const recipeIngredientsController = require('../controllers/recipeIngredients');

router.get('/', recipeIngredientsController.getAllRecipeIngredients);
router.get('/:id', recipeIngredientsController.getRecipeIngredientById);
router.post('/', recipeIngredientsController.createRecipeIngredient);
router.put('/:id', recipeIngredientsController.updateRecipeIngredient);
router.delete('/:id', recipeIngredientsController.deleteRecipeIngredient);

module.exports = router;
