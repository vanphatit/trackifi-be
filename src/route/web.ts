import express, { Application, Router, Request, Response } from "express";
import * as homeController from "../controllers/homeController";

const router: Router = express.Router();

const initWebRoutes = (app: Application): Application => {
  // Cách 1: định nghĩa trực tiếp trong router
  router.get("/", (req: Request, res: Response) => {
    return res.send("Lê Văn Phát - 22110196");
  });

  // Cách 2: gọi hàm trong controller
  router.get("/home", homeController.getHomePage);
  router.get("/about", homeController.getAboutPage);
  router.get("/crud", homeController.getCRUD);
  router.post("/post-crud", homeController.postCRUD);
  router.get("/get-crud", homeController.getFindAllCrud);
  router.get("/edit-crud", homeController.getEditCRUD);
  router.post("/put-crud", homeController.putCRUD);
  router.get("/delete-crud", homeController.deleteCRUD);

  return app.use("/", router);
};

export default initWebRoutes;
