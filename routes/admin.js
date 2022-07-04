var express = require('express');
var router = express.Router();
const admin = require('../models/admin')
const Category = require("../models/category")
const Sub_Category = require("../models/sub_category")
const adminHelpers = require('../helpers/adminHelpers')
var Storage = require('../middleware/multer');
const { response } = require('../app');
const async = require('hbs/lib/async');
const verifyAdmin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin");
  }
};

/* GET home page. */
router.get('/', function (req, res, next) {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  if (req.session.adminLoggedIn) {

    res.redirect('/admin/land');
  } else {
    res.render('admin/login', { logErr: req.session.logErr, layout: "adminlayout" });
  }
  req.session.logErr = null;

});
router.post('/login', (req, res) => {
  adminHelpers.doAdminLogin(req.body).then((response) => {
    if (response.admin) {
      req.session.adminLoggedIn = true;
      req.session.admin = response.admin
      res.json(response)
    }
    else {

      req.session.logErr = true
      res.redirect('/admin')
    }
  })
    .catch((err) => {
     res.json(err.msg)
    })

})

router.get('/land', verifyAdmin,async function (req, res, next) {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  res.render('admin/land', { layout: "adminlayout", adminLogged: req.session.admin });
});
router.get('/viewUser', verifyAdmin, function (req, res, next) {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  adminHelpers.getallusers().then((userData) => {
    console.log(userData);
    res.render("admin/viewUser", { userData, adminLogged: req.session.admin, layout: "adminlayout" });
  });


});
router.get("/Blockuser/:id", (req, res) => {
  const proId = req.params.id;
  console.log(proId);
  console.log("sdjfhusguasuashguahshasdgs");
  adminHelpers.Blockuser(proId).then((response) => {
    res.json({ status: true })

  });
});
router.get("/UnBlockuser/:id", (req, res) => {
  const proId = req.params.id;
  console.log("esfhusayfuahiuashahsfhasdu");
  adminHelpers.UnBlockuser(proId).then((response) => {
    res.json({ status: true })
  });
});
router.get('/viewProducts', verifyAdmin, function (req, res, next) {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  adminHelpers.getallProducts().then((productData) => {
    console.log(productData);
    // const alert = req.flash("msg");
    res.render("admin/view-products", { productData, adminLogged: req.session.admin, layout: "adminlayout" });
  });


});
router.get('/logout', (req, res) => {
  req.session.adminLoggedIn = false;
  req.session.destroy()
  console.log('admin logout')
  res.redirect('/admin')
})
router.get('/addcategory', verifyAdmin, (req, res) => {
  res.header('Cache-control', 'no-cache,private, no-store, must-revalidate,max-stale=0,post-check=0,pre-check=0');
  adminHelpers.getallcategory().then((allcategory) => {
    adminHelpers.getallsubcategory().then((allsubcategory) => {
      console.log(allcategory);
      res.render('admin/add-category', { allcategory, allsubcategory, adminLogged: req.session.admin, layout: "adminlayout", catErr: req.session.catErr, subcaterr: req.session.subcaterr })
      req.session.subcaterr = null;
      req.session.catErr = null;

    })


  })

})
router.post('/addcategory', Storage.fields([{ name: 'image', maxCount: 1 }]), (req, res) => {
  let img = req.files.image[0].filename;
  adminHelpers.addcategory(req.body, img).then((response) => {
    res.redirect('/admin/addcategory')
  }).catch((error) => {
    req.session.catErr = error.msg;
    res.redirect("/admin/addcategory");
  });
})
router.post('/addsubcategory', (req, res) => {
  console.log(req.body);
  adminHelpers.addsubcategory(req.body).then((response) => {
    res.redirect('/admin/addcategory')
  }).catch((err) => {
    req.session.subcaterr = err.msg;
    res.redirect("/admin/addcategory");
  })
})


router.get('/addproduct', verifyAdmin, async (req, res) => {
  const category = await adminHelpers.getallcategory();
  const subcategory = await adminHelpers.getallsubcategory()
  console.log(subcategory)
  res.render('admin/add-product', { category, subcategory, adminLogged: req.session.admin, layout: "adminlayout" })

})


