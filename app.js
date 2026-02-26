import express from 'express'
import 'dotenv/config'
import {errorMiddleware} from './middleware/error.js'
import cookieParser from 'cookie-parser'

import connectDb from './config/db.js'
import admin from './admin/admin.js'
import adminRoute from './routes/admin.routes.js'
import librarianRoute from './routes/librarian.routes.js'

const app = express(); 

connectDb()
admin()

app.use(express.urlencoded({ extended: true }));  
app.use(express.json())
app.use(cookieParser())
 

app.use('/api/v1/admin', adminRoute)
app.use('/api/v1/librarian', librarianRoute)


app.use(errorMiddleware)

app.use((req, res , next) => {
    res.send(`<h1>404 Page not found</h1>`)
   
})


export default app  