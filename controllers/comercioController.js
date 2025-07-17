import models from "../models/index.js"

const { Comercio, Categoria, Producto, Pedido, DetallePedido, Usuario } = models

// Renderizar home del comercio
export const renderHome = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      where: { comercioId: req.session.user.id },
      include: [
        { model: Usuario, as: "cliente" },
        { model: DetallePedido, as: "detalles" },
      ],
      order: [["createdAt", "DESC"]],
    })

    res.render("comercio/home", { pedidos })
  } catch (error) {
    console.error("Error al cargar home del comercio:", error)
    req.flash("error_msg", "Error al cargar la página")
    res.redirect("/")
  }
}

// Renderizar detalle de un pedido
export const renderDetallePedido = async (req, res) => {
  try {
    const { pedidoId } = req.params

    const pedido = await Pedido.findOne({
      where: {
        id: pedidoId,
        comercioId: req.session.user.id,
      },
      include: [
        { model: Usuario, as: "cliente" },
        { model: Usuario, as: "delivery" },
        {
          model: DetallePedido,
          as: "detalles",
          include: [{ model: Producto, as: "producto" }],
        },
      ],
    })

    if (!pedido) {
      req.flash("error_msg", "Pedido no encontrado")
      return res.redirect("/comercio/home")
    }

    // Obtener deliveries disponibles
    const deliveriesDisponibles = await Usuario.findAll({
      where: {
        rol: "delivery",
        activo: true,
        estado: "disponible",
      },
    })

    res.render("comercio/detalle-pedido", {
      pedido,
      deliveriesDisponibles,
    })
  } catch (error) {
    console.error("Error al cargar detalle del pedido:", error)
    req.flash("error_msg", "Error al cargar la página")
    res.redirect("/comercio/home")
  }
}

// Asignar delivery a un pedido
export const asignarDelivery = async (req, res) => {
  try {
    const { pedidoId } = req.params
    const { deliveryId } = req.body

    // Verificar pedido
    const pedido = await Pedido.findOne({
      where: {
        id: pedidoId,
        comercioId: req.session.user.id,
        estado: "pendiente",
      },
    })

    if (!pedido) {
      req.flash("error_msg", "Pedido no encontrado o no está pendiente")
      return res.redirect("/comercio/home")
    }

    // Verificar delivery
    const delivery = await Usuario.findOne({
      where: {
        id: deliveryId,
        rol: "delivery",
        activo: true,
        estado: "disponible",
      },
    })

    if (!delivery) {
      req.flash("error_msg", "Delivery no disponible")
      return res.redirect(`/comercio/pedidos/${pedidoId}`)
    }

    // Actualizar pedido
    pedido.deliveryId = deliveryId
    pedido.estado = "en proceso"
    await pedido.save()

    // Actualizar estado del delivery
    delivery.estado = "ocupado"
    await delivery.save()

    req.flash("success_msg", "Delivery asignado con éxito")
    res.redirect("/comercio/home")
  } catch (error) {
    console.error("Error al asignar delivery:", error)
    req.flash("error_msg", "Error al asignar delivery")
    res.redirect(`/comercio/pedidos/${req.params.pedidoId}`)
  }
}

// Renderizar perfil del comercio
export const renderPerfil = async (req, res) => {
  try {
    const comercio = await Comercio.findByPk(req.session.user.id)

    res.render("comercio/perfil", { comercio })
  } catch (error) {
    console.error("Error al cargar perfil:", error)
    req.flash("error_msg", "Error al cargar la página")
    res.redirect("/comercio/home")
  }
}

// Actualizar perfil del comercio
export const actualizarPerfil = async (req, res) => {
  try {
    const { telefono, correo, horaApertura, horaCierre } = req.body

    // Actualizar comercio
    const comercio = await Comercio.findByPk(req.session.user.id)

    comercio.telefono = telefono
    comercio.correo = correo
    comercio.horaApertura = horaApertura
    comercio.horaCierre = horaCierre

    // Si hay un nuevo logo
    if (req.file) {
      comercio.logo = `/uploads/comercios/${req.file.filename}`
    }

    await comercio.save()

    // Actualizar sesión
    req.session.user.correo = correo
    if (req.file) {
      req.session.user.logo = comercio.logo
    }

    req.flash("success_msg", "Perfil actualizado con éxito")
    res.redirect("/comercio/perfil")
  } catch (error) {
    console.error("Error al actualizar perfil:", error)
    req.flash("error_msg", "Error al actualizar el perfil")
    res.redirect("/comercio/perfil")
  }
}

