const express = require('express')
const firebase = require('./firebase/firebase')
const nanoid = require('nanoid')
const app = express()
const db = firebase.database()


app.listen(process.env.PORT || 5000)

app.set('view engine', 'ejs')

app.use(express.urlencoded())

app.get('/',(req,res) => {
    res.render('index')
})

app.post('/process',(req,res) => {
    res.send("DONE BRO")
})