import { productStore } from '../models/product.js';

const createResponse = (success, data = null, error = null) => ({
  success,
  data,
  error
});

export const getAllProducts = (req, res, next) => {
  try {
    const filters = {
      category: req.query.category,
      status: req.query.status,
      minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
      maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
      search: req.query.search
    };

    Object.keys(filters).forEach(key => filters[key] === undefined && delete filters[key]);

    const products = productStore.findAll(filters);
    res.json(createResponse(true, products));
  } catch (err) {
    next(err);
  }
};

export const getProductById = (req, res, next) => {
  try {
    const { id } = req.params;
    const product = productStore.findById(id);

    if (!product) {
      return res.status(404).json(createResponse(false, null, { message: 'Product not found', code: 'NOT_FOUND' }));
    }

    res.json(createResponse(true, product));
  } catch (err) {
    next(err);
  }
};

export const createProduct = (req, res, next) => {
  try {
    const product = productStore.create(req.body);
    res.status(201).json(createResponse(true, product));
  } catch (err) {
    next(err);
  }
};

export const updateProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    const updatedProduct = productStore.update(id, req.body);

    if (!updatedProduct) {
      return res.status(404).json(createResponse(false, null, { message: 'Product not found', code: 'NOT_FOUND' }));
    }

    res.json(createResponse(true, updatedProduct));
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = productStore.delete(id);

    if (!deleted) {
      return res.status(404).json(createResponse(false, null, { message: 'Product not found', code: 'NOT_FOUND' }));
    }

    res.json(createResponse(true, { message: 'Product deleted successfully' }));
  } catch (err) {
    next(err);
  }
};