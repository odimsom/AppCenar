import crypto from "crypto";
import bcrypt from "bcrypt";
import models from "../models/index.js";
import {
  enviarCorreoActivacion,
  enviarCorreoRecuperacion,
} from "../utils/mailer.js";
import { Sequelize } from "sequelize";
import { get } from "https";

const { Usuario, Comercio, TipoComercio } = models;
const { Op } = Sequelize;

export const renderLogin = (req, res) => {
  res.render("auth/login");
};

export const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    let usuario = await Usuario.findOne({
      where: {
        [Op.or]: [{ correo }, { usuario: correo }],
      },
    });

    let isComercio = false;
    if (!usuario) {
      const comercio = await Comercio.findOne({
        where: { correo },
        include: [{ model: TipoComercio, as: "tipoComercio" }],
      });

      if (comercio) {
        usuario = comercio;
        isComercio = true;
      }
    }

    if (!usuario) {
      req.flash("error_msg", "Credenciales incorrectas");
      return res.redirect("/auth/login");
    }

    if (!usuario.activo) {
      req.flash(
        "error_msg",
        "Tu cuenta está inactiva. Por favor revisa tu correo o contacta a un administrador"
      );
      return res.redirect("/auth/login");
    }

    const isMatch = usuario.validarPassword(password);
    console.log("Resultado bcrypt.compare:", isMatch);
    if (!isMatch) {
      req.flash("error_msg", "Credenciales incorrectas");
      return res.redirect("/auth/login");
    }

    if (isComercio) {
      req.session.user = {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol: "comercio",
        logo: usuario.logo,
        tipoComercio: usuario.tipoComercio ? usuario.tipoComercio.nombre : null,
      };
    } else {
      req.session.user = {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        telefono: usuario.telefono,
        correo: usuario.correo,
        usuario: usuario.usuario,
        foto: usuario.foto,
        rol: usuario.rol,
      };
    }

    switch (isComercio ? "comercio" : usuario.rol) {
      case "cliente":
        return res.redirect("/cliente/home");
      case "comercio":
        return res.redirect("/comercio/home");
      case "delivery":
        return res.redirect("/delivery/home");
      case "admin":
        return res.redirect("/admin/home");
      default:
        return res.redirect("/");
    }
  } catch (error) {
    console.error("Error en login:", error);
    req.flash("error_msg", "Error al iniciar sesión");
    res.redirect("/auth/login");
  }
};

// Cerrar sesión
export const logout = (req, res) => {
  req.session.destroy();
  res.redirect("/auth/login");
};

// Renderizar página de registro de cliente/delivery
export const renderRegistroClienteDelivery = (req, res) => {
  res.render("auth/registro-cliente-delivery");
};

// Procesar registro de cliente/delivery
export const registroClienteDelivery = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      telefono,
      correo,
      usuario,
      rol,
      password,
      confirmarPassword,
    } = req.body;

    // Validar que las contraseñas coincidan
    if (password !== confirmarPassword) {
      req.flash("error_msg", "Las contraseñas no coinciden");
      return res.redirect("/auth/registro-cliente-delivery");
    }

    // Verificar que el correo y usuario no existan
    const existeCorreo = await Usuario.findOne({ where: { correo } });
    const existeUsuario = await Usuario.findOne({ where: { usuario } });

    if (existeCorreo) {
      req.flash("error_msg", "El correo ya está registrado");
      return res.redirect("/auth/registro-cliente-delivery");
    }

    if (existeUsuario) {
      req.flash("error_msg", "El nombre de usuario ya está registrado");
      return res.redirect("/auth/registro-cliente-delivery");
    }

    // Generar token de activación
    const token = crypto.randomBytes(20).toString("hex");

    // Crear usuario
    const nuevoUsuario = await Usuario.create({
      nombre,
      apellido,
      telefono,
      correo,
      usuario,
      password,
      rol,
      token,
      foto: req.file ? `/uploads/users/${req.file.filename}` : null,
    });

    const correoEnviado = await enviarCorreoActivacion(correo, token, rol);

    if (correoEnviado) {
      req.flash(
        "success_msg",
        "Te has registrado exitosamente. Por favor revisa tu correo para activar tu cuenta"
      );
    } else {
      req.flash(
        "error_msg",
        "Te has registrado pero hubo un problema al enviar el correo de activación. Contacta a un administrador"
      );
    }

    res.redirect("/auth/login");
  } catch (error) {
    console.error("Error en registro:", error);
    req.flash("error_msg", "Error al registrarse");
    res.redirect("/auth/registro-cliente-delivery");
  }
};

