import models from "../models/index.js";

const {
  Usuario,
  Comercio,
  TipoComercio,
  Producto,
  Categoria,
  Pedido,
  DetallePedido,
  Direccion,
  Configuracion,
  Favorito,
} = models;

// Renderizar home del cliente
export const renderHome = async (req, res) => {
  try {
    const tiposComercio = await TipoComercio.findAll();
    res.render("cliente/home", { tiposComercio });
  } catch (error) {
    console.error("Error al cargar home del cliente:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/");
  }
};

// Renderizar listado de comercios por tipo
export const renderListadoComercios = async (req, res) => {
  try {
    const { tipoId } = req.params;

    // Obtener tipo de comercio
    const tipoComercio = await TipoComercio.findByPk(tipoId);
    if (!tipoComercio) {
      req.flash("error_msg", "Tipo de comercio no encontrado");
      return res.redirect("/cliente/home");
    }

    // Obtener comercios activos de ese tipo
    const comercios = await Comercio.findAll({
      where: {
        tipoComercioId: tipoId,
        activo: true,
      },
    });

    // Obtener favoritos del cliente
    const favoritos = await Favorito.findAll({
      where: { clienteId: req.session.user.id },
      attributes: ["comercioId"],
    });

    const favoritosIds = favoritos.map((fav) => fav.comercioId);

    res.render("cliente/listado-comercios", {
      tipoComercio,
      comercios,
      favoritosIds,
      cantidad: comercios.length,
    });
  } catch (error) {
    console.error("Error al cargar listado de comercios:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/cliente/home");
  }
};

// Renderizar catálogo de productos de un comercio
export const renderCatalogoProductos = async (req, res) => {
  try {
    const { comercioId } = req.params;

    // Obtener comercio
    const comercio = await Comercio.findByPk(comercioId);
    if (!comercio || !comercio.activo) {
      req.flash("error_msg", "Comercio no encontrado o inactivo");
      return res.redirect("/cliente/home");
    }

    // Obtener categorías del comercio con sus productos
    const categorias = await Categoria.findAll({
      where: { comercioId },
      include: [
        {
          model: Producto,
          as: "productos",
        },
      ],
    });

    res.render("cliente/catalogo-productos", {
      comercio,
      categorias,
    });
  } catch (error) {
    console.error("Error al cargar catálogo de productos:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/cliente/home");
  }
};

export const renderCarrito = async (req, res) => {
  try {
    const carrito = req.session.carrito || { productos: [], comercioId: null };

    let comercio = null;
    if (carrito.comercioId) {
      comercio = await Comercio.findByPk(carrito.comercioId);
    }

    const subtotal = carrito.productos.reduce((sum, p) => sum + p.precio, 0);
    const configuracion = await Configuracion.findOne();
    const itbis = configuracion ? Number.parseFloat(configuracion.itbis) : 18.0;
    const total = subtotal + subtotal * (itbis / 100);

    res.render("cliente/carrito", {
      carrito,
      comercio,
      subtotal,
      itbis,
      total,
      user: req.session.user,
    });
  } catch (error) {
    console.error("Error al cargar carrito:", error);
    req.flash("error_msg", "No se pudo cargar el carrito");
    res.redirect("/cliente/home");
  }
};

// Agregar producto al carrito (sesión)
export const agregarAlCarrito = (req, res) => {
  try {
    const { productoId } = req.body;

    // Inicializar carrito si no existe
    if (!req.session.carrito) {
      req.session.carrito = {
        comercioId: null,
        productos: [],
      };
    }

    // Verificar si el producto ya está en el carrito
    const productoExistente = req.session.carrito.productos.find(
      (p) => p.id === Number.parseInt(productoId)
    );

    if (productoExistente) {
      req.flash("error_msg", "Este producto ya está en tu pedido");
      const backURL = req.get("referer") || "/cliente/favoritos";
      return res.redirect(backURL);
    }

    // Obtener producto
    Producto.findByPk(productoId, {
      include: [{ model: Comercio, as: "comercio" }],
    }).then((producto) => {
      if (!producto) {
        req.flash("error_msg", "Producto no encontrado");
        const backURL = req.get("referer") || "/cliente/favoritos";
        return res.redirect(backURL);
      }

      // Si el carrito está vacío, establecer el comercioId
      if (req.session.carrito.productos.length === 0) {
        req.session.carrito.comercioId = producto.comercioId;
      }
      // Si ya hay productos de otro comercio, no permitir agregar
      else if (req.session.carrito.comercioId !== producto.comercioId) {
        req.flash(
          "error_msg",
          "No puedes agregar productos de diferentes comercios en un mismo pedido"
        );
        const backURL = req.get("referer") || "/cliente/favoritos";
        return res.redirect(backURL);
      }

      // Agregar producto al carrito
      req.session.carrito.productos.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: Number.parseFloat(producto.precio),
        imagen: producto.imagen,
      });

      req.flash("success_msg", "Producto agregado al pedido");
      const backURL = req.get("referer") || "/cliente/favoritos";
      res.redirect(backURL);
    });
  } catch (error) {
    console.error("Error al agregar producto al carrito:", error);
    req.flash("error_msg", "Error al agregar producto");
    const backURL = req.get("referer") || "/cliente/favoritos";
    res.redirect(backURL);
  }
};

