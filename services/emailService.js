import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_PORT === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendActivationEmail = async (to, activationUrl) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Activa tu cuenta en AppCenar',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #1a2b63;">¡Bienvenido a AppCenar!</h2>
          <p>Gracias por registrarte. Para activar tu cuenta, haz clic en el siguiente enlace:</p>
          <p style="margin: 20px 0;">
            <a href="${activationUrl}" style="background-color: #00c2ff; color: #1a2b63; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Activar mi cuenta</a>
          </p>
          <p>Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
          <p style="word-break: break-all;">${activationUrl}</p>
          <p>Este enlace expirará en 24 horas.</p>
          <p>Si no solicitaste esta cuenta, puedes ignorar este correo.</p>
          <p>Saludos,<br>El equipo de AppCenar</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Error al enviar correo de activación:', error);
    return false;
  }
};

const sendResetPasswordEmail = async (to, resetUrl) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Restablece tu contraseña en AppCenar',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #1a2b63;">Restablece tu contraseña</h2>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #00c2ff; color: #1a2b63; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Restablecer contraseña</a>
          </p>
          <p>Si no puedes hacer clic en el botón, copia y pega el siguiente enlace en tu navegador:</p>
          <p style="word-break: break-all;">${resetUrl}</p>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo.</p>
          <p>Saludos,<br>El equipo de AppCenar</p>
        </div>
      `
    });
    return true;
  } catch (error) {
    console.error('Error al enviar correo de restablecimiento:', error);
    return false;
  }
};

export {
  sendActivationEmail,
  sendResetPasswordEmail
};