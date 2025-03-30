import BaseRepository from './baseRepository.js';
import { Address } from '../models/index.js';

class AddressRepository extends BaseRepository {
  constructor() {
    super(Address);
  }

  async findByUser(userId) {
    return await this.findAll({
      where: { userId }
    });
  }
}

export default new AddressRepository();