const express = require('express')
const firebase = require('./firebase/firebase')
const { nanoid } = require('nanoid')
const app = express()
const db = firebase.database()


app.listen(process.env.PORT || 5000)

app.use(express.static(__dirname + '/views'));

app.set('view engine', 'ejs')

app.use(express.urlencoded())

app.get('/',(req,res) => {
    res.render('index')
})

app.post('/checkurl',(req,res) => {

    longurl = req.body.longurl
    // console.log(req.body.customurl)
    customurl = req.body.customurl.length!=0?req.body.customurl:nanoid(8)

    if(customurl === 'about') {
        res.status(400).json({ response: "Custom url already exists" });
    }

    // res.send(customurl)\
    checkCustom(req,res,customurl,longurl)

})


app.get('/404', (req, res) => {
    
    res.render('404');
    
});

app.get('/about',(req,res) => {
    console.log("Hello")
    res.render('about')
})

app.get('/favicon.ico', (req, res) => {

    res.status(404).send("");

});

app.get('/:customurl', (req, res) => {
    console.log("Hello There")
    const customurl = req.params.customurl;

    db.ref().child("customurls").child(customurl).get().then((snapshot) => {
        if (snapshot.exists()) {
            res.redirect(snapshot.val());
        } else {
            res.redirect('/404')
        }
    }).catch((error) => {
        console.error(error);
    });

});


function checkCustom(req,res,customurl,longurl) {

    db.ref().child("customurls").child(customurl).get().then((snapshot) => {
        if(snapshot.exists()) {
            res.status(400).json({ response: "Custom url already exists" });
        }
        else {
            db.ref("customurls/" + customurl).set(longurl)
            // updateTotalUrls()
            res.status(200).json({ customurl: customurl});
            // res.render('sample',{customUrl: customurl})
        }
    }).catch((error) => {
        console.error(error)
    });

}

function updateTotalUrls() {

    // db.ref().child("TotalUrls").get().then((snapshot) => {
    //     if(!snapshot.exists()) {
    //         db.ref("TotalUrls").set(1)
    //     }
    //     else {
    //         var total = snapshot.val()
    //         db.ref("TotalUrls".set(total+1))
    //     }
    // }).catch((error)=>{
    //     console.error(error)
    // })
    
    // db.ref("TotalUrls").transaction(function())
    // .ref("TotalUrls")
    // .set(db.ServerValue.increment(1))
    // res.end


}