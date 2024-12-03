const express = require('express');
const router = express.Router();
const {SignUp,Login,Logout,Profile,votePortal,Vote,ResetPassword} = require('../Controllers/user')
const {jwtAuthMiddleware} = require('../Middlewares/jwt');


// POST route to add a person
router.post('/signup', SignUp)
      .get('/signup',(req,res)=>{
        res.render('SignUpPage',{error:null});
    })

// Login Route
router.post('/login', Login)
       .get('/login',(req,res)=>{
        res.render('LoginPage',{error:null})
       })

router.post('/logout',Logout)

       // Profile route
router.get('/profile', jwtAuthMiddleware,Profile)

router.get('/voteportal',jwtAuthMiddleware,votePortal);

router.post('/vote/:candidateID', jwtAuthMiddleware,Vote);

router.put('/profile/password', jwtAuthMiddleware,ResetPassword);

module.exports = router;