import express from 'express'

const librarianRoute = express.Router()

import {login, 
        logout,
        getDashboard,
        findMember,
        bookIssue,
        returnBook,
        getProfile,
        changePassword,
        addBook,
    } from '../controller/librarian.controller.js'

import {isLoggedIn, authorizedRoles }  from '../middleware/auth.js'

librarianRoute.post('/login', login)
librarianRoute.post('/logout', isLoggedIn, authorizedRoles('LIBRARIAN'), logout)
librarianRoute.get('/dashboard', isLoggedIn, authorizedRoles('LIBRARIAN'), getDashboard)
librarianRoute.post('/member', isLoggedIn, authorizedRoles('LIBRARIAN'), findMember)
librarianRoute.post('/member/book-issue/:id', isLoggedIn, authorizedRoles('LIBRARIAN'), bookIssue)
librarianRoute.post('/member/return-book/:id', isLoggedIn, authorizedRoles('LIBRARIAN'), returnBook)
//librarianRoute.post('/member/pay-fine/:id' , payFine)
librarianRoute.get('/get-profile', isLoggedIn, authorizedRoles('LIBRARIAN'), getProfile)
librarianRoute.post('/get-profile/change-password', isLoggedIn, authorizedRoles('LIBRARIAN'), changePassword)
librarianRoute.post('/add-book' , isLoggedIn, authorizedRoles('LIBRARIAN'), addBook)


export default librarianRoute

// issue and return book
// add and disable member id
// add book
// pay member fine