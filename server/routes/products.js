const express = require('express');
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

router.get('/',          productController.getAll);
router.get('/:id',       productController.getOne);
router.post('/',         productController.create);
router.put('/:id',       productController.update);
router.delete('/:id',    productController.remove);
router.post('/:id/adjust', productController.adjustStock);

module.exports = router;
