import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
  try {
    const token = req.cookies["token"];

    if (!token) {
      return res.send("inicia sesión para realizar esta acción").end();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(401).json({
          message: "No estas autorizado para estar en esta pagina",
        });
      }
      req.user = user.id;
      next();
    });
  } catch (error) {
    console.log(error);
    return res.status(400).send("Auth server error");
  }
};
