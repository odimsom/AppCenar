import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Commerce = sequelize.define('Commerce', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    logo: {
      type: DataTypes.STRING,
      allowNull: true
    },
    openingTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    closingTime: {
      type: DataTypes.TIME,
      allowNull: false
    }
  });

  return Commerce;
};