// [get];
export const renderRegistroComercio = async (req, res) => {
  try {
    const tiposComercio = await TipoComercio.findAll();
    res.render("auth/registro-comercio", { tiposComercio });
  } catch (error) {
    console.error("Error al cargar tipos de comercio:", error);
    req.flash("error_msg", "Error al cargar la página de registro");
    res.redirect("/auth/login");
  }
};

// Procesar registro de comercio
export const registroComercio = async (req, res) => {
  try {
    const {
      nombre,
      telefono,
      correo,
      horaApertura,
      horaCierre,
      tipoComercioId,
      password,
      confirmarPassword,
    } = req.body;

    // Validar que las contraseñas coincidan
    if (password !== confirmarPassword) {
      req.flash("error_msg", "Las contraseñas no coinciden");
      return res.redirect("/auth/registro-comercio");
    }

    // Verificar que el correo no exista
    const existeCorreo = await Comercio.findOne({ where: { correo } });

    if (existeCorreo) {
      req.flash("error_msg", "El correo ya está registrado");
      return res.redirect("/auth/registro-comercio");
    }

    // Generar token de activación
    const token = crypto.randomBytes(20).toString("hex");

    // Crear comercio
    const nuevoComercio = await Comercio.create({
      nombre,
      telefono,
      correo,
      horaApertura,
      horaCierre,
      tipoComercioId,
      password,
      token,
      logo: req.file ? `/uploads/comercios/${req.file.filename}` : null,
    });

    // Enviar correo de activación
    const correoEnviado = await enviarCorreoActivacion(
      correo,
      token,
      "comercio"
    );

    if (correoEnviado) {
      req.flash(
        "success_msg",
        "Tu comercio se ha registrado exitosamente. Por favor revisa tu correo para activar tu cuenta"
      );
    } else {
      req.flash(
        "error_msg",
        "Tu comercio se ha registrado pero hubo un problema al enviar el correo de activación. Contacta a un administrador"
      );
    }

    res.redirect("/auth/login");
  } catch (error) {
    console.error("Error en registro de comercio:", error);
    req.flash("error_msg", "Error al registrar el comercio");
    res.redirect("/auth/registro-comercio");
  }
};

// Activar cuenta
export const activarCuenta = async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar usuario por token
    let usuario = await Usuario.findOne({ where: { token } });
    let isComercio = false;

    // Si no se encuentra en Usuario, buscar en Comercio
    if (!usuario) {
      const comercio = await Comercio.findOne({ where: { token } });
      if (comercio) {
        usuario = comercio;
        isComercio = true;
      }
    }

    // Si no se encuentra el token
    if (!usuario) {
      req.flash("error_msg", "Token de activación inválido");
      return res.redirect("/auth/login");
    }

    // Activar cuenta y eliminar token
    usuario.activo = true;
    usuario.token = null;
    await usuario.save();

    req.flash(
      "success_msg",
      "Tu cuenta ha sido activada exitosamente. Ahora puedes iniciar sesión"
    );
    res.redirect("/auth/login");
  } catch (error) {
    console.error("Error al activar cuenta:", error);
    req.flash("error_msg", "Error al activar la cuenta");
    res.redirect("/auth/login");
  }
};

