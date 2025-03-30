import BaseRepository from './baseRepository.js';
import { Order } from '../models/index.js';

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  async findByClient(clientId) {
    return await this.findAll({
      where: { clientId }
    });
  }

  async findByDelivery(deliveryId) {
    return await this.findAll({
      where: { deliveryId }
    });
  }

  async findByCommerce(commerceId) {
    return await this.findAll({
      where: { CommerceId: commerceId }
    });
  }

  async findPendingOrders() {
    return await this.findAll({
      where: { 
        status: 'pending',
        deliveryId: null
      }
    });
  }
}

export default new OrderRepository();