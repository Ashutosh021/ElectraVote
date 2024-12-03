const express = require('express');
const adminRouter = express.Router();
const {jwtAuthMiddleware} = require('../Middlewares/jwt');
const { adminHome,Nomination,UpdateNomination,WithdrawNomination,Vote,CountVote,CandidateList} = require('../Controllers/admin')
const isAdmin = require("../Middlewares/isAdmin")

adminRouter.get('/',jwtAuthMiddleware,isAdmin,adminHome)
// POST route to add a candidate
adminRouter.post('/nomination', jwtAuthMiddleware,isAdmin,Nomination )

adminRouter.post('/update/:candidateID', jwtAuthMiddleware,isAdmin,UpdateNomination )

adminRouter.post('/withdraw/:candidateID', jwtAuthMiddleware,isAdmin,WithdrawNomination )

// let's start voting


// vote count 
adminRouter.get('/count/vote',jwtAuthMiddleware,isAdmin,CountVote);

// Get List of all candidates with only name and party fields
adminRouter.get('/list',jwtAuthMiddleware,isAdmin,CandidateList);

module.exports = adminRouter;