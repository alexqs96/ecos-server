import Comment from "../models/Comment.js";
import Post from "../models/Post.js";
import User from "../models/User.js";
import { v2 as cloudinary } from "cloudinary";

const SERVER_ERROR = "Hubo un error en el servidor: ";

/**
 * Obtiene los 5 ultimos usuarios registrados
 * @returns {Object} - Array con los usuarios encontrados
 * @throws {Error} - Estado del servidor
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

/**
 * Obtiene los posts y llena los campos con los datos relacionados a cada post
 * @returns los posts o el estado de la accion
 */

export const getPosts = async (req, res) => {
  try {
    const newPosts = await Post.find()
      .populate("creator", "username")
      .populate({
        path: "comments",
        populate: {
          path: "creator",
          select: "username photo -_id",
        },
      })
      .populate({
        path: "likes",
        select: "username -_id",
      })
      .sort({ createdAt: -1 })
      .lean();

    newPosts.forEach((post) => {
      if (post.likes && post.likes.length > 0) {
        post.likes = post.likes.map((like) => like.username);
      }
    });

    return res.status(200).json(newPosts);
  } catch (error) {
    console.log("ERRRROR: " + error);
    return res.status(500).send(SERVER_ERROR + error);
  }
};

/**
 * Maneja la creacion de posts
 * @returns estado de la accion
 */

export const createPost = async (req, res) => {
  try {
    const { image, content } = req.body;

    if (!content) {
      return res.status(400).send("Escribi algo..");
    }

    let urlImage = "";

    if (image.length > 0) {
      const result = await cloudinary.uploader.upload(image);
      urlImage = result.secure_url;
    }

    const newPost = new Post({
      creator: req.user,
      content,
      images: [urlImage],
    });

    const postSaved = await newPost.save();

    await User.findByIdAndUpdate(
      req.user,
      {
        $push: { posts: postSaved._id },
      },
      { new: true },
    );

    return res.status(200).send("Post Creado");
  } catch (error) {
    console.log(error);
    return res.status(500).send(SERVER_ERROR + error);
  }
};

/**
 * Maneja la creacion de comentarios para un post especifico
 * @returns estado de la accion realizada
 */

export const createComment = async (req, res) => {
  try {
    const { image, content, id } = req.body;

    if (!id) {
      return res.status(400).send("Falta el id del post");
    }

    if (!content) {
      return res.status(400).send("Escribi algo..").end();
    }

    let urlImage = "";

    if (image.length > 0) {
      const result = await cloudinary.uploader.upload(image);
      urlImage = result.secure_url;
    }

    const newComment = new Comment({
      creator: req.user,
      content,
      image: urlImage,
    });

    const commentSaved = await newComment.save();

    await Post.findByIdAndUpdate(
      id,
      {
        $push: { comments: commentSaved._id },
      },
      { new: true },
    );

    return res.status(200).send("Post Creado");
  } catch (error) {
    console.log(error);
    return res.status(500).send(SERVER_ERROR + error);
  }
};

/**
 * Agrega o Saca un like de un post, segun el usuario que lo accione
 * @returns estado de la accion realizada
 */

export const handleLikes = async (req, res) => {
  try {
    const { id } = req.body;
    const { user } = req;

    if (!user || !id) {
      return res.status(400).send("accion cancelada");
    }

    const liked = await Post.findOne({ _id: id, likes: user }).populate(
      "likes",
    );

    if (liked) {
      await Post.findByIdAndUpdate(
        id,
        {
          $pull: { likes: user },
        },
        { new: true },
      );
    } else {
      await Post.findByIdAndUpdate(
        id,
        {
          $push: { likes: user },
        },
        { new: true },
      );
    }

    return res.status(200).send(liked ? "Like removido" : "Like agregado");
  } catch (error) {
    console.log(error);
    return res.status(500).send(SERVER_ERROR + error);
  }
};
