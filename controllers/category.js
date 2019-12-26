const Category = require('../models/category');
const {errorHandler} = require('../helpers/dberrrorhandler');

exports.categoryById = (req,res,next,id) =>{
    Category.findById(id).exec((err,category)=>{
        if(err||!category){
            console.log("errororor")
            return res.status(400).json({error: "Category Not Found"});
            
        }
        console.log("errororor")
        req.category = category;
        next();
    })
}
exports.read = (req,res)=>{
    return res.json(req.category);
}
exports.create = (req,res) =>{
    const category = new Category(req.body);
    console.log(req.body)
    category.save((err, data)=>{
        if(err||!data){
            return res.status(400).json({error: errorHandler(err)});
        } 
        res.json({data});
    }
    )
}
exports.remove = (req,res)=>{
    const category = req.category;
    category.delete((err,deletedcategory)=>{
        if(err){
            return res.status.json({err})
        }
        res.json({deletedcategory, message: 'Category was deleted'});
    })
}
exports.update = (req,res)=>{
    const category = req.category;
    category.name =  req.body.name;
    category.save((err,data)=>{
        if(err){
            return res.status(400).json({error: errorHandler(err)});
        }
        res.json(data);
    })
}
exports.list =(req,res)=>{
    Category.find().exec((err,data)=>{
        if(err){
            return res.status(400).json({error: errorHandler(err)});
        }
        res.json(data);
    })
}
