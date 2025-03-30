import { 
    userRepository, 
    commerceRepository, 
    commerceTypeRepository
  } from '../repositories/index.js';
  import { User, Commerce, CommerceType, Configuration } from '../models/index.js';
  
  // Página de dashboard
  const getDashboard = async (req, res) => {
    try {
      // Estadísticas
      const totalClients = await userRepository.count({
        where: { role: 'client' }
      });
      
      const totalDeliveries = await userRepository.count({
        where: { role: 'delivery' }
      });
      
      const totalCommerces = await commerceRepository.count();
      
      const totalCommerceTypes = await commerceTypeRepository.count();
      
      res.render('admin/dashboard', {
        title: 'Dashboard',
        active: 'dashboard',
        customCSS: 'admin',
        user: req.session.user,
        stats: {
          totalClients,
          totalDeliveries,
          totalCommerces,
          totalCommerceTypes
        }
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar el dashboard');
      res.redirect('/');
    }
  };
  
  // Página de usuarios
  const getUsers = async (req, res) => {
    try {
      const clients = await userRepository.findAll({
        where: { role: 'client' }
      });
      
      const deliveries = await userRepository.findAll({
        where: { role: 'delivery' }
      });
      
      res.render('admin/users', {
        title: 'Usuarios',
        active: 'users',
        customCSS: 'admin',
        user: req.session.user,
        clients,
        deliveries
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar los usuarios');
      res.redirect('/admin/dashboard');
    }
  };
  
  // Página de comercios
  const getCommerces = async (req, res) => {
    try {
      const commerces = await commerceRepository.findAll({
        include: [
          {
            model: User
          },
          {
            model: CommerceType
          }
        ]
      });
      
      res.render('admin/commerces', {
        title: 'Comercios',
        active: 'commerces',
        customCSS: 'admin',
        user: req.session.user,
        commerces
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar los comercios');
      res.redirect('/admin/dashboard');
    }
  };
  
  // Página de tipos de comercio
  const getCommerceTypes = async (req, res) => {
    try {
      const commerceTypes = await commerceTypeRepository.findAll();
      
      res.render('admin/commerce-types', {
        title: 'Tipos de Comercio',
        active: 'commerce-types',
        customCSS: 'admin',
        user: req.session.user,
        commerceTypes
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar los tipos de comercio');
      res.redirect('/admin/dashboard');
    }
  };
  
  // Página de configuración
  const getConfiguration = async (req, res) => {
    try {
      const configuration = await Configuration.findOne();
      
      res.render('admin/configuration', {
        title: 'Configuración',
        active: 'configuration',
        customCSS: 'admin',
        user: req.session.user,
        configuration
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar la configuración');
      res.redirect('/admin/dashboard');
    }
  };
  
  // Activar/desactivar usuario
  const toggleUserStatus = async (req, res) => {
    try {
      const { id } = req.params;
      
      const user = await userRepository.findById(id);
      
      if (!user) {
        req.flash('error_msg', 'Usuario no encontrado');
        return res.redirect('/admin/users');
      }
      
      await userRepository.update(id, {
        active: !user.active
      });
      
      req.flash('success_msg', `Usuario ${user.active ? 'desactivado' : 'activado'} exitosamente`);
      res.redirect('/admin/users');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cambiar el estado del usuario');
      res.redirect('/admin/users');
    }
  };
  
  // Agregar tipo de comercio
  const addCommerceType = async (req, res) => {
    try {
      const { name, description } = req.body;
      let icon = null;
      
      // Si se subió un icono
      if (req.file) {
        icon = `/uploads/icons/${req.file.filename}`;
      }
      
      await commerceTypeRepository.create({
        name,
        description,
        icon
      });
      
      req.flash('success_msg', 'Tipo de comercio agregado exitosamente');
      res.redirect('/admin/commerce-types');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al agregar el tipo de comercio');
      res.redirect('/admin/commerce-types');
    }
  };
  
  // Actualizar tipo de comercio
  const updateCommerceType = async (req, res) => {
    try {
      const { id, name, description } = req.body;
      
      const commerceType = await commerceTypeRepository.findById(id);
      
      if (!commerceType) {
        req.flash('error_msg', 'Tipo de comercio no encontrado');
        return res.redirect('/admin/commerce-types');
      }
      
      const updateData = {
        name,
        description
      };
      
      // Si se subió un nuevo icono
      if (req.file) {
        updateData.icon = `/uploads/icons/${req.file.filename}`;
      }
      
      await commerceTypeRepository.update(id, updateData);
      
      req.flash('success_msg', 'Tipo de comercio actualizado exitosamente');
      res.redirect('/admin/commerce-types');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al actualizar el tipo de comercio');
      res.redirect('/admin/commerce-types');
    }
  };
  
  // Eliminar tipo de comercio
  const deleteCommerceType = async (req, res) => {
    try {
      const { id } = req.params;
      
      const commerceType = await commerceTypeRepository.findById(id);
      
      if (!commerceType) {
        req.flash('error_msg', 'Tipo de comercio no encontrado');
        return res.redirect('/admin/commerce-types');
      }
      
      // Verificar si hay comercios con este tipo
      const commercesCount = await commerceRepository.count({
        where: { CommerceTypeId: id }
      });
      
      if (commercesCount > 0) {
        req.flash('error_msg', 'No se puede eliminar el tipo de comercio porque tiene comercios asociados');
        return res.redirect('/admin/commerce-types');
      }
      
      await commerceTypeRepository.delete(id);
      
      req.flash('success_msg', 'Tipo de comercio eliminado exitosamente');
      res.redirect('/admin/commerce-types');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al eliminar el tipo de comercio');
      res.redirect('/admin/commerce-types');
    }
  };
  
  // Actualizar configuración
  const updateConfiguration = async (req, res) => {
    try {
      const { itbis } = req.body;
      
      const configuration = await Configuration.findOne();
      
      if (configuration) {
        await configuration.update({
          itbis
        });
      } else {
        await Configuration.create({
          itbis
        });
      }
      
      req.flash('success_msg', 'Configuración actualizada exitosamente');
      res.redirect('/admin/configuration');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al actualizar la configuración');
      res.redirect('/admin/configuration');
    }
  };
  
  export {
    getDashboard,
    getUsers,
    getCommerces,
    getCommerceTypes,
    getConfiguration,
    toggleUserStatus,
    addCommerceType,
    updateCommerceType,
    deleteCommerceType,
    updateConfiguration
  };