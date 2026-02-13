import express from "express";
import fs from "fs";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // cargar variables de entorno

const app = express();
const PORT = 4000;

const DB_FILE = "./db.json";
const DISP_FILE = "./disponibilidad.json";
const USUARIOS_FILE = "./usuarios.json";

app.use(cors());
app.use(express.json());

// Funciones para turnos y disponibilidad
const readData = () => {
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

const writeData = (data) => {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
};

const readDisponibilidad = () => {
  try {
    const data = fs.readFileSync(DISP_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return { diasHabiles: [], horarios: [] };
  }
};

// Funciones para usuarios
const leerUsuarios = () => {
  try {
    const data = fs.readFileSync(USUARIOS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
};

const escribirUsuarios = (data) => {
  fs.writeFileSync(USUARIOS_FILE, JSON.stringify(data, null, 2));
};

// ===================== REGISTRO =====================
app.post("/usuarios", (req, res) => {
  const { nombre, apellido, sexo, fechaNacimiento, email, telefono, contraseña } = req.body;

  if (!nombre || !apellido || !sexo || !fechaNacimiento || !email || !telefono || !contraseña) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  const usuarios = leerUsuarios();
  const yaExiste = usuarios.find(u => u.email === email);
  if (yaExiste) return res.status(409).json({ mensaje: "El correo ya está registrado" });

  // Encriptar contraseña
  const salt = bcrypt.genSaltSync(10);
  const contraseñaEncriptada = bcrypt.hashSync(contraseña, salt);

  const nuevoUsuario = {
    id: usuarios.length + 1,
    nombre,
    apellido,
    sexo,
    fechaNacimiento,
    email,
    telefono,
    contraseña: contraseñaEncriptada,
  };

  usuarios.push(nuevoUsuario);
  escribirUsuarios(usuarios);

  res.status(201).json({ mensaje: "Usuario registrado con éxito" });
});

// ===================== LOGIN =====================
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  try {
    const usuarios = leerUsuarios();
    const usuario = usuarios.find(u => u.email === email);
    if (!usuario) return res.status(401).json({ mensaje: "Credenciales incorrectas" });

    // Comparar contraseña
    const passwordValida = bcrypt.compareSync(password, usuario.contraseña);
    if (!passwordValida) return res.status(401).json({ mensaje: "Credenciales incorrectas" });

    // Generar JWT
    const token = jwt.sign(
      { email: usuario.email, id: usuario.id },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).json({
      mensaje: "Login exitoso",
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
    });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

// ===================== PROTEGER RUTA DE PRUEBA =====================
app.get("/perfil", (req, res) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(403).json({ mensaje: "Token requerido" });

  const token = authHeader.split(" ")[1];
  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ mensaje: "Acceso autorizado", usuario: decodificado });
  } catch {
    res.status(401).json({ mensaje: "Token inválido o expirado" });
  }
});

// ===================== TURNOS =====================
app.post("/turnos", (req, res) => {
  const { nombre, fecha, hora } = req.body;
  const [año, mes, dia] = fecha.split("-");
  const dateObj = new Date(`${año}-${mes}-${dia}T00:00:00`);
  const diaSemana = dateObj.toLocaleDateString("es-AR", { weekday: "long" }).toLowerCase();

  if (!nombre || !fecha || !hora) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  const disponibilidad = readDisponibilidad();

  if (!disponibilidad.diasHabiles.includes(diaSemana)) {
    return res.status(400).json({ mensaje: "Ese día no está habilitado para turnos" });
  }

  if (!disponibilidad.horarios.includes(hora)) {
    return res.status(400).json({ mensaje: "Ese horario no está disponible" });
  }

  const db = readData();
  const yaExiste = db.find(t => t.fecha === fecha && t.hora === hora);
  if (yaExiste) {
    return res.status(400).json({ mensaje: "Ese turno ya está reservado" });
  }

  const nuevoTurno = {
    id: db.length > 0 ? db[db.length - 1].id + 1 : 1,
    nombre,
    fecha,
    hora
  };

  db.push(nuevoTurno);
  writeData(db);
  res.status(201).json(nuevoTurno);
});

app.get("/turnos", (req, res) => {
  const db = readData();
  res.json(db);
});

app.get("/disponibilidad", (req, res) => {
  const disponibilidad = readDisponibilidad();
  res.json(disponibilidad);
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});