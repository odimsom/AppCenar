class BaseRepository {
    constructor(model) {
      this.model = model;
    }
  
    async findAll(options = {}) {
      return await this.model.findAll(options);
    }
  
    async findById(id, options = {}) {
      return await this.model.findByPk(id, options);
    }
  
    async findOne(options = {}) {
      return await this.model.findOne(options);
    }
  
    async create(data) {
      return await this.model.create(data);
    }
  
    async update(id, data) {
      const instance = await this.findById(id);
      if (!instance) return null;
      return await instance.update(data);
    }
  
    async delete(id) {
      const instance = await this.findById(id);
      if (!instance) return false;
      await instance.destroy();
      return true;
    }
  
    async count(options = {}) {
      return await this.model.count(options);
    }
  }
  
  export default BaseRepository;