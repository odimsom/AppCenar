import BaseRepository from './baseRepository.js';
import { Category } from '../models/index.js';

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  async findByCommerce(commerceId) {
    return await this.findAll({
      where: { CommerceId: commerceId }
    });
  }
}

export default new CategoryRepository();