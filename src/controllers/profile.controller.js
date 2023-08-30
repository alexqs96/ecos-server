import User from "../models/User.js";

/**
 * Obtiene los datos de perfil de un usuario especifico, queda pendiente editarlo para se enfoque mas en el usuario logueado
 * @returns {Object} - Objeto con datos
 * @throws {Error} - Estado del servidor
 */

export const getProfile = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(400).json({
        message: "Id no especificado",
      });
    }

    const userFound = await User.findById(user, "-password -_id")
      .populate({
        path: "posts",
        populate: {
          path: "comments",
          populate: {
            path: "creator",
            select: "username photo -_id",
          },
          options: { sort: { createdAt: -1 } },
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    if (userFound) {
      return res.status(200).json({
        message: "Perfil de @" + userFound.username,
        data: userFound,
      });
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