// Quitar producto del carrito
export const quitarDelCarrito = (req, res) => {
  try {
    const { productoId } = req.params;

    // Verificar si existe el carrito
    if (!req.session.carrito || !req.session.carrito.productos) {
      const backURL = req.get("referer") || "/cliente/favoritos";
      return res.redirect(backURL);
    }

    // Filtrar productos para quitar el seleccionado
    req.session.carrito.productos = req.session.carrito.productos.filter(
      (p) => p.id !== Number.parseInt(productoId)
    );

    // Si no quedan productos, eliminar el comercioId
    if (req.session.carrito.productos.length === 0) {
      req.session.carrito.comercioId = null;
    }

    req.flash("success_msg", "Producto eliminado del pedido");
    const backURL = req.get("referer") || "/cliente/favoritos";
    res.redirect(backURL);
  } catch (error) {
    console.error("Error al quitar producto del carrito:", error);
    req.flash("error_msg", "Error al quitar producto");
    const backURL = req.get("referer") || "/cliente/favoritos";
    res.redirect(backURL);
  }
};

// Renderizar selección de dirección para el pedido
export const renderSeleccionDireccion = async (req, res) => {
  try {
    // Verificar si hay productos en el carrito
    if (!req.session.carrito || req.session.carrito.productos.length === 0) {
      req.flash("error_msg", "No hay productos en tu pedido");
      const backURL = req.get("referer") || "/cliente/favoritos";
      return res.redirect(backURL);
    }

    // Obtener comercio
    const comercio = await Comercio.findByPk(req.session.carrito.comercioId);
    if (!comercio) {
      req.flash("error_msg", "Comercio no encontrado");
      return res.redirect("/cliente/home");
    }

    // Obtener direcciones del cliente
    const direcciones = await Direccion.findAll({
      where: { usuarioId: req.session.user.id },
    });

    // Calcular subtotal
    const subtotal = req.session.carrito.productos.reduce(
      (total, producto) => total + producto.precio,
      0
    );

    // Obtener configuración para el ITBIS
    const configuracion = await Configuracion.findOne();
    const itbis = configuracion ? Number.parseFloat(configuracion.itbis) : 18.0;

    // Calcular total
    const total = subtotal + subtotal * (itbis / 100);

    res.render("cliente/seleccion-direccion", {
      comercio,
      direcciones,
      subtotal,
      itbis,
      total,
      carrito: req.session.carrito,
    });
  } catch (error) {
    console.error("Error al cargar selección de dirección:", error);
    req.flash("error_msg", "Error al cargar la página");
    const backURL = req.get("referer") || "/cliente/favoritos";
    res.redirect(backURL);
  }
};

