const express= require('express'); 
const router =  express.Router(); 
const  {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const  {userById, addOrderToHistory} = require('../controllers/user');
const {decreaseQuantity} = require('../controllers/product');
const  {create, orderById,listOrders,getStatus,updateOrderStatus} = require('../controllers/order');


router.get('/order/list/:userid', requireSignin, isAuth, isAdmin, listOrders)
router.put('/order/:orderid/:userid', requireSignin, isAuth, isAdmin,  updateOrderStatus)
router.post('/order/create/:userid',requireSignin, isAuth,addOrderToHistory,decreaseQuantity, create);
router.get('/order/status-values/:userid',requireSignin, isAuth,getStatus);
router.param('userid', userById);
router.param('order', orderById);
module.exports = router;