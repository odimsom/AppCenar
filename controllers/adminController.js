import models from "../models/index.js";

const { Usuario, Comercio, TipoComercio, Producto, Pedido, Configuracion } =
  models;

export const renderDashboard = async (req, res) => {
  try {
    // Contar pedidos totales
    const totalPedidos = await Pedido.count();

    // Contar pedidos de hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const pedidosHoy = await Pedido.count({
      where: {
        createdAt: {
          [models.Sequelize.Op.gte]: hoy,
        },
      },
    });

    // Contar comercios activos e inactivos
    const comerciosActivos = await Comercio.count({ where: { activo: true } });
    const comerciosInactivos = await Comercio.count({
      where: { activo: false },
    });

    const clientesActivos = await Usuario.count({
      where: {
        rol: "cliente",
        activo: true,
      },
    });
    const clientesInactivos = await Usuario.count({
      where: {
        rol: "cliente",
        activo: false,
      },
    });

    // Contar deliveries activos e inactivos
    const deliveriesActivos = await Usuario.count({
      where: {
        rol: "delivery",
        activo: true,
      },
    });
    const deliveriesInactivos = await Usuario.count({
      where: {
        rol: "delivery",
        activo: false,
      },
    });

    // Contar productos
    const totalProductos = await Producto.count();

    res.render("admin/dashboard", {
      totalPedidos,
      pedidosHoy,
      comerciosActivos,
      comerciosInactivos,
      clientesActivos,
      clientesInactivos,
      deliveriesActivos,
      deliveriesInactivos,
      totalProductos,
    });
  } catch (error) {
    console.error("Error al cargar dashboard:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/");
  }
};

// Renderizar listado de clientes
export const renderClientes = async (req, res) => {
  try {
    const clientes = await Usuario.findAll({
      where: { rol: "cliente" },
      include: [
        {
          model: Pedido,
          as: "pedidosCliente",
        },
      ],
    });

    res.render("admin/clientes", { clientes });
  } catch (error) {
    console.error("Error al cargar listado de clientes:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/admin/home");
  }
};

// Cambiar estado de activación de un cliente
export const cambiarEstadoCliente = async (req, res) => {
  try {
    const { clienteId } = req.params;

    const cliente = await Usuario.findOne({
      where: {
        id: clienteId,
        rol: "cliente",
      },
    });

    if (!cliente) {
      req.flash("error_msg", "Cliente no encontrado");
      return res.redirect("/admin/clientes");
    }

    cliente.activo = !cliente.activo;
    await cliente.save();

    req.flash(
      "success_msg",
      `Cliente ${cliente.activo ? "activado" : "desactivado"} con éxito`
    );
    res.redirect("/admin/clientes");
  } catch (error) {
    console.error("Error al cambiar estado del cliente:", error);
    req.flash("error_msg", "Error al cambiar estado del cliente");
    res.redirect("/admin/clientes");
  }
};

// Renderizar listado de deliveries
export const renderDeliveries = async (req, res) => {
  try {
    const deliveries = await Usuario.findAll({
      where: { rol: "delivery" },
      include: [
        {
          model: Pedido,
          as: "pedidosDelivery",
        },
      ],
    });

    res.render("admin/deliveries", { deliveries });
  } catch (error) {
    console.error("Error al cargar listado de deliveries:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/admin/home");
  }
};

// Cambiar estado de activación de un delivery
export const cambiarEstadoDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    const delivery = await Usuario.findOne({
      where: {
        id: deliveryId,
        rol: "delivery",
      },
    });

    if (!delivery) {
      req.flash("error_msg", "Delivery no encontrado");
      return res.redirect("/admin/deliveries");
    }

    delivery.activo = !delivery.activo;
    await delivery.save();

    req.flash(
      "success_msg",
      `Delivery ${delivery.activo ? "activado" : "desactivado"} con éxito`
    );
    res.redirect("/admin/deliveries");
  } catch (error) {
    console.error("Error al cambiar estado del delivery:", error);
    req.flash("error_msg", "Error al cambiar estado del delivery");
    res.redirect("/admin/deliveries");
  }
};

// Renderizar listado de comercios
export const renderComercios = async (req, res) => {
  try {
    const comercios = await Comercio.findAll({
      include: [
        {
          model: Pedido,
          as: "pedidos",
        },
      ],
    });

    res.render("admin/comercios", { comercios });
  } catch (error) {
    console.error("Error al cargar listado de comercios:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/admin/home");
  }
};

