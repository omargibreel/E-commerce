import authRouter from "./modules/auth/auth.router.js";
import categoryRouter from "./modules/category/category.router.js";
import subcategoryRouter from "./modules/subcategory/subcategory.router.js";
import brandRouter from "./modules/brand/brand.router.js";
import productRouter from "./modules/product/product.router.js";
import couponRouter from "./modules/coupon/coupon.router.js";
import cartRouter from "./modules/cart/cart.router.js";
import orderRouter from "./modules/order/order.router.js";
import reviewRouter from "./modules/review/review.router.js";
import morgan from "morgan";
import cors from "cors";

export const appRouter = (app, express) => {
  // morgan
  if (process.env.NODE_ENV === "dev") {
    app.use(morgan("common"));
  }

  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // CORS
  // const whitelist = ["http://127.0.0.1:5500"];
  // app.use((req, res, next) => {
  //   console.log(req.header("origin"));
  //   if (req.originalUrl.includes("/auth/confirmEmail")) {
  //     res.setHeader("Access-Control-Allow-Origin", "*");
  //     res.setHeader("Acccess-Control-Allow-Methods", "GET");
  //     return next();
  //   }
  //   if (!whitelist.includes(req.header("origin"))) {
  //     return next(new Error("Blocked By CORS!"));
  //   }
  //   res.setHeader("Access-Control-Allow-Origin", "*");
  //   res.setHeader("Access-Control-Allow-Headers", "*");
  //   res.setHeader("Acccess-Control-Allow-Methods", "*");
  //   res.setHeader("Acccess-Control-Allow-Private-Network", true);
  //   return next();
  // });
  app.use((req, res, next) => {
    if (req.originalUrl === "/order/webhook") {
      return next();
    }
    express.json()(req, res, next);
  });

  app.use(cors()); // allow all origins
  ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // Global Middleware => parsing for req.body
  app.use(express.json()); // parse req.body to json

  // Routes
  // auth
  app.use("/auth", authRouter);

  // category
  app.use("/category", categoryRouter);

  // subcategory
  app.use("/subcategory", subcategoryRouter);

  // brand
  app.use("/brand", brandRouter);

  // product
  app.use("/product", productRouter);

  // coupon
  app.use("/coupon", couponRouter);

  // cart
  app.use("/cart", cartRouter);

  // order
  app.use("/order", orderRouter);
  // review
  app.use("/review", reviewRouter);

  // Not Found Page Router
  app.all("*", (req, res, next) => {
    return next(new Error(`page not found`, { cause: 404 }));
  });
  // Global Error Handler
  app.use((error, req, res, next) => {
    return res
      .status(error.cause || 500)
      .json({ success: false, message: error.message, stack: error.stack });
  });
};
