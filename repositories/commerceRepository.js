import BaseRepository from './baseRepository.js';
import { Commerce, User, CommerceType, Order } from '../models/index.js';
import { Op } from 'sequelize';

class CommerceRepository extends BaseRepository {
  constructor() {
    super(Commerce);
  }

  async findByType(typeId) {
    return await this.findAll({
      where: { CommerceTypeId: typeId },
      include: [
        {
          model: User,
          where: { active: true }
        }
      ]
    });
  }

  async findWithUser(id) {
    return await this.findOne({
      where: { id },
      include: [User]
    });
  }

  async findByUserId(userId) {
    return await this.findOne({
      where: { UserId: userId }
    });
  }

  async searchByName(name, typeId = null) {
    const whereClause = {
      name: {
        [Op.like]: `%${name}%`
      }
    };

    if (typeId) {
      whereClause.CommerceTypeId = typeId;
    }

    return await this.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          where: { active: true }
        }
      ]
    });
  }

  async countOrders(commerceId) {
    return await Order.count({
      where: { CommerceId: commerceId }
    });
  }
}

export default new CommerceRepository();