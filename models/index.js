import sequelize from '../config/database.js';
import defineUserModel from './User.js';
import defineCommerceModel from './Commerce.js';
import defineCommerceTypeModel from './CommerceType.js';
import defineProductModel from './Product.js';
import defineCategoryModel from './Category.js';
import defineOrderModel from './Order.js';
import defineOrderDetailModel from './OrderDetail.js';
import defineAddressModel from './Address.js';
import defineFavoriteModel from './Favorite.js';
import defineConfigurationModel from './Configuration.js';

const User = defineUserModel(sequelize);
const Commerce = defineCommerceModel(sequelize);
const CommerceType = defineCommerceTypeModel(sequelize);
const Product = defineProductModel(sequelize);
const Category = defineCategoryModel(sequelize);
const Order = defineOrderModel(sequelize);
const OrderDetail = defineOrderDetailModel(sequelize);
const Address = defineAddressModel(sequelize);
const Favorite = defineFavoriteModel(sequelize);
const Configuration = defineConfigurationModel(sequelize);

User.hasOne(Commerce);
Commerce.belongsTo(User);

CommerceType.hasMany(Commerce);
Commerce.belongsTo(CommerceType);

Commerce.hasMany(Category);
Category.belongsTo(Commerce);

Commerce.hasMany(Product);
Product.belongsTo(Commerce);

Category.hasMany(Product);
Product.belongsTo(Category);

User.hasMany(Address, { foreignKey: 'userId' });
Address.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Order, { foreignKey: 'clientId' });
Order.belongsTo(User, { foreignKey: 'clientId', as: 'client' });

User.hasMany(Order, { foreignKey: 'deliveryId' });
Order.belongsTo(User, { foreignKey: 'deliveryId', as: 'delivery' });

Commerce.hasMany(Order);
Order.belongsTo(Commerce);

Order.hasMany(OrderDetail);
OrderDetail.belongsTo(Order);

Product.hasMany(OrderDetail);
OrderDetail.belongsTo(Product);

Address.hasMany(Order);
Order.belongsTo(Address);

User.belongsToMany(Commerce, { through: Favorite, foreignKey: 'userId' });
Commerce.belongsToMany(User, { through: Favorite, foreignKey: 'commerceId' });

export {
  sequelize,
  User,
  Commerce,
  CommerceType,
  Product,
  Category,
  Order,
  OrderDetail,
  Address,
  Favorite,
  Configuration
};