import { DataTypes } from "sequelize";
import bcrypt from "bcrypt";

export default (sequelize) => {
  const Usuario = sequelize.define(
    "Usuario",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apellido: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      telefono: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      correo: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      usuario: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      foto: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rol: {
        type: DataTypes.ENUM("cliente", "delivery", "comercio", "admin"),
        allowNull: false,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      estado: {
        type: DataTypes.ENUM("disponible", "ocupado"),
        allowNull: true,
        defaultValue: "disponible",
      },
      cedula: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      hooks: {
        beforeCreate: async (usuario) => {
          if (usuario.password) {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password, salt);
          }
        },
        beforeUpdate: async (usuario) => {
          if (usuario.changed("password")) {
            const salt = await bcrypt.genSalt(10);
            usuario.password = await bcrypt.hash(usuario.password, salt);
          }
        },
      },
    }
  );

  Usuario.prototype.validarPassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

  Usuario.associate = (models) => {
    Usuario.hasMany(models.Direccion, {
      foreignKey: "usuarioId",
      as: "direcciones",
    });

    Usuario.hasMany(models.Pedido, {
      foreignKey: "clienteId",
      as: "pedidosCliente",
    });

    Usuario.hasMany(models.Pedido, {
      foreignKey: "deliveryId",
      as: "pedidosDelivery",
    });

    Usuario.hasMany(models.Favorito, {
      foreignKey: "clienteId",
      as: "favoritos",
    });
  };

  return Usuario;
};
