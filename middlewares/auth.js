const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Debes iniciar sesión para acceder a esta página');
    res.redirect('/login');
  };
  
  const checkRole = (roles) => {
    return (req, res, next) => {
      if (!req.session.user) {
        req.flash('error_msg', 'Debes iniciar sesión para acceder a esta página');
        return res.redirect('/login');
      }
  
      if (roles.includes(req.session.user.role)) {
        return next();
      }
  
      req.flash('error_msg', 'No tienes permiso para acceder a esta página');
      res.redirect('/');
    };
  };
  
  const isNotAuthenticated = (req, res, next) => {
    if (!req.session.user) {
      return next();
    }
  
    switch (req.session.user.role) {
      case 'client':
        return res.redirect('/client/home');
      case 'delivery':
        return res.redirect('/delivery/home');
      case 'commerce':
        return res.redirect('/commerce/home');
      case 'admin':
        return res.redirect('/admin/dashboard');
      default:
        return res.redirect('/');
    }
  };
  
  export {
    isAuthenticated,
    checkRole,
    isNotAuthenticated
  };