// Cambiar estado de activación de un comercio
export const cambiarEstadoComercio = async (req, res) => {
  try {
    const { comercioId } = req.params;

    const comercio = await Comercio.findByPk(comercioId);

    if (!comercio) {
      req.flash("error_msg", "Comercio no encontrado");
      return res.redirect("/admin/comercios");
    }

    comercio.activo = !comercio.activo;
    await comercio.save();

    req.flash(
      "success_msg",
      `Comercio ${comercio.activo ? "activado" : "desactivado"} con éxito`
    );
    res.redirect("/admin/comercios");
  } catch (error) {
    console.error("Error al cambiar estado del comercio:", error);
    req.flash("error_msg", "Error al cambiar estado del comercio");
    res.redirect("/admin/comercios");
  }
};

// Renderizar configuración
export const renderConfiguracion = async (req, res) => {
  try {
    let configuracion = await Configuracion.findOne();

    // Si no existe configuración, crear una por defecto
    if (!configuracion) {
      configuracion = await Configuracion.create({
        itbis: 18.0,
      });
    }

    res.render("admin/configuracion", { configuracion });
  } catch (error) {
    console.error("Error al cargar configuración:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/admin/home");
  }
};

// Renderizar formulario para editar configuración
export const renderEditarConfiguracion = async (req, res) => {
  try {
    let configuracion = await Configuracion.findOne();

    // Si no existe configuración, crear una por defecto
    if (!configuracion) {
      configuracion = await Configuracion.create({
        itbis: 18.0,
      });
    }

    res.render("admin/editar-configuracion", { configuracion });
  } catch (error) {
    console.error("Error al cargar edición de configuración:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/admin/configuracion");
  }
};

// Actualizar configuración
export const actualizarConfiguracion = async (req, res) => {
  try {
    const { itbis } = req.body;

    let configuracion = await Configuracion.findOne();

    // Si no existe configuración, crear una nueva
    if (!configuracion) {
      configuracion = await Configuracion.create({
        itbis,
      });
    } else {
      configuracion.itbis = itbis;
      await configuracion.save();
    }

    req.flash("success_msg", "Configuración actualizada con éxito");
    res.redirect("/admin/configuracion");
  } catch (error) {
    console.error("Error al actualizar configuración:", error);
    req.flash("error_msg", "Error al actualizar la configuración");
    res.redirect("/admin/configuracion/editar");
  }
};

// Renderizar listado de administradores
export const renderAdministradores = async (req, res) => {
  try {
    const administradores = await Usuario.findAll({
      where: { rol: "admin" },
    });

    res.render("admin/administradores", {
      administradores,
      usuarioActual: req.session.user.id,
    });
  } catch (error) {
    console.error("Error al cargar listado de administradores:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/admin/home");
  }
};

// Renderizar formulario para crear administrador
export const renderCrearAdministrador = (req, res) => {
  res.render("admin/crear-administrador");
};

// Crear administrador
export const crearAdministrador = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      cedula,
      correo,
      usuario,
      password,
      confirmarPassword,
      telefono,
    } = req.body;

    // Validar que las contraseñas coincidan
    if (password !== confirmarPassword) {
      req.flash("error_msg", "Las contraseñas no coinciden");
      return res.redirect("/admin/administradores/crear");
    }

    // Verificar que el correo y usuario no existan
    const existeCorreo = await Usuario.findOne({ where: { correo } });
    const existeUsuario = await Usuario.findOne({ where: { usuario } });

    if (existeCorreo) {
      req.flash("error_msg", "El correo ya está registrado");
      return res.redirect("/admin/administradores/crear");
    }

    if (existeUsuario) {
      req.flash("error_msg", "El nombre de usuario ya está registrado");
      return res.redirect("/admin/administradores/crear");
    }

    // Crear administrador
    await Usuario.create({
      nombre,
      apellido,
      cedula,
      correo,
      usuario,
      telefono,
      password,
      rol: "admin",
      activo: true,
    });

    req.flash("success_msg", "Administrador creado con éxito");
    res.redirect("/admin/administradores");
  } catch (error) {
    console.error("Error al crear administrador:", error);
    req.flash("error_msg", "Error al crear el administrador");
    res.redirect("/admin/administradores/crear");
  }
};

