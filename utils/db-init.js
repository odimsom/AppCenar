import models from "../models/index.js";
import bcrypt from "bcrypt";

const { Usuario, Comercio, TipoComercio, Configuracion } = models;

// Función para inicializar la base de datos con datos de prueba
const initDB = async () => {
  try {
    await models.sequelize.sync({ force: false });
    console.log("Base de datos sincronizada");

    // Verificar si ya hay configuración
    const configCount = await Configuracion.count();
    if (configCount === 0) {
      await Configuracion.create({ itbis: 18 });
      console.log("Configuración inicial creada");
    }

    // Verificar si ya hay tipos de comercio
    const tiposComercioCount = await TipoComercio.count();
    if (tiposComercioCount === 0) {
      const tiposComercio = [
        /* ... */
      ]; // mismos datos
      for (const tipo of tiposComercio) {
        await TipoComercio.create(tipo);
      }
      console.log("Tipos de comercio creados");
    }

    // Verificar si usuario admin ya existe
    const adminExists = await Usuario.findOne({ where: { usuario: "admin" } });
    if (!adminExists) {
      const adminPassword = "c";
      await Usuario.create({
        nombre: "Admin",
        apellido: "Sistema",
        telefono: "8091234567",
        correo: "admin@appcenar.com",
        usuario: "admin",
        password: adminPassword,
        rol: "admin",
        activo: true,
      });
      console.log("Usuario administrador creado");
    }

    // Repite la misma lógica para cliente, delivery y comercio:
    // Cliente
    const clienteExists = await Usuario.findOne({
      where: { usuario: "cliente" },
    });
    if (!clienteExists) {
      const clientePassword = "cliente123";
      await Usuario.create({
        nombre: "Cliente",
        apellido: "Ejemplo",
        telefono: "8092345678",
        correo: "cliente@appcenar.com",
        usuario: "cliente",
        password: clientePassword,
        rol: "cliente",
        activo: true,
      });
      console.log("Usuario cliente creado");
    }

    // Delivery
    const deliveryExists = await Usuario.findOne({
      where: { usuario: "delivery" },
    });
    if (!deliveryExists) {
      const deliveryPassword = "delivery123";
      await Usuario.create({
        nombre: "Delivery",
        apellido: "Ejemplo",
        telefono: "8093456789",
        correo: "delivery@appcenar.com",
        usuario: "delivery",
        password: deliveryPassword,
        rol: "delivery",
        activo: true,
        disponible: true,
      });
      console.log("Usuario delivery creado");
    }

    console.log("Base de datos inicializada correctamente");
  } catch (error) {
    console.error("Error al inicializar la base de datos:", error);
  } finally {
    process.exit();
  }
};

// Ejecutar la inicialización
export default initDB;
