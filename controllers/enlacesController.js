const shortid = require("shortid");
const Enlaces = require("../models/Enlace");
const hashPassword = require("../utils/hashPassword");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
exports.nuevoEnlace = async (req, res, next) => {
  //Revisar si hay errores
  const errores = validationResult(req);
  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }
  // Crear un objeto de Enlace
  const { nombre_original, nombre } = req.body;
  const enlace = new Enlaces();
  enlace.url = shortid.generate();
  enlace.nombre = nombre;
  enlace.nombre_original = nombre_original;

  // Si el usuario esta autenticado
  if (req.usuario) {
    const { password, descargas } = req.body;
    // Asignar a enlace el numero de descargas
    if (descargas) {
      enlace.descargas = descargas;
    }
    // Asignar un password
    if (password) {
      enlace.password = await hashPassword(password);
    }
    // Asignar el autor
    enlace.autor = req.usuario.id;
  }

  // Almacenar en la BD
  try {
    await enlace.save();
    res.json({ msg: `${enlace.url}` });
    return next();
  } catch (error) {
    console.log(error);
  }
};
//Retorna si el enlace tiene password o no
exports.tienePassword = async (req, res, next) => {
  const enlace = await Enlaces.findOne({ url: req.params.url });
  if (!enlace) {
    res.status(404).json({ meg: "Ese enlace no existe" });
    return next();
  }
  if (enlace.password) {
    return res.json({ password: true, enlace: enlace.url });
  }
  next();
};
// Obtener el enlace
exports.obtenerEnlace = async (req, res, next) => {
  //console.log(req.params.url);
  // Verificar si existe el enlace
  const enlace = await Enlaces.findOne({ url: req.params.url });
  if (!enlace) {
    res.status(404).json({ meg: "Ese enlace no existe" });
    return next();
  }

  // Si el enlace existe
  res.json({ archivo: enlace.nombre, password:false });
  next();
};

// Obtiene un listado de todos los enlaces
exports.todosEnlaces = async (req, res) => {
  try {
    const enlaces = await Enlaces.find({}).select("url -_id");
    res.json({ enlaces });
  } catch (error) {}
};

exports.verificarPassword = async (req, res, next) => {
  const { url } = req.params;
  //Consultar el enlace
  const enlace = await Enlaces.findOne({ url });
  //Verificar el password
  const { password } = req.body;
  if (bcrypt.compareSync(password, enlace.password)) {
    // Permitirle al usuario descargar el archivo
    next();
  } else {
    return res.status(401).json({ msg: "Password Incorrecto" });
  }
};
