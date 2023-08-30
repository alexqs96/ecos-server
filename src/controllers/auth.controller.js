import bcrypt from "bcrypt";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

/**
 * Encripta contraseñas
 * @param {string} password - texto a encriptar
 * @returns {string} - texto encriptado
 */

async function hashPassword(password) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);
  return hash;
}

/**
 * Registro de usuarios
 * @returns {Object} - respuesta del estado de registro
 */

export const signUp = async (req, res) => {
  try {
    const { username, password, name, surname } = req.body;

    if (!username || !password || !name || !surname) {
      return res.status(400).send("Campos Incompletos");
    }

    const userFound = await User.findOne(
      { username: username.toLowerCase() },
      "+username",
    ).lean();

    if (userFound) {
      return res.status(400).send("El usuario ya se encuentra registrado");
    } else {
      const newUser = new User({
        username: username.toLowerCase(),
        password: await hashPassword(password),
        name: name.toLowerCase(),
        surname: surname.toLowerCase(),
      });

      await newUser.save();

      return res.status(201).send("Registro Exitoso");
    }
  } catch (error) {
    console.log(error);
    return res.status(500).send("Hubo un error en el servidor");
  }
};

/**
 * Inicio de sesión
 * en proceso, se necesita mejorar la seguridad
 * @returns {Object} - respuesta del estado de inicio
 */

export const signIn = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).send("Campos Incompletos");
    }

    const userFound = await User.findOne({ username: username.toLowerCase() })
      .select("password")
      .lean();

    if (userFound) {
      const validatePassword = await bcrypt.compare(
        password,
        userFound.password,
      );

      if (validatePassword) {
        delete userFound.password;

        const token = generateToken({ id: userFound._id });

        res.cookie("token", token, {
          path: "/",
          maxAge: 1000 * 60 * 60 * 24,
          httpOnly: true,
          sameSite: process.env.NODE_ENV !== "development" ? "None" : "strict",
          secure: process.env.NODE_ENV !== "development" ? true : false,
        });

        return res.status(200).send("Bienvenido");
      } else {
        return res.status(400).send("Credenciales invalidas");
      }
    } else {
      return res.status(400).send("El usuario no existe");
    }
  } catch (error) {
    return res.status(500).send("Hubo un error en el servidor");
  }
};

/**
 * Maneja el cierre de sesión
 */

export const signOut = async (req, res) => {
  try {
    res.cookie("token", "", {
      path: "/",
      sameSite: process.env.NODE_ENV !== "development" ? "None" : "strict",
      maxAge: -1,
      secure: process.env.NODE_ENV !== "development",
    });

    return res.status(200).send("Sesión Terminada");
  } catch (error) {
    return res.status(500).send("Hubo un error en el servidor");
  }
};

/**
 * Trae datos basicos del usuario para la navegacion por la pagina
 */

export const userData = async (req, res) => {
  try {
    const userId = req.user;

    if (!userId) {
      return res.status(400).end();
    }

    const userFound = await User.findById(userId).select(
      "username name surname photo -_id",
    );
    if (userFound) {
      return res.status(200).json(userFound);
    } else {
      return res.status(400).send("Usuario no existente");
    }
  } catch (error) {
    return res.status(500).send("Hubo un error en el servidor");
  }
};
