var express = require('express');
const async = require('hbs/lib/async');
const userHelpers = require('../helpers/userHelpers');
const adminHelpers = require('../helpers/adminHelpers')
var router = express.Router();
const user = require('../models/user');
const cartModel = require("../models/cart")
const productData = require('../models/products');
const moment=require('moment')
const { response } = require('../app');
const veryfylogin = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

/* GET users listing. */

router.get('/', function (req, res, next) {
  userHelpers.getIndex().then(async (indexData) => {
    let user = req.session.user
    if(user){
      let cartcount =await userHelpers.getcartcount(req.session.user._id); 
    
    let categoryData = indexData.allCategory
    let mostSelling = indexData.mostSelling
    let dealOfDay = indexData.dealOfDay
    let featured = indexData.featured
    let newProducts = indexData.newProducts
    res.render("user/index", { user, categoryData, mostSelling,dealOfDay,featured,newProducts,cartcount});
  }else{

    let categoryData = indexData.allCategory
    let mostSelling = indexData.mostSelling
    let dealOfDay = indexData.dealOfDay
    let featured = indexData.featured
    let newProducts = indexData.newProducts
    res.render("user/index", { user, categoryData, mostSelling,dealOfDay,featured,newProducts,});
  }
  })
});

router.post('/search', async (req, res) => {
  let result = req.body['search_name'];
  let searchText = result.toLowerCase();
  console.log(result)
  console.log(searchText + "ooooooooooooooooooo");
  try {
    let products = await adminHelpers.getallProducts()

    if (searchText) {
      let productData = products.filter((u) => u.productName.includes(searchText));
      let categoryData = await adminHelpers.getallcategory()
      console.log(productData, "products");
      res.render("user/shop", { productData, categoryData, user:req.session.user})   

    }

  } catch (err) {
    console.log(err);
  }

})

