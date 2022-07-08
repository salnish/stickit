const async = require("hbs/lib/async");
let db = require("../config/connection");
const mongoose = require("mongoose");
const User = require("../models/user");
const productData = require("../models/products");
const category = require("../models/category");
const wishlistmodel = require("../models/wishlist");
const couponmodel = require('../models/Coupon')

const Sub_Category = require("../models/sub_category");
const cartModel = require("../models/cart");
const ordermodel = require('../models/order')
require('dotenv').config();
let nodeMailer = require("nodemailer");

const bcrypt = require("bcrypt");
const Razorpay = require('razorpay');
const { resolve } = require("path");
const { response } = require("../app");
const { rejects } = require("assert");
const instance = new Razorpay({
  key_id: process.env.RAZORPAY_ID,
  key_secret: process.env.RAZORPAY_KEY,
});

// const async = require('hbs/lib/async')

module.exports = {
  // <-- add data to the user collection -->
  doSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      const user = await User.findOne({ email: userData.email });
      if (user) {
        reject({ status: false, msg: "Email already taken!" });
      } else {
        userData.password = await bcrypt.hash(userData.password, 10);

        const otpGenerator = Math.floor(1000 + Math.random() * 9000);
        const newUser = {
          name: userData.name,
          mobile: userData.mobile,
          email: userData.email,
          password: userData.password,
          otp: otpGenerator,
        };
        console.log(newUser);
        console.log("hlprs");
        if (newUser) {
          try {
            console.log("test");
            const mailTransporter = nodeMailer.createTransport({
              host: "smtp.gmail.com",
              service: "gmail",
              port: 465,
              secure: true,
              auth: {
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS,
              },
              tls: {
                rejectUnauthorized: false,
              },
            });

            const mailDetails = {
              from: 'salnizvlogz@gmail.com',
              to: userData.email,
              subject: "just testing nodemailer",
              text: "just random texts ",
              html: "<p>hi " + userData.name + " your otp " + otpGenerator + "",
            };
            mailTransporter.sendMail(mailDetails, (err, Info) => {
              if (err) {
                console.log(err + " mail not snd");
              } else {
                console.log("email has been sent ", Info.response);
              }
            });
          } catch (error) {
            console.log(error.message + " try error");
          }
        }
        resolve(newUser);
      }
    });
  },
  doLogin: (userData) => {
    console.log(userData);
    return new Promise(async (resolve, reject) => {
      if (!userData.email || !userData.password) {
        reject({ status: false, msg: "Enter all details" });
      } else {
      let loginStatus = false;
      let response = {};
      let user = await User.findOne({ email: userData.email });

      if (user) {
        if(!user.block){
          console.log(user);
          console.log(userData.password);
          console.log(user.password);
          bcrypt.compare(userData.password, user.password).then((status) => {
            if (status) {
              console.log("Login Success!");
              response.user = user;
              response.status = true;
              resolve(response);
            } else {
              console.log("Login Failed");
              reject({ status: false, msg: "Password not matching!" });
            }
          });
        }else{
          reject({ status: false, msg: "Your Account has been blocked!" });
        }
     
      } else {
        console.log("Login Failed");
        reject({ status: false, msg: "Email not registered, please sign up!" });
      }
    }
    });
  },
  // <-- update the value in password field of user collection document -->
  doReset: (userData) => {
    return new Promise(async (resolve, reject) => {
      const user = await User.findOne({ email: userData.email });
      console.log(user);

      if (user) {
        console.log(user._id);
        const otpGenerator = await Math.floor(1000 + Math.random() * 9000);
        const resetData = await {
          rId: user._id,
          email: userData.email,
          otp: otpGenerator,
        };
        console.log(resetData);
        console.log("hlprs");
        try {
          console.log("test");
          const mailTransporter = await nodeMailer.createTransport({
            host: "smtp.gmail.com",
            service: "gmail",
            port: 465,
            secure: true,
            auth: {
              user: process.env.NODEMAILER_USER,
              pass: process.env.NODEMAILER_PASS,
            },
            tls: {
              rejectUnauthorized: false,
            },
          });

          const mailDetails = await {
            from: 'salnizvlogz@gmail.com',
            to: resetData.email,
            subject: "Reset Password",
            text: "just random texts ",
            html:
              "<p>hi " +
              user.name +
              " your otp for reset Password " +
              otpGenerator +
              "",
          };
          mailTransporter.sendMail(mailDetails, (err, Info) => {
            if (err) {
              console.log(err + " mail not snd");
            } else {
              console.log("email has been sent ", Info.response);
            }
          });
        } catch (error) {
          console.log(error.message + " try error");
        }
        resolve(resetData);
      } else {
        console.log("no email");
        reject({ msg: "User doesn't Exists" });
      }
    });
  },
  // <-- update the value in password field of user collection document -->
  doresetPass: (rData, rid) => {
    console.log(rData);
    return new Promise(async (resolve, reject) => {
      let response = {};
      rData.password = await bcrypt.hash(rData.password, 10);

      let userId = rid;
      console.log(userId);
      let resetuser = await User.findByIdAndUpdate(
        { _id: userId },
        { $set: { password: rData.password } }
      );
      resolve(resetuser);
    });
  },

  getproductdetails: (proId) => {
    return new Promise(async (resolve, reject) => {
      let product = await productData.findOne({ _id: proId }).populate("Sub_Category").populate("category").lean();
      console.log(product);
      resolve(product);
    });
  },
  getCategoryProducts: (catId) => {
    return new Promise(async (resolve, reject) => {
    await productData.find({ category: catId }).populate('category').lean().then((productD)=>{
      resolve(productD);
    }).catch(()=>{
      reject();
    })
    
    });
  },

  getCategoryProductsHigh: (catId) => {
    return new Promise(async (resolve, reject) => {
    await productData.find({ category: catId }).populate('category').sort({price:1}).lean().then((productD)=>{
      resolve(productD);
    }).catch(()=>{
      reject();
    })
    
    });
  },

  getCategoryProductsLow: (catId) => {
    return new Promise(async (resolve, reject) => {
    await productData.find({ category: catId }).populate('category').sort({price:-1}).lean().then((productD)=>{
      resolve(productD);
    }).catch(()=>{
      reject();
    })
    
    });
  },

  getAddresses: (user) => {
    return new Promise(async (resolve, response) => {
      const Addresses = await User.findOne({ _id: user }).lean();
      // console.log(Addresses.address);
      resolve(Addresses);
    });
  },
  addAddress: (userId, data) => {
    return new Promise(async (resolve, reject) => {
      console.log(data);
      const user = User.findOne({ _id: userId });
      await User.findOneAndUpdate(
        { _id: userId },
        {
          $push: {
            address: {
              fname: data.fname,
              lname: data.lname,
              house: data.house,
              locality:data.locality,
              towncity: data.towncity,
              district: data.district,
              state: data.state,
              pincode: data.pincode,
              email: data.email,
              mobile: data.mobile,
            },
          },
        }
      );
      resolve();
    });
  },
  deleteAddress: (addressId, user) => {
    return new Promise(async (resolve, reject) => {
      const address = await User.updateOne(
        { _id: user._id },
        { $pull: { address: { _id: addressId } } }
      );
      resolve();
    });
  },
  getIndex: () => {
    return new Promise(async (resolve, reject) => {
      let data = {};
      data.dealOfDay = await productData.find({productType:"Deal of the Day"}).limit(5).lean();
      data.mostSelling = await productData.find({productType:"Most Selling"}).limit(5).lean();
      data.featured = await productData.find({productType:"Featured Product"}).limit(5).lean();
      data.newProducts = await productData.find({productType:"New Arrival"}).limit(5).lean();
      data.allCategory = await category.find({}).lean();
      console.log(data);
      resolve(data);
    });
  },
   addToCart: (proId, userId) => {
    console.log(proId + "proId");
    return new Promise(async (resolve, reject) => {
      const product = await productData.findOne({ _id: proId });
      const usercart = await cartModel.findOne({ user: userId });

      if (usercart) {
        const proExist = usercart.products.findIndex(
          (products) => products.pro_id == proId
        );
        console.log(proExist);
        if (proExist != -1) {
          console.log(proId);
          cartModel
            .updateOne(
              { "products.pro_id": proId, user: userId },
              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then((response) => {
              resolve();
            });
        } else {
          await cartModel
            .findOneAndUpdate(
              { user: userId },
              {
                $push: {
                  products: {
                    pro_id: proId,
                    price: product.price,
                  },
                },
              }
            )
            .then(() => {
              resolve({ msg: "'Added,count:res.products.length+1" });
            });
        }
      } else {
        const cartObj = new cartModel({
          user: userId,

          products: {
            pro_id: proId,
            price: product.price,
          },
        });
        await cartObj.save(async (err, result) => {
          if (err) {
            resolve({ error: "cart not created" });
          } else {
            console.log("hallo");
            resolve({
              msg: "cart is added",
              count: 1,
            });
          }
        });
      }
    });
  },

  cartItems: (userId) => {
    // console.log(userId);
    return new Promise(async (resolve, reject) => {
      const cartDetails = await cartModel
        .findOne({ user: userId })
        .populate("products.pro_id")
        .lean();
      // console.log(cartDetails);
      resolve(cartDetails);
    });
  },
  changeproductquantity: (data, user) => {
    // let id=mongoose.Types.ObjectId(user);
    cart = data.cartid;
    proId = data.product;
    quantity = data.quantity;
    count = data.count;
    const procount = parseInt(count);
    console.log(cart);
    return new Promise(async (resolve, response) => {
      if (count == -1 && quantity == 1) {
        await cartModel
          .findOneAndUpdate(
            { user: user._id },
            {
              $pull: { products: { _id: cart } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        await cartModel
          .findOneAndUpdate(
            { user: user._id, "products.pro_id": data.product },
            {
              $inc: { "products.$.quantity": procount },
            }
          )
          .then((response) => {
            resolve(true);
          });
      }
    });
  },
  getcartcount: (userid) => {
    let id = mongoose.Types.ObjectId(userid);
    return new Promise(async (resolve, reject) => {
     
      const user = await cartModel.findOne({ user: userid });

      // console.log(user);
      if (user) {
        const total = await cartModel.aggregate([
          {
            $match: { user: id },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              quantity: "$products.quantity",
              price: "$products.price",
            },
          },
          {
            $project: {
              productname: 1,
              quantity: 1,
              price: 1,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$quantity"  },
            },
          },
        ]);
        console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
        console.log(total)
        console.log(total.length)
        if(total==0){
          count=0;
          resolve(count)
         
        }else{
          let find=total.pop();
          let count= find.total;
          resolve(count);
         
      }
      } else {
         count = 0;
        resolve(count);
      }
    });
  },
  getAllCoupons:()=>{
    console.log("kasjfkjk");
    return new Promise (async(resolve,reject)=>{
      const AllCoupons=await couponmodel.find({}).lean()
      resolve(AllCoupons)
    })
  },



  subtotal: (user) => {
    // console.log(user);
    let id = mongoose.Types.ObjectId(user);
    return new Promise(async (resolve, reject) => {
      const amount = await cartModel.aggregate([
        {
          $match: { user: id },
        },
        {
          $unwind: "$products",
        },
        {
          $project: {
            id: "$products.pro_id",
            total: { $multiply: ["$products.price", "$products.quantity"] },
          },
        },
      ]);
      // console.log(amount, "fjshfdshi");
      let cartdata = await cartModel.findOne({ user: id });
      // console.log(cartdata);
      if (cartdata) {
        // console.log("-------------------------");
        amount.forEach(async (amt) => {
          await cartModel.updateMany(
            { "products.pro_id": amt.id },
            { $set: { "products.$.subtotal": amt.total } }
          );
        });
        resolve();
      }
    });
  },
  removeFromcart: (data, user) => {
    return new Promise(async (resolve, reject) => {
      await cartModel
        .findOneAndUpdate(
          { user: user._id },
          {
            $pull: { products: { _id: data.cart } },
          }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },
  totalamount: (userData) => {
    // console.log(userData);
    const id = mongoose.Types.ObjectId(userData);
    // console.log('----------------------------------------');
    return new Promise(async (resolve, reject) => {
      const cartItems = await cartModel.find({user:userData});
  


      if(cartItems){
        const total = await cartModel.aggregate([
          {
            $match: { user: id },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              quantity: "$products.quantity",
              price: "$products.price",
            },
          },
          {
            $project: {
              productname: 1,
              quantity: 1,
              price: 1,
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$price"] } },
            },
          },
        ]);
        console.log('nnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnnn');
        console.log(total)
        if (total.length == 0) {
          resolve({ status: true });
        } else {
          let grandTotal = total.pop();
          resolve({ grandTotal, status: true });
        }
      }else{
        reject()
      }
     
    });
  },
  DeliveryCharge: (amount) => {
    console.log(amount + "total");
    return new Promise((resolve, reject) => {
      if (amount >= 1000) {
        resolve(0);
      } else {
        resolve(40);
      }
    });
  },
  grandTotal: (netTotal, DeliveryCharges) => {
    return new Promise((resolve, reject) => {
      const grandTotal = netTotal + DeliveryCharges;
      resolve(grandTotal);
    });
  },
  validateCoupon: (data, userId) => {
    console.log(data);
  return new Promise(async (resolve, reject) => {
    console.log(data.coupon);
    obj = {};
    


   const coupon =await couponmodel.findOne({ couponCode: data.coupon });
    if (coupon) {
      if (coupon.limit > 0) {
        checkUserUsed = await couponmodel.findOne({
          couponCode: data.coupon,
          usedUsers: { $in: [userId] },
        });
        if (checkUserUsed) {
          obj.couponUsed = true;
          obj.msg = " You Already Used A Coupon";
          console.log(" You Already Used A Coupon");
          resolve(obj);
        } else {
          let nowDate = new Date();
              date = new Date(nowDate);
              console.log(date)
          if (date <= coupon.expirationTime) {
            
            await couponmodel.updateOne(
              { couponCode: data.coupon },
              { $push: { usedUsers: userId } }
          );

          await couponmodel.findOneAndUpdate(
              { couponCode: data.coupon },
              { $inc: { limit: -1 } }
          );
            let total = parseInt(data.total);
            let percentage = parseInt(coupon.discount);
            let discoAmount = ((total * percentage) / 100).toFixed()
            // console.log();
            obj.discoAmountpercentage=percentage;
            obj.total = total - discoAmount;
            obj.success = true;
            resolve(obj);
          } else {
            obj.couponExpired = true;
            console.log("This Coupon Is Expired");
            resolve(obj)
          }
        } 
      }else{
        obj.couponMaxLimit = true;
        console.log("Used Maximum Limit");
        resolve(obj)
      }
    } else {
      obj.invalidCoupon = true;
      console.log("This Coupon Is Invalid");
      resolve(obj)
    }
  });
},


  placeOrder: (order, products, total, DeliveryCharges, netTotal, user) => {
    const id = mongoose.Types.ObjectId(user._id);
    return new Promise(async (resolve, reject) => {
      console.log(order);
      console.log(products.products);

      const status = order.paymentMethod === 'cod' ? 'placed' : 'Order failed'
      const orderObj = await ordermodel({
        user_Id: user._id,
        Total: order.total,
        ShippingCharge: DeliveryCharges,
        grandTotal: order.mainTotal,
        coupondiscountedPrice:order.discountedPrice,
        couponPercent:order.discoAmountpercentage,
        couponName:order.couponName,
        payment_status: status,
        paymentMethod: order.paymentMethod,
        ordered_on: new Date(),
        product: products.products,
        deliveryDetails: {
          name: order.fname,
          number: order.number,
          email: order.email, 
          house: order.house,
          localplace: order.localplace,
          town: order.town,
          district: order.district,
          state: order.state,
          pincode: order.pincode
        },

      })
      await orderObj.save(async (err, res) => {
          const data = await cartModel.aggregate([
          {
            $match: { user: id},
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              quantity: "$products.quantity",
              id: "$products.pro_id",
            },
          },
        ]);
        data.forEach(async (amt) => {
          await productData.findOneAndUpdate(
            { _id: amt.id },
            { $inc: { stock: -(amt.quantity) } }
          );
        });
        await cartModel.deleteOne({ user: order.userId })
        // if (orderObj) {
        //   try {
        //     console.log("test");
        //     const mailTransporter = nodeMailer.createTransport({
        //       host: "smtp.gmail.com",
        //       service: "gmail",
        //       port: 465,
        //       secure: true,
        //       auth: {
        //         user: 'salnizvlogz@gmail.com',
        //         pass: 'mdpxpjugevusgaas',
        //       },
        //       tls: {
        //         rejectUnauthorized: false,
        //       },
        //     });

        //     const mailDetails = {
        //       from:'salnizvlogz@gmail.com',
        //       to: order.email,
        //       subject: "Order Placed",
        //       text: "just random texts ",
        //       html: "<p>hi " + order.fname + " your order "+status,
        //     };
        //     mailTransporter.sendMail(mailDetails, (err, Info) => {
        //       if (err) {
        //         console.log(err + " mail not snd");
        //       } else {
        //         console.log("email has been sent ", Info.response);
        //       }
        //     });
        //   } catch (error) {
        //     console.log(error.message + " try error");
        //   }
        // }
        resolve(orderObj);
      })
    })
  },

  getorderProducts: (orderid) => {
    console.log(orderid);
    return new Promise(async (resolve, reject) => {
      const orderdetails = await ordermodel.findOne({ _id: orderid }).populate("product.pro_id").lean()
      // console.log(orderdetails);
      resolve(orderdetails)
    })
  },

  generateRazorpay: (orderid, totalamount) => {
    // console.log(orderid);
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalamount * 100,  // amount in the smallest currency unit
        currency: "INR",
        receipt: "" + orderid
      };
      instance.orders.create(options, function (err, order) {
        // console.log("new"+order);
        resolve(order)
      });

    })


  },

  verifyPayment: (details) => {
    return new Promise((resolve, reject) => {
      let crypto = require("crypto");
      let hmac = crypto.createHmac('sha256','20Qyjx2KbEutyNfnRu2pz8va')

      hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
      hmac = hmac.digest('hex')
      if (hmac == details['payment[razorpay_signature]']) {
        console.log("000000000000");
        resolve()
      } else {
        console.log("5555555555555555");
        reject()
      }
    })
  },
  changePayementStatus: (orderid) => {
    return new Promise(async (resolve, reject) => {

      const changestatus = await ordermodel.findOneAndUpdate({ _id: orderid },
        {
          $set: { payment_status: 'placed' }
        }
      ).then((changestatus) => {
        resolve(changestatus)
      })
    })
  },

  getallorders: (user) => {
    console.log(user);
    return new Promise(async (resolve, reject) => {
      const allorders = await ordermodel.find({ user_Id: user }).populate("product.pro_id").sort({ordered_on:-1}).lean()
      console.log(allorders);
      resolve(allorders)

    })
  },


  cancelorder:(data)=>{
    console.log("-----------------");
    console.log(data);
    const status='Cancelled'
    return new Promise (async(resolve,reject)=>{
      const cancelorder=await ordermodel.findOneAndUpdate({_id:data.orderId,'product.pro_id':data.proId},
      {
       $set:{
        "product.$.status":status,
        cancelled:true,
      }
    },
    )
    await productData.findOneAndUpdate({_id:data.proId},
      {
        $inc:{
          Stock:1
        }
      })
    resolve()

    })
  },


  
  addTowishlist: (proId, userId) => {
    return new Promise(async (resolve, reject) => {
      const userdt = await wishlistmodel.findOne({ user_id: userId });
      if (userdt) {
        const proExist = userdt.products.findIndex(
          (products) => products.pro_Id == proId
        );  
        if (proExist != -1) {
          resolve({ error: "product already in wishlist" });
        } else { 
          await wishlistmodel
            .findOneAndUpdate(
              { user_id: userId },
              { $push: { products: { pro_Id: proId } } }
            )
              resolve({ msg: "added"});
        }
      } else {
        const newwishlist = new wishlistmodel({
          user_id: userId,
          products: { pro_Id: proId },
        });
        await newwishlist.save((err, result) => {
          if (err) {
            resolve({ msg: "not added to wishlist" });
          } else {
            resolve({ msg: "wislist created" });
          }
        });
      }
    });
  },

  getwishlist: (userid) => {
    return new Promise(async (resolve, reject) => {
      // console.log(userid);
      const wishlist = await wishlistmodel
        .findOne({ user_id: userid._id })
        .populate("products.pro_Id")
        .lean();
      // console.log(wishlist);
      resolve(wishlist);
    });
  },

  deletewishlist: (proId, user) => {
    // console.log(user);
    console.log(proId);
    return new Promise(async (resolve, response) => {
      const remove = await wishlistmodel.updateOne(
        { user_id: user },
        { $pull: { products: { pro_Id: proId.cart } } }
      );
      resolve({ msg: "comfirm delete" });
    });
  },
  checkWishList: (proId, user) => {
    return new Promise(async (resolve, reject) => {
      console.log("0000000000000000000000000000000000000000000000000000000000")
      let wishlist = await wishlistmodel.findOne({user_id:user._id}).elemMatch("products",{pro_Id:proId})
      console.log(wishlist)
      resolve(wishlist)
    })
  }
  
};
