import { Sequelize } from "sequelize"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

// Set up __dirname in ES module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure database directory exists
const dbDir = path.join(__dirname, "..", "database")
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true })
}

// Create Sequelize instance with SQLite
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: path.join(dbDir, "appcenar.sqlite"),
  logging: false,
})

// Import models
import UsuarioModel from "./usuario.js"
import ComercioModel from "./comercio.js"
import TipoComercioModel from "./tipoComercio.js"
import CategoriaModel from "./categoria.js"
import ProductoModel from "./producto.js"
import PedidoModel from "./pedido.js"
import DetallePedidoModel from "./detallePedido.js"
import DireccionModel from "./direccion.js"
import ConfiguracionModel from "./configuracion.js"
import FavoritoModel from "./favorito.js"

// Initialize models
const Usuario = UsuarioModel(sequelize)
const Comercio = ComercioModel(sequelize)
const TipoComercio = TipoComercioModel(sequelize)
const Categoria = CategoriaModel(sequelize)
const Producto = ProductoModel(sequelize)
const Pedido = PedidoModel(sequelize)
const DetallePedido = DetallePedidoModel(sequelize)
const Direccion = DireccionModel(sequelize)
const Configuracion = ConfiguracionModel(sequelize)
const Favorito = FavoritoModel(sequelize)

// Define associations
TipoComercio.hasMany(Comercio, { foreignKey: "tipoComercioId", as: "comercios" })
Comercio.belongsTo(TipoComercio, { foreignKey: "tipoComercioId", as: "tipoComercio" })

Comercio.hasMany(Categoria, { foreignKey: "comercioId", as: "categorias" })
Categoria.belongsTo(Comercio, { foreignKey: "comercioId", as: "comercio" })

Comercio.hasMany(Producto, { foreignKey: "comercioId", as: "productos" })
Producto.belongsTo(Comercio, { foreignKey: "comercioId", as: "comercio" })

Categoria.hasMany(Producto, { foreignKey: "categoriaId", as: "productos" })
Producto.belongsTo(Categoria, { foreignKey: "categoriaId", as: "categoria" })

Usuario.hasMany(Direccion, { foreignKey: "usuarioId", as: "direcciones" })
Direccion.belongsTo(Usuario, { foreignKey: "usuarioId", as: "usuario" })

Usuario.hasMany(Pedido, { foreignKey: "clienteId", as: "pedidosCliente" })
Pedido.belongsTo(Usuario, { foreignKey: "clienteId", as: "cliente" })

Usuario.hasMany(Pedido, { foreignKey: "deliveryId", as: "pedidosDelivery" })
Pedido.belongsTo(Usuario, { foreignKey: "deliveryId", as: "delivery" })

Comercio.hasMany(Pedido, { foreignKey: "comercioId", as: "pedidos" })
Pedido.belongsTo(Comercio, { foreignKey: "comercioId", as: "comercio" })

Direccion.hasMany(Pedido, { foreignKey: "direccionId", as: "pedidos" })
Pedido.belongsTo(Direccion, { foreignKey: "direccionId", as: "direccion" })

Pedido.hasMany(DetallePedido, { foreignKey: "pedidoId", as: "detalles" })
DetallePedido.belongsTo(Pedido, { foreignKey: "pedidoId", as: "pedido" })

Producto.hasMany(DetallePedido, { foreignKey: "productoId", as: "detalles" })
DetallePedido.belongsTo(Producto, { foreignKey: "productoId", as: "producto" })

Usuario.hasMany(Favorito, {
  foreignKey: "clienteId",
  as: "favoritos",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

Favorito.belongsTo(Usuario, {
  foreignKey: "clienteId",
  as: "cliente",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

Comercio.hasMany(Favorito, {
  foreignKey: "comercioId",
  as: "favoritos",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

Favorito.belongsTo(Comercio, {
  foreignKey: "comercioId",
  as: "comercio",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
})

// Export models and Sequelize instance
const models = {
  Usuario,
  Comercio,
  TipoComercio,
  Categoria,
  Producto,
  Pedido,
  DetallePedido,
  Direccion,
  Configuracion,
  Favorito,
  sequelize,
  Sequelize,
}

export { sequelize, Sequelize }
export default models
