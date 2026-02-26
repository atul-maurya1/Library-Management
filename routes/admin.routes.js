import express from 'express'

const adminRoute = express.Router()

import {
    registerLibrarian,
    dashboard,
    addBook,
    registerMember,
    adminLogin, 
    librarianList,
    issueBook,
    logout,
    searchMember,
    returnBook,
    memberDisable,
    memberActive,
} from '../controller/admin.controller.js'


import {isLoggedIn, authorizedRoles} from '../middleware/auth.js'


adminRoute.get('/dashboard',isLoggedIn, authorizedRoles('ADMIN'), dashboard) //*
adminRoute.post('/login' , adminLogin) //*
adminRoute.post('/logout', isLoggedIn, authorizedRoles('ADMIN'), logout) //*
adminRoute.post('/register-lib', isLoggedIn, authorizedRoles('ADMIN'), registerLibrarian) //*
adminRoute.post('/add-book', isLoggedIn, authorizedRoles('ADMIN'), addBook) //*
adminRoute.post('/register-member', isLoggedIn, authorizedRoles('ADMIN'), registerMember) //*
// adminRoute.get('/profile', adminProfile)

adminRoute.get('/librarian-list', isLoggedIn, authorizedRoles('ADMIN'), librarianList) //*
adminRoute.post('/member', isLoggedIn, authorizedRoles('ADMIN'), searchMember) //*  
adminRoute.post('/member/book-issue/:id', isLoggedIn, authorizedRoles('ADMIN'), issueBook) //*
adminRoute.post('/member/book-return/:id', isLoggedIn,  authorizedRoles('ADMIN'), returnBook)
adminRoute.put('/member/disable/:id', isLoggedIn, authorizedRoles('ADMIN'), memberDisable)
adminRoute.put('/member/active/:id', isLoggedIn, authorizedRoles('ADMIN'), memberActive)

// add unthurization

export default adminRoute