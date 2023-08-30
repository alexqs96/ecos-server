import User from "../models/User.js";

/**
 * Obtiene los 5 ultimos usuarios registrados
 * @returns {Object} - Array con los usuarios encontrados
 * @throws {Error} - Estado del servidor
 */

export const newUsers = async (req, res) => {
  try {
    const limitUsers = 10;

    const newUsers = await User.find({}, "-password -_id")
      .sort({ createdAt: -1 })
      .limit(limitUsers)
      .lean();

    return res.status(200).json(newUsers);
  } catch (error) {
    return res.status(500).json({
      message: "Hubo un error en el servidor",
    });
  }
};

/**
 * Obtiene los datos de perfil de un usuario especifico
 * @returns {Object} - Objeto con datos
 * @throws {Error} - Estado del servidor
 */

export const viewProfile = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({
        message: "Ingresa un usuario a buscar",
      });
    }

    const userFound = await User.findOne(
      { username: username.toLowerCase() },
      "-password -_id",
    )
      .populate({
        path: "posts",
        populate: [
          {
            path: "comments",
            populate: {
              path: "creator",
              select: "username photo -_id",
            },
            options: { sort: { createdAt: -1 } },
          },
          {
            path: "creator",
            select: "username photo -_id",
          },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    if (userFound) {
      return res.status(200).json(userFound);
    } else {
      return res.status(400).json({
        message: "Usuario no encontrado",
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Hubo un error en el servidor",
    });
  }
};
