const User = require('../models/ultimate-user');
const Orderschema = require('../models/order');
const _ =require('lodash'); //for update
const {errorHandler} = require('../helpers/dberrrorhandler');
var bcrypt = require('bcryptjs');
exports.userById = (req,res,next,id) =>{
    User.findById(id).exec((err,user)=>{
        if(err||!user){
            return res.status(401).json({
                error: 'User not found'
            })
        }
        req.profile = user;
        next();
    })
}

exports.purchaseHistory = (req,res)=>{
    Orderschema.Order.find({user: req.profile._id})
         .populate('user', "_id lastname")
         .sort('-created')
         .exec((err,orders)=>{
             if(err){
                return res.status(400).json({error:errorHandler(err)})
             }
             res.json(orders);
             console.log(orders)
         })
}
exports.read = (req,res)=>{
    req.profile.password= undefined;
    return res.json(req.profile);

}
exports.update = (req,res)=>{
    const {firstname,lastname, email, password, address, phone} = req.body;
    console.log(req.body, req.profile)
    User.findOne({email:req.profile.email},(err,user)=>{
        if(err){
            console.log('Something went wrong. Try later')
            return res.status(400).json({error:'Something went wrong. Try later'})
        }
        const updatedFields = {
            password:password,
            firstname:firstname,
            lastname:lastname,
            email:email,
            address:address,
            phone:phone
        }
        user = _.extend(user,updatedFields);  //update fields
        console.log(user)
        user.save((err,success)=>{
            if(err){
                console.log(err)
                return res.status(400).json({error:'Error Updateing User'})
            }
            console.log('Updated User successfully');
            res.json(user);
        })
    })
   

}
// exports.update = (req,res)=>{
//     bcrypt.genSalt(10, (err, salt)=>{
//         let newuser = {
//             name: req.body.name,
//             email: req.body.email,
//             password: req.body.password
//         };
//         bcrypt.hash(newuser.password, salt, (err,hash)=>{
//             if(err) console.log(err);
//             newuser.password = hash;
//             console.log(newuser)
//             User.findByIdAndUpdate({_id: req.profile._id},
//                 {$set: {name: req.body.name, email: req.body.email, password:newuser.password}},
//                  {new:true}, (err, user)=>{
//                 if(err){
//                     return res.status(400).json({error: 'Action failed' })
//                 }
//                 user.password= undefined;
//                 res.json(user)
//             })
//         });
     
//     })

   
// }
exports.addOrderToHistory = (req,res,next)=>{
    let history = [];
    req.body.order.products.forEach(item=>{
        history.push({
            _id: item._id,
            name: item.name,
            description: item.description,
            category: item.category,
            quantity: item.quantity,
            transaction_id: req.body.order.transaction_id,
            amount: req.body.order.amount
        })
    })
    User.findByIdAndUpdate({_id: req.profile._id}, {$push: {history: history}}, {new:true}, (error,data)=>{
        if(error){
            return res.status(400).json({error:'cound not update user history'})
        }
        next();
    })
}
