import BaseRepository from './baseRepository.js';
import { CommerceType } from '../models/index.js';

class CommerceTypeRepository extends BaseRepository {
  constructor() {
    super(CommerceType);
  }
}

export default new CommerceTypeRepository();