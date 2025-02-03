const express = require('express')
const session = require('express-session')
const userRouter = require('./router/userRouter')
const employeRouter = require('./router/employeRouter')
const computerRouter = require('./router/computerRouter')
const assigneRouter = require('./router/assigneRouter')

const app = express()
app.use(express.static('./public'))
app.use(express.urlencoded({extended: true}))
app.use("/uploads", express.static('uploads'))

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}))
app.use(userRouter)
app.use(employeRouter)
app.use(computerRouter)
app.use(assigneRouter)

app.listen(3001,() => {
    console.log('Connecté sur le port 3001');
    
})