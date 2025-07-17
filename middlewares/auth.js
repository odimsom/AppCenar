// Middleware para verificar si el usuario está autenticado
export const checkAuthenticated = (rol) => {
  return (req, res, next) => {
    if (req.session.user) {
      // Si se especifica un rol, verificar que el usuario tenga ese rol
      if (rol && req.session.user.rol !== rol) {
        req.flash("error_msg", "No tienes permiso para acceder a esta página")
        return res.redirect("/")
      }
      return next()
    }

    req.flash("error_msg", "Por favor inicia sesión para acceder")
    res.redirect("/auth/login")
  }
}

// Middleware para verificar si el usuario NO está autenticado
export const checkNotAuthenticated = (req, res, next) => {
  if (req.session.user) {
    // Redirigir al home correspondiente según el rol
    switch (req.session.user.rol) {
      case "cliente":
        return res.redirect("/cliente/home")
      case "comercio":
        return res.redirect("/comercio/home")
      case "delivery":
        return res.redirect("/delivery/home")
      case "admin":
        return res.redirect("/admin/home")
      default:
        return res.redirect("/")
    }
  }
  next()
}