// Renderizar página de solicitud de recuperación de contraseña
export const renderSolicitarRecuperacion = (req, res) => {
  res.render("auth/solicitar-recuperacion");
};

// Procesar solicitud de recuperación de contraseña
export const solicitarRecuperacion = async (req, res) => {
  try {
    const { correo } = req.body;

    let usuario = await Usuario.findOne({
      where: {
        [Op.or]: [{ correo }, { usuario: correo }],
      },
    });

    // Si no se encuentra en Usuario, buscar en Comercio
    let isComercio = false;
    if (!usuario) {
      const comercio = await Comercio.findOne({ where: { correo } });
      if (comercio) {
        usuario = comercio;
        isComercio = true;
      }
    }

    // Si no se encuentra el usuario
    if (!usuario) {
      req.flash(
        "error_msg",
        "No se encontró ninguna cuenta con ese correo o nombre de usuario"
      );
      return res.redirect("/auth/solicitar-recuperacion");
    }

    // Generar token de recuperación
    const token = crypto.randomBytes(20).toString("hex");

    // Guardar token en usuario
    usuario.token = token;
    await usuario.save();

    // Enviar correo de recuperación
    const correoEnviado = await enviarCorreoRecuperacion(usuario.correo, token);

    if (correoEnviado) {
      req.flash(
        "success_msg",
        "Se ha enviado un correo con instrucciones para restablecer tu contraseña"
      );
    } else {
      req.flash(
        "error_msg",
        `Hubo un problema al enviar el correo de recuperación. Contacta a un administrador`
      );
    }

    res.redirect("/auth/login");
  } catch (error) {
    console.error("Error al solicitar recuperación:", error);
    req.flash("error_msg", "Error al procesar la solicitud");
    res.redirect("/auth/solicitar-recuperacion");
  }
};

// Renderizar página de restablecimiento de contraseña
export const renderRestablecerPassword = async (req, res) => {
  try {
    const { token } = req.params;

    // Buscar usuario por token
    let usuario = await Usuario.findOne({ where: { token } });
    let isComercio = false;

    // Si no se encuentra en Usuario, buscar en Comercio
    if (!usuario) {
      const comercio = await Comercio.findOne({ where: { token } });
      if (comercio) {
        usuario = comercio;
        isComercio = true;
      }
    }

    // Si no se encuentra el token
    if (!usuario) {
      req.flash("error_msg", "Token de recuperación inválido o expirado");
      return res.redirect("/auth/login");
    }

    res.render("auth/restablecer-password", { token });
  } catch (error) {
    console.error("Error al renderizar página de restablecimiento:", error);
    req.flash("error_msg", "Error al cargar la página");
    res.redirect("/auth/login");
  }
};

// Procesar restablecimiento de contraseña
export const restablecerPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmarPassword } = req.body;

    // Validar que las contraseñas coincidan
    if (password !== confirmarPassword) {
      req.flash("error_msg", "Las contraseñas no coinciden");
      return res.redirect(`/auth/restablecer-password/${token}`);
    }

    // Buscar usuario por token
    let usuario = await Usuario.findOne({ where: { token } });
    let isComercio = false;

    // Si no se encuentra en Usuario, buscar en Comercio
    if (!usuario) {
      const comercio = await Comercio.findOne({ where: { token } });
      if (comercio) {
        usuario = comercio;
        isComercio = true;
      }
    }

    // Si no se encuentra el token
    if (!usuario) {
      req.flash("error_msg", "Token de recuperación inválido o expirado");
      return res.redirect("/auth/login");
    }

    // Actualizar contraseña y eliminar token
    usuario.password = password;
    usuario.token = null;
    await usuario.save();

    req.flash(
      "success_msg",
      "Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión"
    );
    res.redirect("/auth/login");
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    req.flash("error_msg", "Error al restablecer la contraseña");
    res.redirect("/auth/login");
  }
};
