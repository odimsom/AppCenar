import models from "../models/index.js";

const { Usuario, Comercio, Pedido, DetallePedido, Producto, Direccion } =
  models;

// Renderizar home del delivery
export const renderHome = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      where: { deliveryId: req.session.user.id },
      include: [
        { model: Comercio, as: "comercio" },
        { model: DetallePedido, as: "detalles" },
      ],
      order: [["createdAt", "DESC"]],
    });

    const user = await Usuario.findByPk(req.session.user.id);

    res.render("delivery/home", { pedidos, user });
  } catch (error) {
    console.error("Error al cargar home del delivery:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/");
  }
};

// Renderizar detalle de un pedido
export const renderDetallePedido = async (req, res) => {
  try {
    const { pedidoId } = req.params;

    const pedido = await Pedido.findOne({
      where: {
        id: pedidoId,
        deliveryId: req.session.user.id,
      },
      include: [
        { model: Comercio, as: "comercio" },
        {
          model: DetallePedido,
          as: "detalles",
          include: [{ model: Producto, as: "producto" }],
        },
        { model: Direccion, as: "direccion" },
      ],
    });

    if (!pedido) {
      req.flash("error_msg", "Pedido no encontrado");
      return res.redirect("/delivery/home");
    }

    res.render("delivery/detalle-pedido", { pedido });
  } catch (error) {
    console.error("Error al cargar detalle del pedido:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/delivery/home");
  }
};

// Completar pedido
export const completarPedido = async (req, res) => {
  try {
    const { pedidoId } = req.params;

    const pedido = await Pedido.findOne({
      where: {
        id: pedidoId,
        deliveryId: req.session.user.id,
        estado: "en proceso",
      },
    });

    if (!pedido) {
      req.flash("error_msg", "Pedido no encontrado o no está en proceso");
      return res.redirect("/delivery/home");
    }

    // Actualizar pedido
    pedido.estado = "completado";
    await pedido.save();

    // Actualizar estado del delivery
    const delivery = await Usuario.findByPk(req.session.user.id);
    delivery.estado = "disponible";
    await delivery.save();

    req.flash("success_msg", "Pedido completado con éxito");
    res.redirect("/delivery/home");
  } catch (error) {
    console.error("Error al completar pedido:", error);
    req.flash("error_msg", "Error al completar el pedido");
    res.redirect("/delivery/home");
  }
};

// Renderizar perfil del delivery
export const renderPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.session.user.id);

    res.render("delivery/perfil", { usuario });
  } catch (error) {
    console.error("Error al cargar perfil:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/delivery/home");
  }
};

// Actualizar perfil del delivery
export const actualizarPerfil = async (req, res) => {
  try {
    const { nombre, apellido, telefono } = req.body;

    // Actualizar usuario
    const usuario = await Usuario.findByPk(req.session.user.id);

    usuario.nombre = nombre;
    usuario.apellido = apellido;
    usuario.telefono = telefono;

    // Si hay una nueva foto
    if (req.file) {
      usuario.foto = `/uploads/users/${req.file.filename}`;
    }

    await usuario.save();

    // Actualizar sesión
    req.session.user.nombre = nombre;
    req.session.user.apellido = apellido;
    if (req.file) {
      req.session.user.foto = usuario.foto;
    }

    req.flash("success_msg", "Perfil actualizado con éxito");
    res.redirect("/delivery/perfil");
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    req.flash("error_msg", "Error al actualizar el perfil");
    res.redirect("/delivery/perfil");
  }
};
