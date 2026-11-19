import { v4 as uuidv4 } from 'uuid';

const VALID_CATEGORIES = ['electronics', 'clothing', 'food', 'books', 'other'];
const VALID_STATUSES = ['active', 'inactive', 'discontinued'];

class ProductStore {
  constructor() {
    this.products = new Map();
  }

  validateProduct(data, isUpdate = false) {
    const errors = [];

    if (!isUpdate) {
      if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
        errors.push('name is required and must be a non-empty string');
      }
      if (!data.sku || typeof data.sku !== 'string' || data.sku.trim() === '') {
        errors.push('sku is required and must be a non-empty string');
      }
    } else {
      if (data.name !== undefined && (typeof data.name !== 'string' || data.name.trim() === '')) {
        errors.push('name must be a non-empty string');
      }
      if (data.sku !== undefined && (typeof data.sku !== 'string' || data.sku.trim() === '')) {
        errors.push('sku must be a non-empty string');
      }
    }

    if (data.description !== undefined && data.description !== null && typeof data.description !== 'string') {
      errors.push('description must be a string');
    }

    if (data.category !== undefined) {
      if (!VALID_CATEGORIES.includes(data.category)) {
        errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}`);
      }
    } else if (!isUpdate) {
      errors.push('category is required');
    }

    if (data.price !== undefined) {
      if (typeof data.price !== 'number' || data.price <= 0 || !Number.isFinite(data.price)) {
        errors.push('price must be a positive number');
      } else if (Math.round(data.price * 100) !== data.price * 100) {
        errors.push('price must have up to 2 decimal places');
      }
    } else if (!isUpdate) {
      errors.push('price is required');
    }

    if (data.stock !== undefined) {
      if (!Number.isInteger(data.stock) || data.stock < 0) {
        errors.push('stock must be a non-negative integer');
      }
    } else if (!isUpdate) {
      errors.push('stock is required');
    }

    if (data.status !== undefined && !VALID_STATUSES.includes(data.status)) {
      errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    if (data.id !== undefined) {
      errors.push('id cannot be set manually');
    }

    if (data.createdAt !== undefined) {
      errors.push('createdAt cannot be set manually');
    }

    return errors;
  }

  findAll(filters = {}) {
    let results = Array.from(this.products.values());

    if (filters.category) {
      results = results.filter(p => p.category === filters.category);
    }
    if (filters.status) {
      results = results.filter(p => p.status === filters.status);
    }
    if (filters.minPrice !== undefined) {
      results = results.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter(p => p.price <= filters.maxPrice);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      results = results.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    return results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  findById(id) {
    return this.products.get(id) || null;
  }

  findBySku(sku) {
    for (const product of this.products.values()) {
      if (product.sku === sku) {
        return product;
      }
    }
    return null;
  }

  create(data) {
    const errors = this.validateProduct(data);
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.errors = errors;
      throw error;
    }

    const existingSku = this.findBySku(data.sku);
    if (existingSku) {
      const error = new Error('SKU already exists');
      error.statusCode = 409;
      error.errors = ['sku must be unique'];
      throw error;
    }

    const product = {
      id: uuidv4(),
      name: data.name.trim(),
      sku: data.sku.trim(),
      description: data.description ? data.description.trim() : '',
      category: data.category,
      price: Number(data.price.toFixed(2)),
      stock: data.stock,
      status: data.status || 'active',
      createdAt: new Date()
    };

    this.products.set(product.id, product);
    return product;
  }

  update(id, patch) {
    const product = this.findById(id);
    if (!product) {
      return null;
    }

    const errors = this.validateProduct(patch, true);
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.statusCode = 400;
      error.errors = errors;
      throw error;
    }

    if (patch.sku && patch.sku !== product.sku) {
      const existingSku = this.findBySku(patch.sku);
      if (existingSku) {
        const error = new Error('SKU already exists');
        error.statusCode = 409;
        error.errors = ['sku must be unique'];
        throw error;
      }
    }

    const updatedProduct = {
      ...product,
      name: patch.name !== undefined ? patch.name.trim() : product.name,
      sku: patch.sku !== undefined ? patch.sku.trim() : product.sku,
      description: patch.description !== undefined ? (patch.description ? patch.description.trim() : '') : product.description,
      category: patch.category !== undefined ? patch.category : product.category,
      price: patch.price !== undefined ? Number(patch.price.toFixed(2)) : product.price,
      stock: patch.stock !== undefined ? patch.stock : product.stock,
      status: patch.status !== undefined ? patch.status : product.status,
      createdAt: product.createdAt
    };

    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  delete(id) {
    const product = this.findById(id);
    if (!product) {
      return false;
    }
    this.products.delete(id);
    return true;
  }
}

export const productStore = new ProductStore();