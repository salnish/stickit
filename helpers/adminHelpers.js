let db = require("../config/connection");
const bcrypt = require("bcrypt");
const Admin = require("../models/admin");
const category = require("../models/category");
const Sub_Category = require("../models/sub_category");
const async = require("hbs/lib/async");
const User = require("../models/user");
const productData = require("../models/products");
const orderModel = require("../models/order");
const couponmodel = require("../models/Coupon");
const cartModel = require("../models/cart");
const wishlistmodel = require("../models/wishlist");
const { collection } = require("../models/admin");
let fs = require("fs");
const { resolve } = require("path");
const { response } = require("../app");
module.exports = {
  // <--check the data in admin collection authenticate admin-->
  doAdminLogin: (adminData) => {
    console.log(adminData);

    return new Promise(async (resolve, reject) => {
      if (!adminData.email || !adminData.password) {
        reject({ status: false, msg: "Enter all details" });
      } else {
        let loginStatus = false;
        let response = {};
        let admin = await Admin.findOne({ email: adminData.email });

        if (admin) {
          console.log(admin);
          console.log(adminData.password);
          console.log(admin.password);
          bcrypt.compare(adminData.password, admin.password).then((status) => {
            if (status) {
              console.log("Login Success!");
              response.admin = admin;
              response.status = true;
              resolve(response);
            } else {
              console.log("Login Failed");
              reject({ status: false, msg: "Password not matching!" });
            }
          });
        } else {
          console.log("Login Failed");
          reject({ status: false, msg: "Unauthorised Entry !" });
        }
      }
    });
  },

  salesReport:(data)=>{
    let response={}
       let {startDate,endDate} = data

  let d1, d2, text;
  if (!startDate || !endDate) {
      d1 = new Date();
      d1.setDate(d1.getDate() - 7);
      d2 = new Date();
      text = "For the Last 7 days";
    } else {
      d1 = new Date(startDate);
      d2 = new Date(endDate);
      text = `Between ${startDate} and ${endDate}`;
    }
 

// Date wise sales report
const date = new Date(Date.now());
const month = date.toLocaleString("default", { month: "long" });

       return new Promise(async(resolve,reject)=>{

let salesReport=await orderModel.aggregate([

{
  $match: {
    ordered_on: {
      $lt: d2,
      $gte: d1,
    },
  },
},
{
 $match:{payment_status:'placed'}
},
{
  $group: {
    _id: { $dayOfMonth: "$ordered_on" },
    total: { $sum: "$grandTotal" },
  },
},
])

console.log(salesReport);


 let brandReport = await orderModel.aggregate([
   {
     $match:{payment_status:'placed'}
    },
   {
      $unwind: "$product",
    },{
      $project:{
          brand: "$product.productName",
          quantity:"$product.quantity"
      }
    },
   
    {
      $group:{
          _id:'$brand',
          totalAmount: { $sum: "$quantity" },
    
      }
    },
    { $sort : { quantity : -1 }} ,
    { $limit : 5 },
    
    ])
    console.log("]]]]]]]]]]]]]]]");
    console.log(brandReport);



let orderCount = await orderModel.find({date:{$gt : d1, $lt : d2}}).count()

console.log(orderCount);
let totalAmounts=await orderModel.aggregate([
 {
   $match:{payment_status:'placed'}
  },
 {
   $group:
   {
     _id: null,
     totalAmount: { $sum:"$grandTotal"}

     
   }
 }
])

console.log(totalAmounts);

let totalAmountRefund=await orderModel.aggregate([
 {
   $match:{status:'placed'}
  },
 {
   $group:
   {
     _id: null,
     totalAmount: { $sum:'$reFund'
       }

     
   }
 }
])

console.log('5555555555555555555555555555555555555555555555555555555555555555555555');
console.log(totalAmountRefund);




response.salesReport=salesReport
response.brandReport=brandReport
response.orderCount=orderCount
response.totalAmountPaid=totalAmounts.totalAmount
response.totalAmountRefund=totalAmountRefund.totalAmount

resolve(response)      
       })
        
     },


  // <--get all data from User collection-->
  getallusers: () => {
    return new Promise(async (resolve, reject) => {
      let users = await User.find().lean();

      resolve(users);
    });
  },
  Blockuser: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { block: true } },
        { upsert: true }
      );
      resolve(user);
    });
  },

  UnBlockuser: (userId) => {
    return new Promise(async (resolve, reject) => {
      const user = await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { block: false } },
        { upsert: true }
      );
      resolve(user);
    });
  },
  // <--adding data to Category collection-->
  addcategory: (data, image) => {
    return new Promise(async (resolve, reject) => {
      console.log(data);
      const categoryname = data.category;
      if (categoryname && image) {
        const categorydata = await category.findOne({ category: categoryname });
        if (categorydata) {
          reject({ status: false, msg: "category already taiken" });
        } else {
          const addcategory = await new category({
            category: categoryname,
            image: image,
          });
          await addcategory.save();
          resolve(addcategory);
        }
      } else {
        reject({ status: false, msg: "Fields are empty" });
      }
    });
  },
  // <--get all data from Category collection-->
  getallcategory: () => {
    return new Promise(async (resolve, reject) => {
      const allcategory = await category.find({}).lean();
      resolve(allcategory);
    });
  },
  // <--get all data from Sub_Category collection-->
  getallsubcategory: () => {
    return new Promise(async (resolve, reject) => {
      const Sub = await Sub_Category.find({}).lean();
      resolve(Sub);
    });
  },
  // <--adding data to Sub_Category collection-->
  addsubcategory: (Data) => {
    return new Promise(async (resolve, reject) => {
      const sub_categoryname = Data.Subcategory;
      const categoryname = Data.categoryname;
      console.log(sub_categoryname);
      const categorydata = await category.findOne({ category: categoryname });
      const sub_categorydata = await Sub_Category.findOne({
        $and: [
          { Sub_category: sub_categoryname },
          { category: categorydata._id },
        ],
      });
      if (sub_categorydata) {
        reject({ status: false, msg: "Sub category already taken" });
      } else {
        const addsubcategory = await new Sub_Category({
          Sub_category: sub_categoryname,
          categoryId: categorydata._id,
          categoryName: categorydata.category,
        });
        await addsubcategory.save(async (err, result) => {
          if (err) {
            reject({ msg: "sub category not added" });
          } else {
            resolve({ result, msg: "subcategory" });
          }
        });
      }
    });
  },
  // add product
  addProduct: (data, image) => {
    return new Promise(async (resolve, reject) => {
      console.log(data);
      const sub_categorydata = await Sub_Category.findOne({
        Sub_category: data.Sub_category,
      });
      const categorydata = await category.findOne({
        category: data.categoryname,
      });
      console.log(categorydata);
      console.log(sub_categorydata);
      // const categorydata=await category.findOne({category:data.categoryname})
      //   console.log(product.productName+'/////////////');.
      // console.log(image1);

      const newproduct = await productData({
        productName: data.productName,
        description: data.description,
        price: data.price,
        discount: data.discount,
        dimension: data.dimension,
        stock: data.stock,
        Sub_Category: sub_categorydata._id,
        category: categorydata._id,
        image: image,
      });
      console.log(newproduct);
      await newproduct.save(async (err, res) => {
        if (err) {
          console.log("not saved" + err);
        }
        resolve({ data: res, msg: "success" });
      });
    });
  },
  changeProductType: (data) => {
    return new Promise(async (resolve, reject) => {
      await productData
        .findByIdAndUpdate(
          { _id: data.proId },
          { $set: { productType: data.productType } }
        )
        .then((response) => {
          console.log("777777777777777777777777777777777777777777777777777");
          resolve(response);
        })
        .catch((err) => {
          console.log(
            err,
            "7777777777777777777777777777777777777777777777777777777777"
          );
        });
    });
  },

 
  getallProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await productData
        .find({})
        .populate("Sub_Category")
        .populate("category")
        .lean();
      resolve(products);
    });
  },
  deleteproduct: (proId) => {
    return new Promise(async (resolve, reject) => {
      let productid = proId;
      const remove = await wishlistmodel.updateOne({
        $pull: { products: { pro_Id: proId } },
      });

      const cartRemove = await cartModel.updateOne({
        $pull: { products: { pro_id: proId } },
      });
      let product = await productData.findById({ _id: productid });
      fs.unlink("" + product.image, function (err) {
        if (err) return console.log(err);
        console.log("file deleted successfully");
      });
      const removedproduct = await productData.findByIdAndDelete({
        _id: productid,
      });
      resolve(removedproduct);
    });
  },
  deletecategory: (catId) => {
    return new Promise(async (resolve, reject) => {
      let categoryid = catId;
      const removedcategory = await category.findByIdAndDelete({
        _id: categoryid,
      });
      resolve(removedcategory);
    });
  },
  deletesubcategory: (subcatId) => {
    return new Promise(async (resolve, reject) => {
      let subcategoryid = subcatId;
      const removedsubcategory = await Sub_Category.findByIdAndDelete({
        _id: subcategoryid,
      });
      resolve(removedsubcategory);
    });
  },
  getproductdetails: (proId) => {
    return new Promise(async (resolve, reject) => {
      let product = await productData.findOne({ _id: proId }).lean();
      let proSubCategory = await Sub_Category.findById({
        _id: product.Sub_Category,
      }).lean();
      console.log(proSubCategory);
      product.Sub_Category = proSubCategory.Sub_category;
      product.category = proSubCategory.categoryName;
      console.log(product);
      resolve(product);
    });
  },
  updateProduct: (data, proId, image) => {
    return new Promise(async (resolve, reject) => {
      const sub_categorydata = await Sub_Category.findOne({
        Sub_category: data.Sub_category,
      });
      const categorydata = await category.findOne({
        category: data.categoryname,
      });
      const updateProduct = await productData.findByIdAndUpdate(
        { _id: proId },
        {
          $set: {
            productName: data.productName,
            price: data.price,
            description: data.description,
            discount: data.discount,
            dimension: data.dimension,
            stock: data.stock,
            Sub_Category: sub_categorydata._id,
            Category: categorydata._id,
            Image: image,
          },
        }
      );
      resolve({ updateProduct, msg: "Edited" });
    });
  },

  //---- order Management------
  allorders: () => {
    return new Promise(async (resolve, reject) => {
      const allorders = await orderModel
        .find({})
        .populate("product.pro_id")
        .lean();
      // console.log(allorders.userId);
      resolve(allorders);
    });
  },

  orderdetails: (orderID) => {
    return new Promise(async (resolve, reject) => {
      const orderdetails = await orderModel
        .findOne({ _id: orderID })
        .populate("product.pro_id")
        .lean();
      resolve(orderdetails);
    });
  },
  changeOrderStatus: (data) => {
    console.log(data);
    return new Promise(async (resolve, reject) => {
      const state = await orderModel.findOneAndUpdate(
        { _id: data.orderId, "product._id": data.proId },
        {
          $set: {
            "product.$.status": data.orderStatus,
          },
        }
      );
      console.log(state, "state");

      resolve();
    }).catch((err) => {
      console.log(err, "errrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
    });
  },

  AddCoupon: (data) => {
    console.log(data);
    return new Promise(async (resolve, reject) => {
      const newCoupon = new couponmodel({
        couponName: data.couponName,
        couponCode: data.couponCode,
        limit: data.limit,
        expirationTime: data.expirationTime,
        discount: data.discount,
      });
      await newCoupon.save();
      resolve();
    });
  },

  getAllCoupons: () => {
    console.log("kasjfkjk");
    return new Promise(async (resolve, reject) => {
      const AllCoupons = await couponmodel.find({}).lean();
      resolve(AllCoupons);
    });
  },

  deletecoupon: (couponId) => {
    return new Promise(async (resolve, reject) => {
      console.log(couponId);
      const deletecoupon = await couponmodel.findByIdAndDelete({
        _id: couponId,
      });
      resolve(deletecoupon);
    });
  },
};
