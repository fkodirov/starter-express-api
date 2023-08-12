const Router = require("express");
const router = new Router();
const userController = require("../controllers/UserController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/registration", userController.registration);
router.post("/login", userController.login);
router.post("/logout", userController.logout);
router.get("/refresh", userController.refresh);
router.get("/users", authMiddleware, userController.getUsers);
router.get("/user/:id", authMiddleware, userController.getUser);
router.delete("/users/:id", authMiddleware, userController.deleteUsers);
router.put("/users/:id", authMiddleware, userController.updateUsers);

module.exports = router;