router.post('/addProduct', Storage.fields([{ name: 'image', maxCount: 1 }]), function (req, res) {

  console.log(req.body);
  console.log(req.files);

  // product=[...{req.body}]
  //   console.log("product is"+product.pro)
  let img = req.files.image[0].filename;

  console.log(img);
  adminHelpers.addProduct(req.body, img).then((response) => {
    console.log(response)
    res.redirect('/admin/addproduct')
  })
})
router.get("/deleteproduct/:id", (req, res) => {
  const proId = req.params.id
  adminHelpers.deleteproduct(proId).then((response) => {
    req.session.removedproduct = response
    res.redirect('/admin/viewProducts')
  })
  console.log(proId);
})
router.get("/deletecategory/:id", (req, res) => {
  const catId = req.params.id
  adminHelpers.deletecategory(catId).then((response) => {
    req.session.removedcategory = response
    res.redirect('/admin/addcategory')
  })
  console.log(catId);
})
router.get("/deletesubcategory/:id", (req, res) => {
  const subcatId = req.params.id
  adminHelpers.deletesubcategory(subcatId).then((response) => {
    req.session.removedsubcategory = response
    res.redirect('/admin/addcategory')
  })
  console.log(subcatId);
})
router.get("/Editproduct/:id", async (req, res) => {
  let product = await adminHelpers.getproductdetails(req.params.id);
  console.log(product);
  const category = await adminHelpers.getallcategory();
  const subcategory = await adminHelpers.getallsubcategory();
  console.log("shdfysg");
  console.log(product.category)
  // console.log(product.productName);
  res.render("admin/edit-product", {
    subcategory,
    category,
    product,
    adminLogged: req.session.admin,
    layout: "adminlayout"
  });
});
router.post(
  "/editproduct/:id",
  Storage.fields([{ name: 'image', maxCount: 1 }]),
  function (req, res) {
    const proId = req.params.id;
    const img = req.files.image
      ? req.files.image[0].filename
      : req.body.image;

    console.log(img);
    adminHelpers
      .updateProduct(req.body, proId, img)
      .then((response) => {
        console.log(response);
        res.redirect("/admin/viewProducts");
      });
  }
);
// -----order management------
router.get('/viewOrder', verifyAdmin, (req, res) => {
  console.log("fsjh");
  adminHelpers.allorders().then((response) => {
    const allorders = response
    res.render('admin/viewOrders', { layout: "adminlayout", adminLogged: req.session.admin, allorders })
  })
})

router.get('/viewOrderProducts/:id',verifyAdmin,(req,res)=>{
  adminHelpers.orderdetails(req.params.id).then((response)=>{
    const order=response
    res.render('admin/viewOrderDetails',{layout: "adminlayout", adminLogged: req.session.admin,order}) 

  })
});

router.post('/changeOrderStatus',(req,res)=>{
  console.log('inside change')
  adminHelpers.changeOrderStatus(req.body).then((response)=>{
    res.redirect('/admin/viewOrder')
  })
})

router.post('/changeProductType',(req,res)=>{
  console.log('inside change')
  adminHelpers.changeProductType(req.body).then((response)=>{
    res.redirect('/admin/viewProducts')
  })
})

router.get('/coupon-manegement',verifyAdmin,(req,res)=>{
  adminHelpers.getAllCoupons(req.body).then((response)=>{
    console.log(response);
    const AllCoupons=response
    res.render('admin/manageOffers',{AllCoupons,layout: "adminlayout", adminLogged: req.session.admin})
  })
})


router.get("/deletecoupon/:id", (req, res) => {
  console.log(req.params.id);
  adminHelpers.deletecoupon(req.params.id).then((response) => {
    res.json({ coupondeleted: true });
  });
});


router.get('/addcoupon',verifyAdmin,(req,res)=>{
  
  res.render('admin/addcoupon',{layout: "adminlayout", adminLogged: req.session.admin})
})
router.post('/AddCoupon',(req,res)=>{
  console.log('00000000000000000000000000000000000000000000000')
  console.log(req.body)
  adminHelpers.AddCoupon(req.body).then(()=>{
    res.redirect('/admin/coupon-manegement')
  })
})




module.exports = router;