// Renderizar formulario para editar administrador
export const renderEditarAdministrador = async (req, res) => {
  try {
    const { adminId } = req.params;

    // No permitir editar el usuario actual
    if (adminId == req.session.user.id) {
      req.flash("error_msg", "No puedes editar tu propio usuario");
      return res.redirect("/admin/administradores");
    }

    const admin = await Usuario.findOne({
      where: {
        id: adminId,
        rol: "admin",
      },
    });

    if (!admin) {
      req.flash("error_msg", "Administrador no encontrado");
      return res.redirect("/admin/administradores");
    }

    res.render("admin/editar-administrador", { admin });
  } catch (error) {
    console.error("Error al cargar edición de administrador:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/admin/administradores");
  }
};

// Actualizar administrador
export const actualizarAdministrador = async (req, res) => {
  try {
    const { adminId } = req.params;
    const {
      nombre,
      apellido,
      cedula,
      correo,
      usuario,
      password,
      confirmarPassword,
    } = req.body;

    // No permitir editar el usuario actual
    if (adminId == req.session.user.id) {
      req.flash("error_msg", "No puedes editar tu propio usuario");
      return res.redirect("/admin/administradores");
    }

    const admin = await Usuario.findOne({
      where: {
        id: adminId,
        rol: "admin",
      },
    });

    if (!admin) {
      req.flash("error_msg", "Administrador no encontrado");
      return res.redirect("/admin/administradores");
    }

    // Verificar si el correo ya existe en otro usuario
    const existeCorreo = await Usuario.findOne({
      where: {
        correo,
        id: { [models.Sequelize.Op.ne]: adminId },
      },
    });

    if (existeCorreo) {
      req.flash("error_msg", "El correo ya está registrado");
      return res.redirect(`/admin/administradores/editar/${adminId}`);
    }

    // Verificar si el usuario ya existe en otro usuario
    const existeUsuario = await Usuario.findOne({
      where: {
        usuario,
        id: { [models.Sequelize.Op.ne]: adminId },
      },
    });

    if (existeUsuario) {
      req.flash("error_msg", "El nombre de usuario ya está registrado");
      return res.redirect(`/admin/administradores/editar/${adminId}`);
    }

    // Actualizar datos básicos
    admin.nombre = nombre;
    admin.apellido = apellido;
    admin.cedula = cedula;
    admin.correo = correo;
    admin.usuario = usuario;

    // Si se proporciona una nueva contraseña
    if (password && password.trim() !== "") {
      // Validar que las contraseñas coincidan
      if (password !== confirmarPassword) {
        req.flash("error_msg", "Las contraseñas no coinciden");
        return res.redirect(`/admin/administradores/editar/${adminId}`);
      }

      admin.password = password;
    }

    await admin.save();

    req.flash("success_msg", "Administrador actualizado con éxito");
    res.redirect("/admin/administradores");
  } catch (error) {
    console.error("Error al actualizar administrador:", error);
    req.flash("error_msg", "Error al actualizar el administrador");
    res.redirect("/admin/administradores");
  }
};

// Cambiar estado de activación de un administrador
export const cambiarEstadoAdministrador = async (req, res) => {
  try {
    const { adminId } = req.params;

    // No permitir cambiar el estado del usuario actual
    if (adminId == req.session.user.id) {
      req.flash(
        "error_msg",
        "No puedes cambiar el estado de tu propio usuario"
      );
      return res.redirect("/admin/administradores");
    }

    const admin = await Usuario.findOne({
      where: {
        id: adminId,
        rol: "admin",
      },
    });

    if (!admin) {
      req.flash("error_msg", "Administrador no encontrado");
      return res.redirect("/admin/administradores");
    }

    admin.activo = !admin.activo;
    await admin.save();

    req.flash(
      "success_msg",
      `Administrador ${admin.activo ? "activado" : "desactivado"} con éxito`
    );
    res.redirect("/admin/administradores");
  } catch (error) {
    console.error("Error al cambiar estado del administrador:", error);
    req.flash("error_msg", "Error al cambiar estado del administrador");
    res.redirect("/admin/administradores");
  }
};

// Renderizar listado de tipos de comercio
export const renderTiposComercios = async (req, res) => {
  try {
    const tiposComercios = await TipoComercio.findAll({
      include: [
        {
          model: Comercio,
          as: "comercios",
        },
      ],
    });

    res.render("admin/tipos-comercios", { tiposComercios });
  } catch (error) {
    console.error("Error al cargar listado de tipos de comercio:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/admin/home");
  }
};

