const express       = require('express');
const router        = express.Router();

const AuthController = require('../controller/AuthController');

router.post('/register', AuthController.register);

// route.post('/register', user_controller.Register);
// route.post('/login', user_controller.Login);
// route.post('/token', auth_middleware.verifyRefreshToken, user_controller.GetAccessToken);
// route.get('/logout', auth_middleware.verifyToken, user_controller.Logout);

module.exports = router;