router.get('/Login', function (req, res, next) {
  if (req.session.logedin) {
    res.redirect("/")
  } else
    res.render('user/Login', {
      loggErr: req.session.loggedInError,
      signuperror: req.session.loggErr2,

      title: 'userLogin'
    });

  req.session.loggErr2 = null
  req.session.loggedInError = null
});
router.get('/signup', function (req, res, next) {
  let passError = req.session.passError;
  res.render('user/signup', { passError, layout: false });
  req.session.passError=null;
});
// router.post('/signup',(req,res)=>{
//   userHelpers.doSignUp(req.body).then((response)=>{
//     console.log(response.data);
//     res.redirect('/login')
//   })
// })
router.post("/signUp", function (req, res, next) {
  if (req.body.password == req.body.newpassword) {
    userHelpers.doSignup(req.body).then((response) => {
      console.log(response);
      console.log(response.otp)
      req.session.otp = response.otp
      req.session.userdetails = response
      res.redirect('/otp');
    })
      .catch((err) => {
        req.session.loggErr2 = err.msg;
        res.redirect("/login");
      })
  } else {
    console.log("confirm password");
    req.session.passError = "confirm password"
    console.log(req.session.passError)
    res.redirect('/signup')

  }

});
router.get('/otp', function (req, res, next) {
  let otpError = req.session.signotpError
  res.render('user/otpSignup', { layout: false, otpError });
  req.session.signotpError=null
});
router.post('/otpverify', async (req, res) => {
  if (req.session.otp == req.body.otpsignup) {
    let userData = req.session.userdetails
    const adduser = await new user({
      name: userData.name,
      mobile: userData.mobile,
      email: userData.email,
      password: userData.password

    })
    await adduser.save()
    res.redirect('/login')
  }
  else {
    console.log("otp incorrect");
    req.session.signotpError = "OTP not matching!"
    // console.log(req.session.otpError)
    res.redirect('/otp')
  }
})
router.post('/login', (req, res) => {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  userHelpers.doLogin(req.body).then((response) => {
    if (response.user) {
      req.session.logedin = true;
      req.session.user = response.user
      res.redirect('/')
    }
    else {

      req.session.logedinErr = true
      res.redirect('/Login')
    }
  })
    .catch((err) => {
      req.session.loggedInError = err.msg;
      res.redirect("/login");
    })
})
router.get('/logout', (req, res) => {
  req.session.loggedIn = false;
  req.session.destroy()
  console.log('logout')
  res.redirect('/')
})
router.get('/forgotP', function (req, res, next) {
  let emailError = req.session.emailError
  res.render('reset/forgotpassword', { emailError, layout: false ,user:req.session.user});
});
router.post("/resetPass", function (req, res, next) {
  userHelpers.doReset(req.body).then((response) => {
    console.log(response.otp)
    req.session.resetotp = response.otp
    req.session.resetEmail = response.email
    req.session.rId = response.rId
    req.session.emailError = null
    res.redirect("/resetOtp")
  })
    .catch((err) => {
      console.log('email exist')
      req.session.emailError = err.msg;
      res.redirect("/forgotP");
    })


});
router.get('/resetOtp', function (req, res, next) {
  let otpError = req.session.otpError
  res.render('reset/resetOtp', { otpError });
});
router.post('/resetVerify', async (req, res) => {
  if (req.session.resetotp == req.body.resetOtp) {
    res.redirect('/newPass')
  }
  else {
    console.log("otp incorrect");
    req.session.otpError = "OTP not matching!"
    res.redirect('/resetOtp')
  }
})
router.get('/newPass', function (req, res, next) {
  let confirmErrr = req.session.confirmError
  res.render('reset/newPassword', { confirmErrr, layout: false });
});
router.post('/resetpassword', async (req, res) => {
  console.log(req.body);
  if (req.body.password == req.body.cpassword) {
    userHelpers.doresetPass(req.body, req.session.rId).then((response) => {
      console.log(response);
      res.redirect('/Login');
      console.log('Password updated');
    })
    
  } else {
    console.log('password mismatch');
    req.session.confirmError = "password mismatch"
  }



});
router.get('/userprofile', veryfylogin,async (req, res) => {
  let cartcount = await userHelpers.getcartcount(req.session.user._id);
  let user = req.session.user;
  let categoryData = await adminHelpers.getallcategory()
  res.render("user/account", { user,categoryData,cartcount })
})
router.get('/address-page', veryfylogin, async (req, res) => {
  let categoryData = await adminHelpers.getallcategory()
  let cartcount = await userHelpers.getcartcount(req.session.user._id);
  const Addresses = await userHelpers.getAddresses(req.session.user)
  console.log(Addresses);
  let user = req.session.user;
  res.render('user/address', { user, Addresses,categoryData,cartcount })
})
router.get("/addAddress", veryfylogin,async (req, res) => {
  let cartcount = await userHelpers.getcartcount(req.session.user._id);
  let user = req.session.user;
  res.render("user/addAddress", { user,cartcount })
})
router.post('/addAddress/:id', (req, res) => {
  userHelpers.addAddress(req.params.id, req.body).then((response) => {
    res.redirect('/address-page')
  })

})
router.get('/deleteAddress/:id', veryfylogin, (req, res) => {
  userHelpers.deleteAddress(req.params.id, req.session.user).then((response) => {
    res.redirect('/address-page')
  })
})
router.get('/shop', async (req, res, next) => {
  let cartcount = await userHelpers.getcartcount(req.session.user._id);
  let categoryData = await adminHelpers.getallcategory()
  adminHelpers.getallProducts().then((productData) => {
    console.log(productData);
   
    let user = req.session.user
    res.render("user/shop", { productData,categoryData, user,cartcount });
  });
});
router.get("/shopPage/:id", async (req, res) => {
  let user = req.session.user
  if(user){
    let cartcount = await userHelpers.getcartcount(req.session.user._id);
    let categoryData = await adminHelpers.getallcategory()
    userHelpers.getCategoryProducts(req.params.id).then((productData) => {
      
      
      console.log(categoryData)
      res.render("user/shop", { productData,categoryData, user,cartcount });
    }).catch(()=>{
      res.render("user/shop", { categoryData, user,cartcount });

    })
    
  }else{
  
  let categoryData = await adminHelpers.getallcategory()
  userHelpers.getCategoryProducts(req.params.id).then((productData) => {
    
    
    console.log(categoryData)
    res.render("user/shop", { productData,categoryData, user, });
  }).catch(()=>{
    res.render("user/shop", { categoryData });

  })
  }


});

router.get("/sortPageToHigh/:id", async (req, res) => {
  let categoryData = await adminHelpers.getallcategory()
  userHelpers.getCategoryProductsHigh(req.params.id).then(async(productData) => {
    let user = req.session.user
    if(user){
    let cartcount = await userHelpers.getcartcount(req.session.user._id);
    console.log(categoryData)
    res.render("user/shop", { productData,categoryData, user,cartcount});
    }else{
      res.render("user/shop", { productData,categoryData, user}); 
    }
  }).catch(async()=>{
    let user = req.session.user
    if(user){
    let cartcount = await userHelpers.getcartcount(req.session.user._id);
    console.log(categoryData)
    res.render("user/shop", { categoryData, user,cartcount});
    }else{
      res.render("user/shop", { categoryData, user}); 
    }
  })



});


