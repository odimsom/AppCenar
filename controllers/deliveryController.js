import { 
    userRepository, 
    orderRepository
  } from '../repositories/index.js';
  import { User, Commerce, Product, Order, OrderDetail, Address } from '../models/index.js';
  
  // Página de inicio del delivery
  const getHome = async (req, res) => {
    try {
      const user = await userRepository.findById(req.session.user.id);
      
      // Estadísticas
      const completedOrders = await orderRepository.count({
        where: { 
          deliveryId: req.session.user.id,
          status: 'completed'
        }
      });
      
      const pendingOrders = await orderRepository.count({
        where: { 
          deliveryId: req.session.user.id,
          status: 'in_process'
        }
      });
      
      // Pedidos disponibles (sin delivery asignado)
      const availableOrders = await orderRepository.findAll({
        where: { 
          deliveryId: null,
          status: 'pending'
        },
        include: [
          {
            model: Commerce
          },
          {
            model: User,
            as: 'client'
          },
          {
            model: Address
          }
        ],
        order: [['createdAt', 'ASC']]
      });
      
      res.render('delivery/home', {
        title: 'Panel de Control',
        active: 'home',
        customCSS: 'delivery',
        user: req.session.user,
        userDetail: user,
        stats: {
          completedOrders,
          pendingOrders
        },
        availableOrders
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar la página de inicio');
      res.redirect('/');
    }
  };
  
  // Página de pedidos
  const getOrders = async (req, res) => {
    try {
      const orders = await orderRepository.findAll({
        where: { deliveryId: req.session.user.id },
        include: [
          {
            model: Commerce
          },
          {
            model: User,
            as: 'client'
          },
          {
            model: Address
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.render('delivery/orders', {
        title: 'Mis Pedidos',
        active: 'orders',
        customCSS: 'delivery',
        user: req.session.user,
        orders
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar los pedidos');
      res.redirect('/delivery/home');
    }
  };
  
  // Página de detalle de un pedido
  const getOrderDetail = async (req, res) => {
    try {
      const { id } = req.params;
      
      const order = await orderRepository.findById(id, {
        include: [
          {
            model: Commerce
          },
          {
            model: User,
            as: 'client'
          },
          {
            model: Address
          },
          {
            model: OrderDetail,
            include: [Product]
          }
        ]
      });
      
      if (!order || order.deliveryId !== req.session.user.id) {
        req.flash('error_msg', 'Pedido no encontrado');
        return res.redirect('/delivery/orders');
      }
      
      res.render('delivery/order-detail', {
        title: `Pedido #${order.id}`,
        active: 'orders',
        customCSS: 'delivery',
        user: req.session.user,
        order
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar el detalle del pedido');
      res.redirect('/delivery/orders');
    }
  };
  
  // Página de perfil
  const getProfile = async (req, res) => {
    try {
      const user = await userRepository.findById(req.session.user.id);
      const completedOrders = await orderRepository.count({
        where: { 
          deliveryId: req.session.user.id,
          status: 'completed'
        }
      });
      
      res.render('delivery/profile', {
        title: 'Mi Perfil',
        active: 'profile',
        customCSS: 'delivery',
        user: req.session.user,
        userDetail: user,
        completedOrders
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar el perfil');
      res.redirect('/delivery/home');
    }
  };
  
  // Actualizar perfil
  const updateProfile = async (req, res) => {
    try {
      const { name, lastName, phone, username } = req.body;
      let profileImage = req.session.user.profileImage;
      
      // Si se subió una nueva imagen de perfil
      if (req.file) {
        profileImage = `/uploads/profiles/${req.file.filename}`;
      }
      
      // Verificar si el username ya existe
      if (username && username !== req.session.user.username) {
        const existingUsername = await userRepository.findByUsername(username);
        if (existingUsername) {
          req.flash('error_msg', 'El nombre de usuario ya está registrado');
          return res.redirect('/delivery/profile');
        }
      }
      
      // Actualizar usuario
      await userRepository.update(req.session.user.id, {
        name,
        lastName,
        phone,
        username,
        profileImage
      });
      
      // Actualizar sesión
      req.session.user.name = name;
      req.session.user.profileImage = profileImage;
      
      req.flash('success_msg', 'Perfil actualizado exitosamente');
      res.redirect('/delivery/profile');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al actualizar el perfil');
      res.redirect('/delivery/profile');
    }
  };
  
  // Actualizar estado de disponibilidad
  const updateStatus = async (req, res) => {
    try {
      const { status } = req.body;
      
      await userRepository.update(req.session.user.id, {
        status
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al actualizar el estado' });
    }
  };
  
  // Tomar un pedido
  const takeOrder = async (req, res) => {
    try {
      const { id } = req.params;
      
      const order = await orderRepository.findById(id);
      
      if (!order || order.deliveryId !== null) {
        req.flash('error_msg', 'Pedido no disponible');
        return res.redirect('/delivery/home');
      }
      
      // Verificar si el delivery está disponible
      const user = await userRepository.findById(req.session.user.id);
      if (user.status !== 'available') {
        req.flash('error_msg', 'Debes estar disponible para tomar pedidos');
        return res.redirect('/delivery/home');
      }
      
      // Asignar pedido al delivery y cambiar estado
      await orderRepository.update(id, {
        deliveryId: req.session.user.id,
        status: 'in_process'
      });
      
      // Cambiar estado del delivery a ocupado
      await userRepository.update(req.session.user.id, {
        status: 'busy'
      });
      
      req.flash('success_msg', 'Pedido tomado exitosamente');
      res.redirect('/delivery/orders');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al tomar el pedido');
      res.redirect('/delivery/home');
    }
  };
  
  // Completar un pedido
  const completeOrder = async (req, res) => {
    try {
      const { id } = req.params;
      
      const order = await orderRepository.findById(id);
      
      if (!order || order.deliveryId !== req.session.user.id) {
        req.flash('error_msg', 'Pedido no encontrado');
        return res.redirect('/delivery/orders');
      }
      
      // Cambiar estado del pedido a completado
      await orderRepository.update(id, {
        status: 'completed'
      });
      
      // Cambiar estado del delivery a disponible
      await userRepository.update(req.session.user.id, {
        status: 'available'
      });
      
      req.flash('success_msg', 'Pedido completado exitosamente');
      res.redirect('/delivery/orders');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al completar el pedido');
      res.redirect('/delivery/orders');
    }
  };
  
  export {
    getHome,
    getOrders,
    getOrderDetail,
    getProfile,
    updateProfile,
    updateStatus,
    takeOrder,
    completeOrder
  };