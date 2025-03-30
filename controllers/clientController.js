import { 
    userRepository, 
    commerceRepository, 
    productRepository, 
    categoryRepository,
    orderRepository,
    addressRepository,
    commerceTypeRepository
  } from '../repositories/index.js';
  import { User, Commerce, Product, Category, Order, OrderDetail, Address } from '../models/index.js';
  
  const getHome = async (req, res) => {
    try {
      const commerceTypes = await commerceTypeRepository.findAll();
      const commerces = await commerceRepository.findAll({
        include: [
          {
            model: User,
            where: { active: true }
          },
          {
            model: CommerceType
          }
        ]
      });
      
      res.render('client/home', {
        title: 'Inicio',
        active: 'home',
        customCSS: 'client',
        user: req.session.user,
        commerceTypes,
        commerces
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar la página de inicio');
      res.redirect('/');
    }
  };
  
  const getCatalog = async (req, res) => {
    try {
      const { id } = req.params;
      
      const commerce = await commerceRepository.findById(id, {
        include: [
          {
            model: User,
            where: { active: true }
          },
          {
            model: CommerceType
          }
        ]
      });
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/client/home');
      }
      
      const categories = await categoryRepository.findAll({
        where: { CommerceId: id }
      });
      
      const products = await productRepository.findAll({
        where: { CommerceId: id },
        include: [Category]
      });
      
      res.render('client/catalog', {
        title: commerce.name,
        active: 'home',
        customCSS: 'client',
        user: req.session.user,
        commerce,
        categories,
        products
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar el catálogo');
      res.redirect('/client/home');
    }
  };
  
  const getOrders = async (req, res) => {
    try {
      const orders = await orderRepository.findAll({
        where: { clientId: req.session.user.id },
        include: [
          {
            model: Commerce,
            include: [User]
          },
          {
            model: User,
            as: 'delivery'
          },
          {
            model: Address
          },
          {
            model: OrderDetail,
            include: [Product]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.render('client/orders', {
        title: 'Mis Pedidos',
        active: 'orders',
        customCSS: 'client',
        user: req.session.user,
        orders
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar los pedidos');
      res.redirect('/client/home');
    }
  };
  
  const getOrderDetail = async (req, res) => {
    try {
      const { id } = req.params;
      
      const order = await orderRepository.findById(id, {
        include: [
          {
            model: Commerce,
            include: [User]
          },
          {
            model: User,
            as: 'delivery'
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
      
      if (!order || order.clientId !== req.session.user.id) {
        req.flash('error_msg', 'Pedido no encontrado');
        return res.redirect('/client/orders');
      }
      
      res.render('client/order-detail', {
        title: `Pedido #${order.id}`,
        active: 'orders',
        customCSS: 'client',
        user: req.session.user,
        order
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar el detalle del pedido');
      res.redirect('/client/orders');
    }
  };
  
  const getFavorites = async (req, res) => {
    try {
      const user = await userRepository.findById(req.session.user.id, {
        include: [
          {
            model: Commerce,
            as: 'favoriteCommerces',
            include: [
              {
                model: User,
                where: { active: true }
              },
              {
                model: CommerceType
              }
            ]
          }
        ]
      });
      
      res.render('client/favorites', {
        title: 'Mis Favoritos',
        active: 'favorites',
        customCSS: 'client',
        user: req.session.user,
        favorites: user.favoriteCommerces
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar los favoritos');
      res.redirect('/client/home');
    }
  };
  
  const getAddresses = async (req, res) => {
    try {
      const addresses = await addressRepository.findAll({
        where: { userId: req.session.user.id }
      });
      
      res.render('client/address', {
        title: 'Mis Direcciones',
        active: 'address',
        customCSS: 'client',
        user: req.session.user,
        addresses
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar las direcciones');
      res.redirect('/client/home');
    }
  };
  
  const getProfile = async (req, res) => {
    try {
      const user = await userRepository.findById(req.session.user.id);
      const orderCount = await orderRepository.count({
        where: { clientId: req.session.user.id }
      });
      
      res.render('client/profile', {
        title: 'Mi Perfil',
        active: 'profile',
        customCSS: 'client',
        user: req.session.user,
        userDetail: user,
        orderCount
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar el perfil');
      res.redirect('/client/home');
    }
  };
  
  const updateProfile = async (req, res) => {
    try {
      const { name, lastName, phone, username } = req.body;
      let profileImage = req.session.user.profileImage;
      
      if (req.file) {
        profileImage = `/uploads/profiles/${req.file.filename}`;
      }
      
      if (username && username !== req.session.user.username) {
        const existingUsername = await userRepository.findByUsername(username);
        if (existingUsername) {
          req.flash('error_msg', 'El nombre de usuario ya está registrado');
          return res.redirect('/client/profile');
        }
      }
      
      await userRepository.update(req.session.user.id, {
        name,
        lastName,
        phone,
        username,
        profileImage
      });
      
      req.session.user.name = name;
      req.session.user.profileImage = profileImage;
      
      req.flash('success_msg', 'Perfil actualizado exitosamente');
      res.redirect('/client/profile');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al actualizar el perfil');
      res.redirect('/client/profile');
    }
  };
  
  const addAddress = async (req, res) => {
    try {
      const { name, description } = req.body;
      
      await addressRepository.create({
        name,
        description,
        userId: req.session.user.id
      });
      
      req.flash('success_msg', 'Dirección agregada exitosamente');
      res.redirect('/client/address');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al agregar la dirección');
      res.redirect('/client/address');
    }
  };
  
  const deleteAddress = async (req, res) => {
    try {
      const { id } = req.params;
      
      const address = await addressRepository.findById(id);
      
      if (!address || address.userId !== req.session.user.id) {
        req.flash('error_msg', 'Dirección no encontrada');
        return res.redirect('/client/address');
      }
      
      await addressRepository.delete(id);
      
      req.flash('success_msg', 'Dirección eliminada exitosamente');
      res.redirect('/client/address');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al eliminar la dirección');
      res.redirect('/client/address');
    }
  };
  
  const addToFavorites = async (req, res) => {
    try {
      const { commerceId } = req.body;
      
      const user = await userRepository.findById(req.session.user.id);
      const commerce = await commerceRepository.findById(commerceId);
      
      if (!commerce) {
        return res.status(404).json({ success: false, message: 'Comercio no encontrado' });
      }
      
      await user.addFavoriteCommerce(commerce);
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al agregar a favoritos' });
    }
  };
  
  const removeFromFavorites = async (req, res) => {
    try {
      const { commerceId } = req.params;
      
      const user = await userRepository.findById(req.session.user.id);
      const commerce = await commerceRepository.findById(commerceId);
      
      if (!commerce) {
        return res.status(404).json({ success: false, message: 'Comercio no encontrado' });
      }
      
      await user.removeFavoriteCommerce(commerce);
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al eliminar de favoritos' });
    }
  };
  
  const createOrder = async (req, res) => {
    try {
      const { commerceId, addressId, products, subtotal, total } = req.body;
      
      const order = await orderRepository.create({
        clientId: req.session.user.id,
        CommerceId: commerceId,
        AddressId: addressId,
        subtotal,
        total,
        status: 'pending'
      });
      
      for (const item of products) {
        await OrderDetail.create({
          OrderId: order.id,
          ProductId: item.id,
          quantity: item.quantity,
          price: item.price
        });
      }
      
      res.json({ success: true, orderId: order.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al crear el pedido' });
    }
  };
  
  export {
    getHome,
    getCatalog,
    getOrders,
    getOrderDetail,
    getFavorites,
    getAddresses,
    getProfile,
    updateProfile,
    addAddress,
    deleteAddress,
    addToFavorites,
    removeFromFavorites,
    createOrder
  };