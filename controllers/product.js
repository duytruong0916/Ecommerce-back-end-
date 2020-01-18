const Product = require('../models/product');
const formidable = require('formidable');
const fs= require('fs');
const _ = require('lodash');
const {errorHandler} = require('../helpers/dberrrorhandler');
//Middlewares
exports.productById = (req,res, next,id)=>{
    Product.findById(id)
    .populate("category")
    .exec((err,product)=>{
        if(err||!product){
            return res.status(400).json({error: 'Product Not Found'})
        }
        req.product = product;
        next();
    })
}
exports.read = (req,res) =>{
    req.product.photo = undefined;
    return res.json(req.product);
}
exports.create =(req,res)=>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files)=>{
        if(err) {
            return res.status(400).json({err: 'could not be uploaded'});
        }
        //check all the fields
        const {name, price, description, shipping, quantity, category} = fields;
        if(!name||!price||!description||!shipping||!quantity||!category){
            return res.status(400).json('All Fields Are Required')
        }
        let product = new Product(fields);

        if(files.photo){
            if(files.photo.size>1000000){
                return res.status(400).json({error: "Image should be less than 1mb in size"})
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType =  files.photo.type;
        }
        console.log(product)
        product.save((err, result)=>{
            if(err){
                return res.status(400).json({error: 'This fucking error is here'});
            }
            res.json(result)
        })
    })
}

exports.remove = (req,res)=>{
    let product = req.product;
    product.remove((err,deletedproduct)=>{
        if(err){
            res.status(400).json({err})
        }
        res.json({deletedproduct, message:'Product was deleted'});
    })
}
exports.update =(req,res)=>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files)=>{
        if(err) {
            return res.status(400).json({error: 'could not be uploaded'});
        }
        //check all the fields
        // const {name, price, description, shipping, quantity, category} = fields;
        // if(!name||!price||!description||!shipping||!quantity||!category){
        //     return res.status(400).json('All Fields Are Required')
        // }
        //update product using extend methos from lodash
        let product = req.product;
        product= _.extend(product,fields);

        if(files.photo){
            if(files.photo.size>1000000){
                return res.status(400).json({error: "Image should be less than 1mb in size"})
            }
            product.photo.data = fs.readFileSync(files.photo.path);
            product.photo.contentType =  files.photo.type;
        }
        product.save((err, result)=>{
            if(err){
                return res.status(400).json({error: errorHandler(err)});
            }
            res.json(result)
        })
    })
}
/*
    List and Sort
    SEll / ARRIVAL
    by sell /products?sortBy=sold&order=desc&limit=4
    by arrivial /products?sortBy=createdAt&order=desc&limit=4
*/
exports.list =(req,res)=>{
    let order = req.query.order ? req.query.order: 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy: '_id';
    let limit = req.query.limit ? parseInt(req.query.limit): 6;
    Product.find()
            .select("-photo")
            .populate("category")
            .sort([[sortBy,order]])
            .limit(limit)
            .exec((err,products)=>{
                if(err){
                    return res.status(400).json({error: "Products not found"});
                }
                res.send(products);
            })
   
}
/*it will find the products based on the req product category
  all products that have the same category will be return
*/
exports.listRelated =(req,res) =>{
    let limit = req.query.limit ? parseInt(req.query.limit): 6;
    Product.find({_id: {$ne: req.product}, category: req.product.category})
            .limit(limit)
            .populate('category', '_id name')
            .exec((err,products)=>{
                if(err){
                    return res.status(400).json({error: "Products not found"});
                }
                res.send(products);
            })

}

exports.listCategory = (req,res)=>{
    Product.distinct('category',{}, (err, categories)=>{
        if(err){
            return res.status(400).json({error: "category not found"});
        }
        res.send(categories);
    })
}
//list by category
exports.listByCategory =(req,res)=>{
    let order = req.query.order ? req.query.order: 'asc';
    let sortBy = req.query.sortBy ? req.query.sortBy: '_id';
    let limit = req.query.limit ? parseInt(req.query.limit): 100;
    let skip = req.query.skip? parseInt( req.query.skip):0;
    console.log(req.category._id)
    Product.find({category: req.category._id})
            .select("-photo")
            .populate("category")
            .sort([[sortBy,order]])
            .skip(skip)
            .limit(limit)
            .exec((err,products)=>{
                if(err){
                    return res.status(400).json({error: "Products not found"});
                }
                res.send(products);
            })
   
}
exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};
    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};

exports.photo = (req,res, next) =>{
    if(req.product.photo.data){
        res.set('content-type', req.product.photo.contentType)
        res.send(req.product.photo.data)
    }
    next();
}
exports.listSearch = (req,res) =>{
    //create query object to hold the search values and category
    const query ={};
    //assign values to query name + options i is for case sensitivily
    if(req.query.search){
        query.name = {$regex: req.query.search, $options: 'i'}
    }
    if(req.query.category&& req.query.category!=='All'){
        query.category = req.query.category;
    }
    //find the products based on the query object with 2 properties
    Product.find(query,(err,products)=>{
        if(err){
            return res.status(400).json({error: errorHandler(err)});
        }
        res.json(products)
        console.log(products)
    }).select('-photo');
}

//$inc ->include , 
exports.decreaseQuantity = (req,res,next)=>{
    let bulkOps =  req.body.order.products.map(item=>{
        return{
            updateOne:{
                filter: {_id: item._id},
                update: {$inc: {quantity: -item.count,sold: +item.count}}
            }
        }
    })
    Product.bulkWrite(bulkOps,{}, (error,products)=>{
        if(error){
            return res.status(400).json({error:'could not update the product'})
        }
        next();
    })
}