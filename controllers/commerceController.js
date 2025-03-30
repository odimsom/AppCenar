import { 
    userRepository, 
    commerceRepository, 
    productRepository, 
    categoryRepository,
    orderRepository
  } from '../repositories/index.js';
  import { User, Commerce, Product, Category, Order, OrderDetail } from '../models/index.js';
  
  // Página de inicio del comercio
  const getHome = async (req, res) => {
    try {
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/logout');
      }
      
      // Estadísticas
      const totalProducts = await productRepository.count({
        where: { CommerceId: commerce.id }
      });
      
      const totalCategories = await categoryRepository.count({
        where: { CommerceId: commerce.id }
      });
      
      const pendingOrders = await orderRepository.count({
        where: { 
          CommerceId: commerce.id,
          status: 'pending'
        }
      });
      
      const completedOrders = await orderRepository.count({
        where: { 
          CommerceId: commerce.id,
          status: 'completed'
        }
      });
      
      res.render('commerce/home', {
        title: 'Panel de Control',
        active: 'home',
        customCSS: 'commerce',
        user: req.session.user,
        commerce,
        stats: {
          totalProducts,
          totalCategories,
          pendingOrders,
          completedOrders
        }
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar la página de inicio');
      res.redirect('/');
    }
  };
  
  // Página de productos
  const getProducts = async (req, res) => {
    try {
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/logout');
      }
      
      const categories = await categoryRepository.findAll({
        where: { CommerceId: commerce.id }
      });
      
      const products = await productRepository.findAll({
        where: { CommerceId: commerce.id },
        include: [Category]
      });
      
      res.render('commerce/products', {
        title: 'Productos',
        active: 'products',
        customCSS: 'commerce',
        user: req.session.user,
        commerce,
        categories,
        products
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar los productos');
      res.redirect('/commerce/home');
    }
  };
  
  // Página de categorías
  const getCategories = async (req, res) => {
    try {
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/logout');
      }
      
      const categories = await categoryRepository.findAll({
        where: { CommerceId: commerce.id }
      });
      
      res.render('commerce/categories', {
        title: 'Categorías',
        active: 'categories',
        customCSS: 'commerce',
        user: req.session.user,
        commerce,
        categories
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar las categorías');
      res.redirect('/commerce/home');
    }
  };
  
  // Página de pedidos
  const getOrders = async (req, res) => {
    try {
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/logout');
      }
      
      const orders = await orderRepository.findAll({
        where: { CommerceId: commerce.id },
        include: [
          {
            model: User,
            as: 'client'
          },
          {
            model: User,
            as: 'delivery'
          },
          {
            model: OrderDetail,
            include: [Product]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      
      res.render('commerce/orders', {
        title: 'Pedidos',
        active: 'orders',
        customCSS: 'commerce',
        user: req.session.user,
        commerce,
        orders
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar los pedidos');
      res.redirect('/commerce/home');
    }
  };
  
  // Página de detalle de un pedido
  const getOrderDetail = async (req, res) => {
    try {
      const { id } = req.params;
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/logout');
      }
      
      const order = await orderRepository.findById(id, {
        include: [
          {
            model: User,
            as: 'client'
          },
          {
            model: User,
            as: 'delivery'
          },
          {
            model: OrderDetail,
            include: [Product]
          }
        ]
      });
      
      if (!order || order.CommerceId !== commerce.id) {
        req.flash('error_msg', 'Pedido no encontrado');
        return res.redirect('/commerce/orders');
      }
      
      res.render('commerce/order-detail', {
        title: `Pedido #${order.id}`,
        active: 'orders',
        customCSS: 'commerce',
        user: req.session.user,
        commerce,
        order
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar el detalle del pedido');
      res.redirect('/commerce/orders');
    }
  };
  
  // Página de perfil
  const getProfile = async (req, res) => {
    try {
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/logout');
      }
      
      const commerceTypes = await commerceTypeRepository.findAll();
      
      res.render('commerce/profile', {
        title: 'Perfil',
        active: 'profile',
        customCSS: 'commerce',
        user: req.session.user,
        commerce,
        commerceTypes
      });
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al cargar el perfil');
      res.redirect('/commerce/home');
    }
  };
  
  // Actualizar perfil
  const updateProfile = async (req, res) => {
    try {
      const { name, phone, openingTime, closingTime, commerceTypeId } = req.body;
      let logo = null;
      
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/logout');
      }
      
      // Si se subió un nuevo logo
      if (req.file) {
        logo = `/uploads/logos/${req.file.filename}`;
      } else {
        logo = commerce.logo;
      }
      
      // Actualizar comercio
      await commerceRepository.update(commerce.id, {
        name,
        logo,
        openingTime,
        closingTime,
        CommerceTypeId: commerceTypeId
      });
      
      // Actualizar usuario
      await userRepository.update(req.session.user.id, {
        phone
      });
      
      req.flash('success_msg', 'Perfil actualizado exitosamente');
      res.redirect('/commerce/profile');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al actualizar el perfil');
      res.redirect('/commerce/profile');
    }
  };
  
  // Agregar categoría
  const addCategory = async (req, res) => {
    try {
      const { name, description } = req.body;
      
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/logout');
      }
      
      await categoryRepository.create({
        name,
        description,
        CommerceId: commerce.id
      });
      
      req.flash('success_msg', 'Categoría agregada exitosamente');
      res.redirect('/commerce/categories');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al agregar la categoría');
      res.redirect('/commerce/categories');
    }
  };
  
  // Actualizar categoría
  const updateCategory = async (req, res) => {
    try {
      const { id, name, description } = req.body;
      
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/logout');
      }
      
      const category = await categoryRepository.findById(id);
      
      if (!category || category.CommerceId !== commerce.id) {
        req.flash('error_msg', 'Categoría no encontrada');
        return res.redirect('/commerce/categories');
      }
      
      await categoryRepository.update(id, {
        name,
        description
      });
      
      req.flash('success_msg', 'Categoría actualizada exitosamente');
      res.redirect('/commerce/categories');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al actualizar la categoría');
      res.redirect('/commerce/categories');
    }
  };
  
  // Eliminar categoría
  const deleteCategory = async (req, res) => {
    try {
      const { id } = req.params;
      
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/logout');
      }
      
      const category = await categoryRepository.findById(id);
      
      if (!category || category.CommerceId !== commerce.id) {
        req.flash('error_msg', 'Categoría no encontrada');
        return res.redirect('/commerce/categories');
      }
      
      // Verificar si hay productos en esta categoría
      const productsCount = await productRepository.count({
        where: { CategoryId: id }
      });
      
      if (productsCount > 0) {
        req.flash('error_msg', 'No se puede eliminar la categoría porque tiene productos asociados');
        return res.redirect('/commerce/categories');
      }
      
      await categoryRepository.delete(id);
      
      req.flash('success_msg', 'Categoría eliminada exitosamente');
      res.redirect('/commerce/categories');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al eliminar la categoría');
      res.redirect('/commerce/categories');
    }
  };
  
  // Agregar producto
  const addProduct = async (req, res) => {
    try {
      const { name, description, price, categoryId } = req.body;
      let image = null;
      
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/logout');
      }
      
      // Si se subió una imagen
      if (req.file) {
        image = `/uploads/products/${req.file.filename}`;
      }
      
      await productRepository.create({
        name,
        description,
        price,
        image,
        CommerceId: commerce.id,
        CategoryId: categoryId
      });
      
      req.flash('success_msg', 'Producto agregado exitosamente');
      res.redirect('/commerce/products');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al agregar el producto');
      res.redirect('/commerce/products');
    }
  };
  
  // Actualizar producto
  const updateProduct = async (req, res) => {
    try {
      const { id, name, description, price, categoryId } = req.body;
      
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/logout');
      }
      
      const product = await productRepository.findById(id);
      
      if (!product || product.CommerceId !== commerce.id) {
        req.flash('error_msg', 'Producto no encontrado');
        return res.redirect('/commerce/products');
      }
      
      const updateData = {
        name,
        description,
        price,
        CategoryId: categoryId
      };
      
      // Si se subió una nueva imagen
      if (req.file) {
        updateData.image = `/uploads/products/${req.file.filename}`;
      }
      
      await productRepository.update(id, updateData);
      
      req.flash('success_msg', 'Producto actualizado exitosamente');
      res.redirect('/commerce/products');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al actualizar el producto');
      res.redirect('/commerce/products');
    }
  };
  
  // Eliminar producto
  const deleteProduct = async (req, res) => {
    try {
      const { id } = req.params;
      
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        req.flash('error_msg', 'Comercio no encontrado');
        return res.redirect('/logout');
      }
      
      const product = await productRepository.findById(id);
      
      if (!product || product.CommerceId !== commerce.id) {
        req.flash('error_msg', 'Producto no encontrado');
        return res.redirect('/commerce/products');
      }
      
      await productRepository.delete(id);
      
      req.flash('success_msg', 'Producto eliminado exitosamente');
      res.redirect('/commerce/products');
    } catch (error) {
      console.error(error);
      req.flash('error_msg', 'Error al eliminar el producto');
      res.redirect('/commerce/products');
    }
  };
  
  // Actualizar estado de pedido
  const updateOrderStatus = async (req, res) => {
    try {
      const { id, status } = req.body;
      
      const commerce = await commerceRepository.findByUserId(req.session.user.id);
      
      if (!commerce) {
        return res.status(403).json({ success: false, message: 'Comercio no encontrado' });
      }
      
      const order = await orderRepository.findById(id);
      
      if (!order || order.CommerceId !== commerce.id) {
        return res.status(404).json({ success: false, message: 'Pedido no encontrado' });
      }
      
      await orderRepository.update(id, { status });
      
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Error al actualizar el estado del pedido' });
    }
  };
  
  export {
    getHome,
    getProducts,
    getCategories,
    getOrders,
    getOrderDetail,
    getProfile,
    updateProfile,
    addCategory,
    updateCategory,
    deleteCategory,
    addProduct,
    updateProduct,
    deleteProduct,
    updateOrderStatus
  };