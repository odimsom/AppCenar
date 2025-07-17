import models from "./models/index.js";

const { Usuario } = models;

// Función para deserializar y crear usuarios desde el JSON
const crearUsuariosDesdeJSON = async (jsonData) => {
  try {
    const usuariosData = JSON.parse(jsonData);
    const usuariosCreados = [];

    for (const usuarioData of usuariosData.usuarios) {
      try {
        const usuarioCreado = await Usuario.create(usuarioData);
        usuariosCreados.push(usuarioCreado);
        console.log(
          `Usuario creado: ${usuarioCreado.nombre} (${usuarioCreado.rol})`
        );
      } catch (error) {
        console.error(
          `Error al crear usuario ${usuarioData.nombre}:`,
          error.message
        );
      }
    }

    console.log(`\nTotal de usuarios creados: ${usuariosCreados.length}`);
    return usuariosCreados;
  } catch (error) {
    console.error("Error al procesar el JSON:", error.message);
    throw error;
  }
};

const crearTiposComercioYComercios = async (
  jsonData,
  TipoComercio,
  Comercio
) => {
  try {
    const data = JSON.parse(jsonData);
    const tiposCreados = [];
    const comerciosCreados = [];

    // Primero crear los tipos de comercio
    console.log("=== CREANDO TIPOS DE COMERCIO ===");
    for (const tipoData of data.tiposComercio) {
      try {
        const tipoCreado = await TipoComercio.create(tipoData);
        tiposCreados.push(tipoCreado);
        console.log(`✓ Tipo de comercio creado: ${tipoCreado.nombre}`);
      } catch (error) {
        console.error(
          `✗ Error al crear tipo de comercio ${tipoData.nombre}:`,
          error.message
        );
      }
    }

    // Luego crear los comercios
    console.log("\n=== CREANDO COMERCIOS ===");
    for (const comercioData of data.comercios) {
      try {
        const comercioCreado = await Comercio.create(comercioData);
        comerciosCreados.push(comercioCreado);
        console.log(
          `✓ Comercio creado: ${comercioCreado.nombre} (Tipo: ${comercioData.tipoComercioId})`
        );
      } catch (error) {
        console.error(
          `✗ Error al crear comercio ${comercioData.nombre}:`,
          error.message
        );
      }
    }

    console.log(`\n=== RESUMEN ===`);
    console.log(`Tipos de comercio creados: ${tiposCreados.length}`);
    console.log(`Comercios creados: ${comerciosCreados.length}`);

    return { tiposCreados, comerciosCreados };
  } catch (error) {
    console.error("Error al procesar el JSON:", error.message);
    throw error;
  }
};

// Función alternativa para crear solo comercios (si ya tienes los tipos)
const crearSoloComercios = async (jsonData, Comercio) => {
  try {
    const data = JSON.parse(jsonData);
    const comerciosCreados = [];

    console.log("=== CREANDO COMERCIOS ===");
    for (const comercioData of data.comercios) {
      try {
        const comercioCreado = await Comercio.create(comercioData);
        comerciosCreados.push(comercioCreado);
        console.log(`✓ Comercio creado: ${comercioCreado.nombre}`);
      } catch (error) {
        console.error(
          `✗ Error al crear comercio ${comercioData.nombre}:`,
          error.message
        );
      }
    }

    console.log(`\nTotal de comercios creados: ${comerciosCreados.length}`);
    return comerciosCreados;
  } catch (error) {
    console.error("Error al procesar el JSON:", error.message);
    throw error;
  }
};

// Función para crear desde objetos JavaScript directamente
const crearDesdeObjetos = async (dataObj, TipoComercio, Comercio) => {
  const tiposCreados = [];
  const comerciosCreados = [];

  // Crear tipos de comercio
  for (const tipoData of dataObj.tiposComercio) {
    try {
      const tipoCreado = await TipoComercio.create(tipoData);
      tiposCreados.push(tipoCreado);
      console.log(`✓ Tipo: ${tipoCreado.nombre}`);
    } catch (error) {
      console.error(`✗ Error tipo ${tipoData.nombre}:`, error.message);
    }
  }

  // Crear comercios
  for (const comercioData of dataObj.comercios) {
    try {
      const comercioCreado = await Comercio.create(comercioData);
      comerciosCreados.push(comercioCreado);
      console.log(`✓ Comercio: ${comercioCreado.nombre}`);
    } catch (error) {
      console.error(`✗ Error comercio ${comercioData.nombre}:`, error.message);
    }
  }

  return { tiposCreados, comerciosCreados };
};

export default crearTiposComercioYComercios;