// Crear pedido
export const crearPedido = async (req, res) => {
  try {
    const { direccionId } = req.body;

    // Verificar si hay productos en el carrito
    if (!req.session.carrito || req.session.carrito.productos.length === 0) {
      req.flash("error_msg", "No hay productos en tu pedido");
      const backURL = req.get("referer") || "/cliente/favoritos";
      return res.redirect(backURL);
    }

    // Verificar dirección
    const direccion = await Direccion.findOne({
      where: {
        id: direccionId,
        usuarioId: req.session.user.id,
      },
    });

    if (!direccion) {
      req.flash("error_msg", "Dirección no válida");
      const backURL = req.get("referer") || "/cliente/favoritos";
      return res.redirect(backURL);
    }

    // Calcular subtotal
    const subtotal = req.session.carrito.productos.reduce(
      (total, producto) => total + producto.precio,
      0
    );

    // Obtener configuración para el ITBIS
    const configuracion = await Configuracion.findOne();
    const itbis = configuracion ? Number.parseFloat(configuracion.itbis) : 18.0;

    // Calcular total
    const total = subtotal + subtotal * (itbis / 100);

    // Crear pedido
    const pedido = await Pedido.create({
      clienteId: req.session.user.id,
      comercioId: req.session.carrito.comercioId,
      direccionId,
      subtotal,
      total,
      estado: "pendiente",
      fecha: new Date(),
    });

    // Crear detalles del pedido
    for (const producto of req.session.carrito.productos) {
      await DetallePedido.create({
        pedidoId: pedido.id,
        productoId: producto.id,
        precio: producto.precio,
      });
    }

    // Limpiar carrito
    req.session.carrito = {
      comercioId: null,
      productos: [],
    };

    req.flash("success_msg", "Pedido realizado con éxito");
    res.redirect("/cliente/home");
  } catch (error) {
    console.error("Error al crear pedido:", error);
    req.flash("error_msg", "Error al crear el pedido");
    const backURL = req.get("referer") || "/cliente/favoritos";
    res.redirect(backURL);
  }
};

// Renderizar perfil del cliente
export const renderPerfil = (req, res) => {
  try {
    res.render("cliente/perfil", { usuario: req.session.user });
  } catch (error) {
    console.error("Error al cargar perfil:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/cliente/home");
  }
};

// Actualizar perfil del cliente
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
    req.session.user.telefono = telefono;
    if (req.file) {
      req.session.user.foto = usuario.foto;
    }

    req.flash("success_msg", "Perfil actualizado con éxito");
    res.redirect("/cliente/perfil");
  } catch (error) {
    console.error("Error al actualizar perfil:", error);
    req.flash("error_msg", "Error al actualizar el perfil");
    res.redirect("/cliente/perfil");
  }
};

// Renderizar listado de pedidos del cliente
export const renderPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      where: { clienteId: req.session.user.id },
      include: [
        { model: Comercio, as: "comercio" },
        { model: DetallePedido, as: "detalles" },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.render("cliente/pedidos", { pedidos });
  } catch (error) {
    console.error("Error al cargar pedidos:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/cliente/home");
  }
};

// Renderizar detalle de un pedido
export const renderDetallePedido = async (req, res) => {
  try {
    const { pedidoId } = req.params;

    const pedido = await Pedido.findOne({
      where: {
        id: pedidoId,
        clienteId: req.session.user.id,
      },
      include: [
        { model: Comercio, as: "comercio" },
        {
          model: DetallePedido,
          as: "detalles",
          include: [{ model: Producto, as: "producto" }],
        },
      ],
    });

    if (!pedido) {
      req.flash("error_msg", "Pedido no encontrado");
      return res.redirect("/cliente/pedidos");
    }

    res.render("cliente/detalle-pedido", { pedido });
  } catch (error) {
    console.error("Error al cargar detalle del pedido:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/cliente/pedidos");
  }
};

// Renderizar listado de direcciones
export const renderDirecciones = async (req, res) => {
  try {
    const direcciones = await Direccion.findAll({
      where: { usuarioId: req.session.user.id },
    });

    res.render("cliente/direcciones", { direcciones });
  } catch (error) {
    console.error("Error al cargar direcciones:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/cliente/home");
  }
};

// Renderizar formulario para crear dirección
export const renderCrearDireccion = (req, res) => {
  res.render("cliente/crear-direccion");
};

// Crear dirección
export const crearDireccion = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    await Direccion.create({
      nombre,
      descripcion,
      usuarioId: req.session.user.id,
    });

    req.flash("success_msg", "Dirección creada con éxito");
    res.redirect("/cliente/direcciones");
  } catch (error) {
    console.error("Error al crear dirección:", error);
    req.flash("error_msg", "Error al crear la dirección");
    res.redirect("/cliente/direcciones/crear");
  }
};

// Renderizar formulario para editar dirección
export const renderEditarDireccion = async (req, res) => {
  try {
    const { direccionId } = req.params;

    const direccion = await Direccion.findOne({
      where: {
        id: direccionId,
        usuarioId: req.session.user.id,
      },
    });

    if (!direccion) {
      req.flash("error_msg", "Dirección no encontrada");
      return res.redirect("/cliente/direcciones");
    }

    res.render("cliente/editar-direccion", { direccion });
  } catch (error) {
    console.error("Error al cargar edición de dirección:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/cliente/direcciones");
  }
};

