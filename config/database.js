export default {
  database: process.env.DB_NAME || "appcenar",
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "1011",
  host: process.env.DB_HOST || "localhost",
  dialect: "mysql",
  define: {
    timestamps: true,
    underscored: true,
  },
};
