import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.join(__dirname, "..")

// Create necessary directories
const directories = [
  "views",
  "views/auth",
  "views/cliente",
  "views/comercio",
  "views/delivery",
  "views/admin",
  "views/error",
  "views/layouts",
  "public",
  "public/css",
  "public/js",
  "public/uploads",
  "public/uploads/users",
  "public/uploads/comercios",
  "public/uploads/productos",
  "public/uploads/tipos-comercio",
  "database",
]

// Create directories
directories.forEach((dir) => {
  const fullPath = path.join(rootDir, dir)
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true })
    console.log(`Directory created: ${fullPath}`)
  } else {
    console.log(`Directory already exists: ${fullPath}`)
  }
})

console.log("All directories created successfully!")