// Actualizar dirección
export const actualizarDireccion = async (req, res) => {
  try {
    const { direccionId } = req.params;
    const { nombre, descripcion } = req.body;

    const direccion = await Direccion.findOne({
      where: {
        id: direccionId,
        usuarioId: req.session.user.id,
      },
    });

    if (!direccion) {
      req.flash("error_msg", "Dirección no encontrada");
      return res.redirect("/cliente/direcciones");
    }

    direccion.nombre = nombre;
    direccion.descripcion = descripcion;
    await direccion.save();

    req.flash("success_msg", "Dirección actualizada con éxito");
    res.redirect("/cliente/direcciones");
  } catch (error) {
    console.error("Error al actualizar dirección:", error);
    req.flash("error_msg", "Error al actualizar la dirección");
    res.redirect("/cliente/direcciones");
  }
};

// Renderizar confirmación para eliminar dirección
export const renderEliminarDireccion = async (req, res) => {
  try {
    const { direccionId } = req.params;

    const direccion = await Direccion.findOne({
      where: {
        id: direccionId,
        usuarioId: req.session.user.id,
      },
    });

    if (!direccion) {
      req.flash("error_msg", "Dirección no encontrada");
      return res.redirect("/cliente/direcciones");
    }

    res.render("cliente/eliminar-direccion", { direccion });
  } catch (error) {
    console.error("Error al cargar confirmación de eliminación:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/cliente/direcciones");
  }
};

// Eliminar dirección
export const eliminarDireccion = async (req, res) => {
  try {
    const { direccionId } = req.params;

    const direccion = await Direccion.findOne({
      where: {
        id: direccionId,
        usuarioId: req.session.user.id,
      },
    });

    if (!direccion) {
      req.flash("error_msg", "Dirección no encontrada");
      return res.redirect("/cliente/direcciones");
    }

    await direccion.destroy();

    req.flash("success_msg", "Dirección eliminada con éxito");
    res.redirect("/cliente/direcciones");
  } catch (error) {
    console.error("Error al eliminar dirección:", error);
    req.flash("error_msg", "Error al eliminar la dirección");
    res.redirect("/cliente/direcciones");
  }
};

// Renderizar listado de favoritos
export const renderFavoritos = async (req, res) => {
  try {
    const favoritos = await Favorito.findAll({
      where: { clienteId: req.session.user.id },
      include: [{ model: Comercio, as: "comercio" }],
    });

    res.render("cliente/favoritos", { favoritos });
  } catch (error) {
    console.error("Error al cargar favoritos:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/cliente/home");
  }
};

// Agregar comercio a favoritos
export const agregarFavorito = async (req, res) => {
  try {
    const { comercioId } = req.params;
    const clienteId = req.session.user.id;

    // Verify the comercio exists
    const comercio = await Comercio.findByPk(comercioId);
    if (!comercio) {
      req.flash("error_msg", "Comercio no encontrado");
      return res.redirect("back");
    }

    // Verify the user exists
    const cliente = await Usuario.findByPk(clienteId);
    if (!cliente) {
      req.flash("error_msg", "Usuario no encontrado");
      return res.redirect("/cliente/favoritos");
    }

    // Verificar si ya existe el favorito
    const favoritoExistente = await Favorito.findOne({
      where: {
        clienteId,
        comercioId,
      },
    });

    if (favoritoExistente) {
      req.flash("error_msg", "Este comercio ya está en tus favoritos");
      return res.redirect("/cliente/favoritos");
    }

    // Crear favorito
    await Favorito.create({
      clienteId,
      comercioId,
    });

    req.flash("success_msg", "Comercio agregado a favoritos");
    return res.redirect("/cliente/favoritos");
  } catch (error) {
    console.error("Error al agregar favorito:", error);
    req.flash("error_msg", "Error al agregar a favoritos");
    return res.redirect("/cliente/favoritos");
  }
};

// Eliminar comercio de favoritos
export const eliminarFavorito = async (req, res) => {
  try {
    const { comercioId } = req.params;

    await Favorito.destroy({
      where: {
        clienteId: req.session.user.id,
        comercioId,
      },
    });

    req.flash("success_msg", "Comercio eliminado de favoritos");
    return res.redirect("/cliente/favoritos");
  } catch (error) {
    console.error("Error al eliminar favorito:", error);
    req.flash("error_msg", "Error al eliminar de favoritos");
    return res.redirect("/cliente/favoritos");
  }
};
