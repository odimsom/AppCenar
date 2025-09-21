import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tamaño máximo de archivo: 5MB
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

// Función para crear storage dinámico
const createStorage = (folderName, prefix) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(__dirname, `../public/uploads/${folderName}`);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      cb(null, `${prefix}-${Date.now()}${path.extname(file.originalname)}`);
    },
  });
};

// Filtro para validar imágenes
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Error: Solo se permiten imágenes (jpeg, jpg, png, gif)"));
};

// Middlewares de subida
export const uploadUser = multer({
  storage: createStorage("users", "user"),
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

export const uploadComercio = multer({
  storage: createStorage("comercios", "comercio"),
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

export const uploadProducto = multer({
  storage: createStorage("productos", "producto"),
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

export const uploadTipoComercio = multer({
  storage: createStorage("tipos-comercio", "tipo-comercio"),
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

// Middleware para manejar errores de multer
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Error de Multer (archivo demasiado grande, etc.)
    return res.status(400).json({ error: err.message });
  } else if (err) {
    // Otros errores
    return res.status(400).json({ error: err.message });
  }
  next();
};