router.get("/sortPageToLow/:id", async (req, res) => {
  let categoryData = await adminHelpers.getallcategory()
  userHelpers.getCategoryProductsLow(req.params.id).then(async(productData) => {
    let user = req.session.user
    if(user){
      let cartcount = await userHelpers.getcartcount(req.session.user._id);
      res.render("user/shop", { productData,categoryData, user,cartcount });
    }else{
      res.render("user/shop", { productData,categoryData, user });
    }
    
    console.log(categoryData)
    
  }).catch(async()=>{
    let user = req.session.user
    if(user){
    let cartcount = await userHelpers.getcartcount(req.session.user._id);
    console.log(categoryData)
    res.render("user/shop", { categoryData, user,cartcount});
    }else{
      res.render("user/shop", { categoryData, user}); 
    }
  })



});


router.get("/product-details/:id", async (req, res) => {
  console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
  let user = req.session.user
 await userHelpers.getproductdetails(req.params.id).then(async (product)=>{
  if(user){
    console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")
    let cartcount = await userHelpers.getcartcount(req.session.user._id);
    await userHelpers.checkWishList(req.params.id,user).then((wishlist)=>{
      console.log(wishlist)
      console.log("cccccccccccccccccccccccccccccccccccccccccccccccc")
      res.render("user/product", { product, user,wishlist,cartcount});
    })
  }else{
    console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
    res.render("user/product", { product, user});
  } 
 }).catch(async ()=>{
  if(user){
    console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb")
    let cartcount = await userHelpers.getcartcount(req.session.user._id);
    await userHelpers.checkWishList(req.params.id,user).then((wishlist)=>{
      console.log(wishlist)
      console.log("cccccccccccccccccccccccccccccccccccccccccccccccc")
      res.render("user/product", {  user,wishlist,cartcount});
    })
  }else{
    console.log("eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee")
    res.render("user/product", { user});
  } 

 })
 
});

//cart
router.get('/add-tocart/:id', veryfylogin, (req, res) => {
  console.log("call");
  console.log(req.session.user);
  userHelpers.addToCart(req.params.id, req.session.user).then((response) => {
    res.json({ status: true })

  })

});

router.get('/cart', veryfylogin, async (req, res) => {
  const user = req.session.user;
  let cartcount = await userHelpers.getcartcount(req.session.user._id);
  if (cartcount > 0) {
    console.log("--------------");
    const subtotal = await userHelpers.subtotal(req.session.user._id);
    const totalamount = await userHelpers.totalamount(req.session.user._id);
    const netTotal = totalamount.grandTotal.total;
    const DeliveryCharges = await userHelpers.DeliveryCharge(netTotal);
    const grandTotal = await userHelpers.grandTotal(netTotal, DeliveryCharges);
    let cartItems = await userHelpers.cartItems(req.session.user._id);
    console.log(cartItems)
    console.log(cartItems.products)
    console.log("===");
    res.render("user/cart", {
      user,
      cartItems,
      subtotal,
      netTotal,
      cartcount,
      DeliveryCharges,
      grandTotal,
    });
  } else {
    let cartItem = await userHelpers.cartItems(req.session.user._id);
    let cartItems = cartItem ? productData : [];
    res.render("user/emptyCart", {
      user
    });
  }
});

router.post('/change-product-quantity', async (req, res, next) => {
  console.log("rgisugiojsiodgr");
  userHelpers.changeproductquantity(req.body, req.session.user).then()
  res.json({ status: true });

});
router.post('/remove-Product-forcart', (req, res, next) => {
  console.log("shfshfjkdshfshfsh");
  userHelpers.removeFromcart(req.body, req.session.user).then(() => {
    res.json({ status: true })
  })
});




router.get('/checkout-pag', veryfylogin, async (req, res) => {
  

  const Addresses = await userHelpers.getAddresses(req.session.user)
  
 await userHelpers.totalamount(req.session.user._id).then(async (totalamount)=>{
  const netTotal = totalamount.grandTotal.total
  const DeliveryCharges = await userHelpers.DeliveryCharge(netTotal)
  const grandTotal = await userHelpers.grandTotal(netTotal, DeliveryCharges)
  let products = await userHelpers.cartItems(req.session.user._id);
  const AllCoupons = await adminHelpers.getAllCoupons();
  console.log('DeliveryCharges')
  console.log(DeliveryCharges);
  res.render('user/checkout', { Addresses, products,AllCoupons, netTotal, DeliveryCharges, grandTotal,user:req.session.user })
 }).catch(()=>{
  res.redirect('/')
 })

  
})

