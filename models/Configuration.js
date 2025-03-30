import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Configuration = sequelize.define('Configuration', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    itbis: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 18.00
    }
  });

  return Configuration;
};