// Renderizar listado de categorías
export const renderCategorias = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { comercioId: req.session.user.id },
      include: [{ model: Producto, as: "productos" }],
    })

    res.render("comercio/categorias", { categorias })
  } catch (error) {
    console.error("Error al cargar categorías:", error)
    req.flash("error_msg", "Error al cargar la página")
    res.redirect("/comercio/home")
  }
}

// Renderizar formulario para crear categoría
export const renderCrearCategoria = (req, res) => {
  res.render("comercio/crear-categoria")
}

// Crear categoría
export const crearCategoria = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body

    await Categoria.create({
      nombre,
      descripcion,
      comercioId: req.session.user.id,
    })

    req.flash("success_msg", "Categoría creada con éxito")
    res.redirect("/comercio/categorias")
  } catch (error) {
    console.error("Error al crear categoría:", error)
    req.flash("error_msg", "Error al crear la categoría")
    res.redirect("/comercio/categorias/crear")
  }
}

// Renderizar formulario para editar categoría
export const renderEditarCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params

    const categoria = await Categoria.findOne({
      where: {
        id: categoriaId,
        comercioId: req.session.user.id,
      },
    })

    if (!categoria) {
      req.flash("error_msg", "Categoría no encontrada")
      return res.redirect("/comercio/categorias")
    }

    res.render("comercio/editar-categoria", { categoria })
  } catch (error) {
    console.error("Error al cargar edición de categoría:", error)
    req.flash("error_msg", "Error al cargar la página")
    res.redirect("/comercio/categorias")
  }
}

// Actualizar categoría
export const actualizarCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params
    const { nombre, descripcion } = req.body

    const categoria = await Categoria.findOne({
      where: {
        id: categoriaId,
        comercioId: req.session.user.id,
      },
    })

    if (!categoria) {
      req.flash("error_msg", "Categoría no encontrada")
      return res.redirect("/comercio/categorias")
    }

    categoria.nombre = nombre
    categoria.descripcion = descripcion
    await categoria.save()

    req.flash("success_msg", "Categoría actualizada con éxito")
    res.redirect("/comercio/categorias")
  } catch (error) {
    console.error("Error al actualizar categoría:", error)
    req.flash("error_msg", "Error al actualizar la categoría")
    res.redirect("/comercio/categorias")
  }
}

// Renderizar confirmación para eliminar categoría
export const renderEliminarCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params

    const categoria = await Categoria.findOne({
      where: {
        id: categoriaId,
        comercioId: req.session.user.id,
      },
    })

    if (!categoria) {
      req.flash("error_msg", "Categoría no encontrada")
      return res.redirect("/comercio/categorias")
    }

    res.render("comercio/eliminar-categoria", { categoria })
  } catch (error) {
    console.error("Error al cargar confirmación de eliminación:", error)
    req.flash("error_msg", "Error al cargar la página")
    res.redirect("/comercio/categorias")
  }
}

// Eliminar categoría
export const eliminarCategoria = async (req, res) => {
  try {
    const { categoriaId } = req.params

    const categoria = await Categoria.findOne({
      where: {
        id: categoriaId,
        comercioId: req.session.user.id,
      },
    })

    if (!categoria) {
      req.flash("error_msg", "Categoría no encontrada")
      return res.redirect("/comercio/categorias")
    }

    await categoria.destroy()

    req.flash("success_msg", "Categoría eliminada con éxito")
    res.redirect("/comercio/categorias")
  } catch (error) {
    console.error("Error al eliminar categoría:", error)
    req.flash("error_msg", "Error al eliminar la categoría")
    res.redirect("/comercio/categorias")
  }
}

// Renderizar listado de productos
export const renderProductos = async (req, res) => {
  try {
    const productos = await Producto.findAll({
      where: { comercioId: req.session.user.id },
      include: [{ model: Categoria, as: "categoria" }],
    })

    res.render("comercio/productos", { productos })
  } catch (error) {
    console.error("Error al cargar productos:", error)
    req.flash("error_msg", "Error al cargar la página")
    res.redirect("/comercio/home")
  }
}

// Renderizar formulario para crear producto
export const renderCrearProducto = async (req, res) => {
  try {
    const categorias = await Categoria.findAll({
      where: { comercioId: req.session.user.id },
    })

    res.render("comercio/crear-producto", { categorias })
  } catch (error) {
    console.error("Error al cargar formulario de creación:", error)
    req.flash("error_msg", "Error al cargar la página")
    res.redirect("/comercio/productos")
  }
}

