const express = require('express')
const app = express()
const axios = require('axios')
const cors = require('cors')
const PORT = parseInt(process.env.PORT) || 8080;


app.use(cors());
app.use(express.static("frontend"));

// app.all('*', function (req, res, next) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type');
//     res.header('Access-Control-Allow-Methods', 'POST, GET');
//     res.header('Content-Type', 'application/json');
//     next();
//   });

// Authenticartion Endpoint(a middleware)
const get_token_function = (req, res, next) => {
    axios.post('https://api.artsy.net/api/tokens/xapp_token', {
    client_id: 'ae612244bf48f981f5b8',
    client_secret: 'b74a572cd8bc68832feeb80f4e6c0170'
    }).then(response => {
        // Append token information to the res
        res.token = response.data['token'];
        next();
    }).catch(error => {        
        console.log(error);
    });
};


// Search Endpoint
app.get('/search', get_token_function, (req, res) => {
    // Get the user input(?search_name=)
    var search_name = req.query.search_name;
    var url_search = 'https://api.artsy.net/api/search';
    axios.get(url_search, {
        params: {q: search_name, size: 10},
        headers: {'X-XAPP-Token': res.token}
    }).then(response => {
        res.send(response.data);
    }).catch(error => {        
        console.log(error);
    });
}) 

// Artists and Artworks Endpoint
app.get('/artists_artworks', get_token_function, (req, res) => {
    // (?id=  full) 
    var artist_id = req.query.id.replace('https://api.artsy.net/api/artists/', '');
    var url_artist = 'https://api.artsy.net/api/artists/' + artist_id;
    var url_artwok= 'https://api.artsy.net/api/artworks';
    // Send the HTTP get request at the same time
    axios.all([
        axios.get(url_artist, {
            headers: {'X-XAPP-Token': res.token}
        }),
        axios.get(url_artwok, {
            params: {artist_id: artist_id, size: 10},
            headers: {'X-XAPP-Token': res.token}
        })
      ]).then(axios.spread((artist_response, artwork_response) => {
          res.send({artist:artist_response.data, artwork:artwork_response.data});
      })).catch(error => {        
        console.log(error);
    });

});

// Genes Endpoint
app.get('/genes', get_token_function, (req, res) => {
    // (?id=  part)
    var artwork_id = req.query.id;
    var url_gene = 'https://api.artsy.net/api/genes';
    axios.get(url_gene, {
        params: {artwork_id: artwork_id},
        headers: {'X-XAPP-Token': res.token}
    }).then(response => {
        res.send(response.data);
    }).catch(error => {
        console.log(error);
    })
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
});