// Renderizar formulario para crear tipo de comercio
export const renderCrearTipoComercio = (req, res) => {
  res.render("admin/crear-tipo-comercio");
};

// Crear tipo de comercio
export const crearTipoComercio = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    // Verificar que se haya subido un icono
    if (!req.file) {
      req.flash("error_msg", "Debes subir un icono para el tipo de comercio");
      return res.redirect("/admin/tipos-comercios/crear");
    }

    await TipoComercio.create({
      nombre,
      descripcion,
      icono: `/uploads/tipos-comercio/${req.file.filename}`,
    });

    req.flash("success_msg", "Tipo de comercio creado con éxito");
    res.redirect("/admin/tipos-comercios");
  } catch (error) {
    console.error("Error al crear tipo de comercio:", error);
    req.flash("error_msg", "Error al crear el tipo de comercio");
    res.redirect("/admin/tipos-comercios/crear");
  }
};

// Renderizar formulario para editar tipo de comercio
export const renderEditarTipoComercio = async (req, res) => {
  try {
    const { tipoId } = req.params;

    const tipoComercio = await TipoComercio.findByPk(tipoId);

    if (!tipoComercio) {
      req.flash("error_msg", "Tipo de comercio no encontrado");
      return res.redirect("/admin/tipos-comercios");
    }

    res.render("admin/editar-tipo-comercio", { tipoComercio });
  } catch (error) {
    console.error("Error al cargar edición de tipo de comercio:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/admin/tipos-comercios");
  }
};

// Actualizar tipo de comercio
export const actualizarTipoComercio = async (req, res) => {
  try {
    const { tipoId } = req.params;
    const { nombre, descripcion } = req.body;

    const tipoComercio = await TipoComercio.findByPk(tipoId);

    if (!tipoComercio) {
      req.flash("error_msg", "Tipo de comercio no encontrado");
      return res.redirect("/admin/tipos-comercios");
    }

    tipoComercio.nombre = nombre;
    tipoComercio.descripcion = descripcion;

    // Si hay un nuevo icono
    if (req.file) {
      tipoComercio.icono = `/uploads/tipos-comercio/${req.file.filename}`;
    }

    await tipoComercio.save();

    req.flash("success_msg", "Tipo de comercio actualizado con éxito");
    res.redirect("/admin/tipos-comercios");
  } catch (error) {
    console.error("Error al actualizar tipo de comercio:", error);
    req.flash("error_msg", "Error al actualizar el tipo de comercio");
    res.redirect("/admin/tipos-comercios");
  }
};

// Renderizar confirmación para eliminar tipo de comercio
export const renderEliminarTipoComercio = async (req, res) => {
  try {
    const { tipoId } = req.params;

    const tipoComercio = await TipoComercio.findByPk(tipoId, {
      include: [
        {
          model: Comercio,
          as: "comercios",
        },
      ],
    });

    if (!tipoComercio) {
      req.flash("error_msg", "Tipo de comercio no encontrado");
      return res.redirect("/admin/tipos-comercios");
    }

    res.render("admin/eliminar-tipo-comercio", {
      tipoComercio,
      cantidadComercios: tipoComercio.comercios.length,
    });
  } catch (error) {
    console.error("Error al cargar confirmación de eliminación:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/admin/tipos-comercios");
  }
};

// Eliminar tipo de comercio
export const eliminarTipoComercio = async (req, res) => {
  try {
    const { tipoId } = req.params;

    const tipoComercio = await TipoComercio.findByPk(tipoId);

    if (!tipoComercio) {
      req.flash("error_msg", "Tipo de comercio no encontrado");
      return res.redirect("/admin/tipos-comercios");
    }

    // Eliminar todos los comercios asociados a este tipo
    await Comercio.destroy({
      where: { tipoComercioId: tipoId },
    });

    // Eliminar el tipo de comercio
    await tipoComercio.destroy();

    req.flash(
      "success_msg",
      "Tipo de comercio y sus comercios asociados eliminados con éxito"
    );
    res.redirect("/admin/tipos-comercios");
  } catch (error) {
    console.error("Error al eliminar tipo de comercio:", error);
    req.flash("error_msg", "Error al eliminar el tipo de comercio");
    res.redirect("/admin/tipos-comercios");
  }
};