router.post("/place-order", async (req, res) => {
  // console.log("---------------------------------------------------");
  // console.log(req.session.user._id);
  const cartItem = await userHelpers.cartItems(req.session.user._id);
  const totalamount = await userHelpers.totalamount(req.session.user._id);
  const netTotal = totalamount.grandTotal.total;
  const DeliveryCharges = await userHelpers.DeliveryCharge(netTotal);
  const grandTotal = await userHelpers.grandTotal(netTotal, DeliveryCharges);
  userHelpers.placeOrder(req.body, cartItem, grandTotal, DeliveryCharges, netTotal, req.session.user).then((response) => {
    req.session.orderId = response._id;
    if (req.body["paymentMethod"] == "cod") {
      // console.log("++");
      res.json({ codSuccess: true });
    } else {
      // console.log("--");
      userHelpers.generateRazorpay(response._id, grandTotal).then((response) => {
        // console.log(response);
        res.json(response);
      });
    }
  });
});
router.post("/couponApply", async (req, res) => {
  let todayDate = new Date().toISOString().slice(0, 10);
  let userId = req.session.user._id;
  userHelpers.validateCoupon(req.body, userId).then((response) => {
    console.log(response);
    req.session.couponTotal = response.total;
    if (response.success) {
      res.json({
        couponSuccess: true,
        total: response.total,
        discountpers: response.discoAmountpercentage,
      });
    } else if (response.couponUsed) {
      res.json({ couponUsed: true });
    } else if (response.couponExpired) {
      res.json({ couponExpired: true });
    } else if (response.couponMaxLimit) {
      res.json({ couponMaxLimit: true });
    } else {
      res.json({ invalidCoupon: true });
    }
  });
});


router.post("/verify-Payment", (req, res) => {
  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers
      .changePayementStatus(req.body["order[receipt]"])
      .then((response) => {
        res.json({ status: true });
      })
  })
    .catch((err) => {
      res.json({ status: false });
    });
});

router.get("/viewOrderDetails", veryfylogin, async (req, res) => {
  console.log(req.session.orderId);
  let cartcount = await userHelpers.getcartcount(req.session.user._id);
  res.render("user/order-success",{user:req.session.user,cartcount});

});

router.get("/allorders", veryfylogin,async (req, res) => {
  let cartcount = await userHelpers.getcartcount(req.session.user._id);
  userHelpers.getallorders(req.session.user._id).then((response) => {
    const orders = response;
    const user=req.session.user
    
    console.log(orders.deliveryDetails);
    orders.forEach(element => {
      element.ordered_on = moment(element.ordered_on).format("MMM Do YY");
  
        });
    res.render("user/viewallOrders", { orders ,user,cartcount});
  });
});

router.get('/viewOrderProducts/:id', veryfylogin,async (req, res) => {
  console.log(req.params.id);
  let cartcount = await userHelpers.getcartcount(req.session.user._id);
  userHelpers.getorderProducts(req.params.id).then((response) => {
    console.log(response);
    const order = response;
    order.ordered_on=moment(order.ordered_on).format("MMM Do YY"); 
    res.render('user/orderdetails', { order, user: req.session.user,cartcount })
  })
})


router.post("/cancel-order", (req, res) => {
  console.log("klfjsdhkjsdgsioj");
  userHelpers.cancelorder(req.body).then((response) => {
    res.json({ status: true });
  });
});


router.get("/add-Towishlist/:id",veryfylogin, (req, res, next) => {

  console.log(req.params.id);
  userHelpers.addTowishlist(req.params.id, req.session.user._id).then((response)=>{
  res.json(response)
  })
});

router.get("/wishlist",veryfylogin, async (req, res) => {
  console.log("gufigsdusiuugsiusdis-----------------");
  let cartcount = await userHelpers.getcartcount(req.session.user._id);
  let wishlist = await userHelpers.getwishlist(req.session.user);
  res.render("user/wishlist", { wishlist,cartcount,user:req.session.user});
});

router.post("/deletewishlist",veryfylogin, async (req, res) => {
  userHelpers
    .deletewishlist(req.body, req.session.user._id)
    .then((response) => {
      res.json({ status: true }); 
    });
}); 


module.exports = router;
