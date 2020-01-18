const express = require('express');
const router = express.Router()
const  {create, productById, read, remove,update, list, listRelated, listByCategory,listCategory,listBySearch,listSearch,photo} = require('../controllers/product')
const  {requireSignin, isAuth, isAdmin} = require('../controllers/auth');
const  {userById} = require('../controllers/user');
const {categoryById} = require('../controllers/category');


router.get('/product/:productid', read);
router.get('/products', list);
router.put('/product/:productid/:userid', requireSignin,isAuth, isAdmin, update);
router.get('/products/related/:productid',listRelated)
router.get('/products/listbycategory/:categoryid',listByCategory)
router.get('/products/categories', listCategory)
router.get('/product/photo/:productid',photo)
router.get("/products/search", listSearch);
// route - make sure its post
router.post("/products/by/search", listBySearch);
router.post('/product/create/:userid',requireSignin,isAuth, isAdmin,create);
router.delete('/product/:productid/:userid', requireSignin,isAuth, isAdmin, remove);
router.param('userid', userById);
router.param('productid', productById);
router.param('categoryid',categoryById);
module.exports = router;