// Crear producto
export const crearProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precio, categoriaId } = req.body

    // Verificar que se haya subido una imagen
    if (!req.file) {
      req.flash("error_msg", "Debes subir una imagen para el producto")
      return res.redirect("/comercio/productos/crear")
    }

    // Verificar que la categoría pertenezca al comercio
    const categoria = await Categoria.findOne({
      where: {
        id: categoriaId,
        comercioId: req.session.user.id,
      },
    })

    if (!categoria) {
      req.flash("error_msg", "Categoría no válida")
      return res.redirect("/comercio/productos/crear")
    }

    await Producto.create({
      nombre,
      descripcion,
      precio,
      categoriaId,
      comercioId: req.session.user.id,
      imagen: `/uploads/productos/${req.file.filename}`,
    })

    req.flash("success_msg", "Producto creado con éxito")
    res.redirect("/comercio/productos")
  } catch (error) {
    console.error("Error al crear producto:", error)
    req.flash("error_msg", "Error al crear el producto")
    res.redirect("/comercio/productos/crear")
  }
}

// Renderizar formulario para editar producto
export const renderEditarProducto = async (req, res) => {
  try {
    const { productoId } = req.params

    const producto = await Producto.findOne({
      where: {
        id: productoId,
        comercioId: req.session.user.id,
      },
    })

    if (!producto) {
      req.flash("error_msg", "Producto no encontrado")
      return res.redirect("/comercio/productos")
    }

    const categorias = await Categoria.findAll({
      where: { comercioId: req.session.user.id },
    })

    res.render("comercio/editar-producto", { producto, categorias })
  } catch (error) {
    console.error("Error al cargar edición de producto:", error)
    req.flash("error_msg", "Error al cargar la página")
    res.redirect("/comercio/productos")
  }
}

// Actualizar producto
export const actualizarProducto = async (req, res) => {
  try {
    const { productoId } = req.params
    const { nombre, descripcion, precio, categoriaId } = req.body

    const producto = await Producto.findOne({
      where: {
        id: productoId,
        comercioId: req.session.user.id,
      },
    })

    if (!producto) {
      req.flash("error_msg", "Producto no encontrado")
      return res.redirect("/comercio/productos")
    }

    // Verificar que la categoría pertenezca al comercio
    const categoria = await Categoria.findOne({
      where: {
        id: categoriaId,
        comercioId: req.session.user.id,
      },
    })

    if (!categoria) {
      req.flash("error_msg", "Categoría no válida")
      return res.redirect(`/comercio/productos/editar/${productoId}`)
    }

    producto.nombre = nombre
    producto.descripcion = descripcion
    producto.precio = precio
    producto.categoriaId = categoriaId

    // Si hay una nueva imagen
    if (req.file) {
      producto.imagen = `/uploads/productos/${req.file.filename}`
    }

    await producto.save()

    req.flash("success_msg", "Producto actualizado con éxito")
    res.redirect("/comercio/productos")
  } catch (error) {
    console.error("Error al actualizar producto:", error)
    req.flash("error_msg", "Error al actualizar el producto")
    res.redirect("/comercio/productos")
  }
}

// Renderizar confirmación para eliminar producto
export const renderEliminarProducto = async (req, res) => {
  try {
    const { productoId } = req.params

    const producto = await Producto.findOne({
      where: {
        id: productoId,
        comercioId: req.session.user.id,
      },
    })

    if (!producto) {
      req.flash("error_msg", "Producto no encontrado")
      return res.redirect("/comercio/productos")
    }

    res.render("comercio/eliminar-producto", { producto })
  } catch (error) {
    console.error("Error al cargar confirmación de eliminación:", error)
    req.flash("error_msg", "Error al cargar la página")
    res.redirect("/comercio/productos")
  }
}

// Eliminar producto
export const eliminarProducto = async (req, res) => {
  try {
    const { productoId } = req.params

    const producto = await Producto.findOne({
      where: {
        id: productoId,
        comercioId: req.session.user.id,
      },
    })

    if (!producto) {
      req.flash("error_msg", "Producto no encontrado")
      return res.redirect("/comercio/productos")
    }

    await producto.destroy()

    req.flash("success_msg", "Producto eliminado con éxito")
    res.redirect("/comercio/productos")
  } catch (error) {
    console.error("Error al eliminar producto:", error)
    req.flash("error_msg", "Error al eliminar el producto")
    res.redirect("/comercio/productos")
  }
}
