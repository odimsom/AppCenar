import BaseRepository from './baseRepository.js';
import { User, Order } from '../models/index.js';
import { Op } from 'sequelize';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.findOne({ where: { email } });
  }

  async findByUsername(username) {
    return await this.findOne({ where: { username } });
  }

  async activateUser(token) {
    const user = await this.findOne({ where: { activationToken: token } });
    if (!user) return null;
    
    user.active = true;
    user.activationToken = null;
    await user.save();
    return user;
  }

  async findByRole(role) {
    return await this.findAll({ where: { role } });
  }

  async findActiveByRole(role) {
    return await this.findAll({ where: { role, active: true } });
  }

  async findAvailableDeliveries() {
    return await this.findAll({
      where: {
        role: 'delivery',
        active: true,
        status: 'available'
      }
    });
  }

  async countOrdersByClient(clientId) {
    return await Order.count({
      where: { clientId }
    });
  }

  async countOrdersByDelivery(deliveryId) {
    return await Order.count({
      where: { 
        deliveryId,
        status: 'completed'
      }
    });
  }
}

export default new UserRepository();