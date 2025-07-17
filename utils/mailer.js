import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Configuración del transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "borrome941@gmail.com",
    pass: process.env.EMAIL_PASS || "ezfumcgaatuukmdp",
  },
});

// Función para enviar correo de activación
export const enviarCorreoActivacion = async (correo, token, rol) => {
  try {
    const baseUrl = process.env.BASE_URL || "http://localhost:4000";
    const activationUrl = `${baseUrl}/auth/activar/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || "borrome941@gmail.com",
      to: correo,
      subject: "Activación de cuenta - AppCenar",
      html: `
        <h1>Bienvenido a AppCenar</h1>
        <p>Gracias por registrarte como ${rol}.</p>
        <p>Para activar tu cuenta, haz clic en el siguiente enlace:</p>
        <a href="${activationUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Activar cuenta</a>
        <p>Si no puedes hacer clic en el botón, copia y pega la siguiente URL en tu navegador:</p>
        <p>${activationUrl}</p>
        <p>Este enlace expirará en 24 horas.</p>
        <p>Si no has solicitado esta cuenta, puedes ignorar este correo.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Correo de activación enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error al enviar correo de activación:", error);
    return false;
  }
};

// Función para enviar correo de recuperación de contraseña
export const enviarCorreoRecuperacion = async (correo, token) => {
  try {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password/${token}`;

    const mailOptions = {
      from: process.env.EMAIL_USER || "borrome941@gmail.com",
      to: correo,
      subject: "Recuperación de contraseña - AppCenar",
      html: `
        <h1>Recuperación de contraseña</h1>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Para crear una nueva contraseña, haz clic en el siguiente enlace:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Restablecer contraseña</a>
        <p>Si no puedes hacer clic en el botón, copia y pega la siguiente URL en tu navegador:</p>
        <p>${resetUrl}</p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no has solicitado restablecer tu contraseña, puedes ignorar este correo.</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Correo de recuperación enviado:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error al enviar correo de recuperación:", error);
    return false;
  }
};
