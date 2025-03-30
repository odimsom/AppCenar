import BaseRepository from './baseRepository.js';
import { Product } from '../models/index.js';

class ProductRepository extends BaseRepository {
  constructor() {
    super(Product);
  }

  async findByCommerce(commerceId) {
    return await this.findAll({
      where: { CommerceId: commerceId }
    });
  }

  async findByCategory(categoryId) {
    return await this.findAll({
      where: { CategoryId: categoryId }
    });
  }
}

export default new ProductRepository();