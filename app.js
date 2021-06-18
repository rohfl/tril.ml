const express = require('express')
const firebase = require('./firebase/firebase')
const { nanoid } = require('nanoid')
const validUrl = require('valid-url')
const app = express()
const db = firebase.database()


app.listen(process.env.PORT || 5000)

app.use(express.static(__dirname + '/views'))

app.set('view engine', 'ejs')

app.use(express.urlencoded())

app.get('/',async (req,res) => {

    var totalurls = 0
    await db.ref().child("TotalUrls").get().then((snapshot) => {
        if (snapshot.exists()) {
            totalurls = snapshot.val()
        }
    }).catch((error) => {
        console.error(error)
    })

    res.render('index',{totalurls : totalurls})
})

app.post('/checkurl',(req,res) => {

    longurl = req.body.longurl
    customurl = req.body.customurl.length!=0?req.body.customurl:nanoid(8)

    if(customurl === 'about') {
        res.status(400).json({ response: "Custom url already exists" })
    }

    checkCustom(req,res,customurl,longurl)

})


app.get('/404', (req, res) => {
    
    res.render('404')
    
})

app.get('/about',(req,res) => {
    console.log("Hello About")
    res.render('about')
})

app.get('/api',(req,res) => {
    console.log("Hello API")
    res.render('api')
})

app.get('/favicon.ico', (req, res) => {

    res.status(404).send("")

})

app.get('/api/custom/:customurl',(req,res) => {

    var recurl = req.params.customurl
    var longurl = recurl.split('|')[0]
    var customurl = recurl.split('|')[1]
    if(longurl.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g) != null) {
        console.log(longurl)
        // customurl = nanoid(8)
        apiFun(res,customurl,longurl)
    }
    else {
        res.status(400).json({response : "Enter a Valid URL."})
    }

    // console.log("Hello API")
    // res.render('api')
})

app.get('/api/:longurl',(req,res) => {
    
    var longurl = req.params.longurl

    if(longurl.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g) != null) {
        console.log(longurl)
        customurl = nanoid(8)
        apiFun(res,customurl,longurl)
    }
    else {
        res.status(400).json({response : "Enter a Valid URL."})
    }
})

app.get('/:customurl', (req, res) => {
    console.log("Hello There")
    const customurl = req.params.customurl

    db.ref().child("customurls").child(customurl).get().then((snapshot) => {
        if (snapshot.exists()) {
            res.redirect(snapshot.val())
        } else {
            res.redirect('/404')
        }
    }).catch((error) => {
        console.error(error)
    })

})


function checkCustom(req,res,customurl,longurl) {

    db.ref().child("customurls").child(customurl).get().then((snapshot) => {
        if(snapshot.exists()) {
            res.status(400).json({ response: "Custom url already exists" })
        }
        else {
            db.ref("customurls/" + customurl).set(longurl)
            updateTotalUrlsAndSendData(res,customurl)
            // returnData(res,customurl)
        }
    }).catch((error) => {
        res.status(400).json({ response: "There was some error" })
        console.error(error)
    })

}

async function updateTotalUrlsAndSendData(res,customurl) {

    await db.ref("TotalUrls")
    .transaction(function(searches) {
        return (searches || 0) + 1
    })
    
    await db.ref().child("TotalUrls").get().then((snapshot) => {
        if (snapshot.exists()) {
            totalurls = snapshot.val()
            res.status(200).json({customurl:customurl, totalurls:totalurls})
        }
    }).catch((error) => {
        console.error(error)
    })
}

async function apiFun(res, customurl, longurl) {
    await db.ref().child("customurls").child(customurl).get().then((snapshot) => {
        if(snapshot.exists()) {
            res.status(400).json({ response: "Custom URL already exist." })
        }
        else {
            db.ref("customurls/" + customurl).set(longurl)
            res.status(200).json({customurl})
            // returnData(res,customurl)
            updateTotalUrls()
        }
    }).catch((error) => {
        res.status(400).json({ response: "There was some error" })
        console.error(error)
    })
}

function updateTotalUrls() {

    db.ref("TotalUrls")
    .transaction(function(searches) {
        return (searches || 0) + 1
    })
}
