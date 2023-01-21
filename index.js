const functions = require("firebase-functions");
const admin = require("firebase-admin");

const serviceAccount = require("./premissions.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const express = require("express");

const app = express();
const db = admin.firestore();

const cors = require("cors");
app.use(cors({origin: true}));

// Routes 
app.get('/test', (req, res) => {
    return res.status(200).send('The app is working fine');
});

// Create - POST
app.post('/api/create', (req, res) => {
    (async() => {
    try{
        await db.collection('products').doc('/' + req.body.id + '/')
        .create({
            name: req.body.name,
            description: req.body.description,
            quantity:req.body.quantity,
            asset:req.body.asset,
            price: req.body.price
        })
        return res.status(200).send('Products was created succesfully');
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
    })();
});

//Read - GET ( a specific product by id)

app.get('/api/read/:id', (req, res) => {
    (async () => {
    try{
        const document = db.collection('products').doc(req.params.id);
        let product = await document.get();
        let response = product.data();

        return res.status(200).send(response);
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
    })();
});


//READ - GET  all products 
app.get('/api/read', (req, res) => {
    (async () => {
    try{
        const query = db.collection('products');
        let response = [];

        await query.get().then(querySnapshot => {
            let docs = querySnapshot.docs;

            for (let doc of docs){
                const selectedItem = {
                    id: doc.id,
                    name: doc.data().name,
                    quantity:doc.data().quantity,
                    asset:doc.data().asset,
                    description: doc.data().description,
                    price: doc.data().price
                };
                response.push(selectedItem);

            }
            return response; 
        
        });
        return res.status(200).send(response);
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
    })();
});

//Update - PUT

app.put('/api/update/:id', (req, res) => {
    (async () => {
    try{
        const document = db.collection('products').doc(req.params.id);

        await document.update({
            name: req.body.name,
            description: req.body.description,
            quantity:req.body.quantity,
            asset:req.body.asset,
            price: req.body.price
        })
       
        return res.status(200).send('product was updated');
    }catch(error){
        console.log(error);
        return res.status(500).send('Something went wrong');
        
    }
    })();
});

//Delete - Delete
app.delete('/api/delete/:id', (req, res) => {
    (async () => {
    try{
        const document = db.collection('products').doc(req.params.id);  
        await document.delete();
       
        return res.status(200).send('Product was deleted ');
    }catch(error){
        console.log(error);
        return res.status(500).send(error);
    }
    })();
});

//Export the api to firebase cloud functions
exports.app = functions.https.onRequest(app);