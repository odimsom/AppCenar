import multer from "multer"
import path from "path"
import { fileURLToPath } from "url"
import fs from "fs"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Configuración para almacenar imágenes de usuarios
const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/uploads/users")
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`)
  },
})

// Configuración para almacenar imágenes de comercios
const comercioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/uploads/comercios")
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `comercio-${Date.now()}${path.extname(file.originalname)}`)
  },
})

// Configuración para almacenar imágenes de productos
const productoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/uploads/productos")
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `producto-${Date.now()}${path.extname(file.originalname)}`)
  },
})

// Configuración para almacenar imágenes de tipos de comercio
const tipoComercioStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/uploads/tipos-comercio")
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    cb(null, `tipo-comercio-${Date.now()}${path.extname(file.originalname)}`)
  },
})

// Filtro para validar que solo se suban imágenes
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/
  const mimetype = filetypes.test(file.mimetype)
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase())

  if (mimetype && extname) {
    return cb(null, true)
  }
  cb(new Error("Error: Solo se permiten imágenes (jpeg, jpg, png, gif)"))
}

// Exportar los middlewares de multer
export const uploadUser = multer({
  storage: userStorage,
  limits: { fileSize: 1000000 }, // 1MB
  fileFilter: fileFilter,
})

export const uploadComercio = multer({
  storage: comercioStorage,
  limits: { fileSize: 1000000 }, // 1MB
  fileFilter: fileFilter,
})

export const uploadProducto = multer({
  storage: productoStorage,
  limits: { fileSize: 1000000 }, // 1MB
  fileFilter: fileFilter,
})

export const uploadTipoComercio = multer({
  storage: tipoComercioStorage,
  limits: { fileSize: 1000000 }, // 1MB
  fileFilter: fileFilter,
})
