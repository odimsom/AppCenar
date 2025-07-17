import express from "express"

const router = express.Router()

// Ruta principal
router.get("/", (req, res) => {
  if (req.session.user) {
    const { rol } = req.session.user
    switch (rol) {
      case "cliente":
        return res.redirect("/cliente/home")
      case "comercio":
        return res.redirect("/comercio/home")
      case "delivery":
        return res.redirect("/delivery/home")
      case "admin":
        return res.redirect("/admin/home")
      default:
        return res.render("index")
    }
  } else {
    res.redirect("/auth/login")
  }
})

export default router
