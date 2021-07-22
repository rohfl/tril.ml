const express = require('express')
const firebase = require('./firebase/firebase')
const { nanoid } = require('nanoid')
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
    res.render('about')
})

app.get('/api',(req,res) => {
    res.render('api')
})

app.get('/favicon.ico', (req, res) => {

    res.status(404).send("")

})

app.get('/api/custom/*',(req,res) => {

    var recurl = req.params[0]
    var longurl = recurl.split('|')[0]
    var customurl = recurl.split('|')[1]
    if(isUrl(longurl)) {
        if(!longurl.indexOf("http://") == 0 && !longurl.indexOf("https://") == 0) {
            longurl = 'https://' + longurl
        }
        apiFun(res,customurl,longurl)
    }
    else {
        res.status(400).json({response : "Enter a Valid URL."})
    }
})

app.get('/api/*',(req,res) => {
    
    var longurl = req.params[0]

    if(isUrl(longurl)) {
        if(!longurl.indexOf("http://") == 0 && !longurl.indexOf("https://") == 0) {
            longurl = 'https://' + longurl
        }
        customurl = nanoid(8)
        apiFun(res,customurl,longurl)
    }
    else {
        res.status(400).json({response : "Enter a Valid URL."})
    }
})

app.get('/:customurl', (req, res) => {
    const customurl = req.params.customurl

    db.ref().child("customurls").child(customurl).get().then((snapshot) => {
        if (snapshot.exists()) {
            // console.log("FOUND")
            const red = snapshot.val()
            res.redirect(red)
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

function isUrl(s) {
    const r = /^(?:(?:https?|http|www):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;
    return r.test(s)
 }
