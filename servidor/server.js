// server.js

var express  = require('express');
var app      = express();
var mongoose = require('mongoose');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var ObjectId = require('mongoose').Types.ObjectId; 

mongoose.connect('mongodb://localhost:27017/entregadb');

app.use(express.static(__dirname + '/../'));
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({'extended':'true'}));
app.use(bodyParser.json());
app.use(bodyParser.json({ type: 'application/vnd.api+json' }));
// app.use(express.bodyParser());
app.use(methodOverride());


var express = require('express')
  , cors = require('cors')
  , app = express();
 
app.use(cors());

var bodyParser = require('body-parser');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());


// o schema do banco

    var entregaSchema = new mongoose.Schema({
        tipo: {type: Number},
        fragil: {type: Boolean},
        titulo: {type: String},
        destinatario: {type: String},
        origem: {
            nome: {type: String},
            lat: {type: Number},
            lon: {type: Number}
        },
        destino: {
            nome: {type: String},
            lat: {type: Number},
            lon: {type: Number}
        },
        status: {type: Number},
        data_pedido: {type: String},
        hora_entrega: {type: String},
        entregador: {type: String}
    });

     var Entrega = mongoose.model('entrega', entregaSchema);

// as rotas

    app.get('/api/entregas', cors(), function(req, res) {
        Entrega.find(function(err, entregas) {
            if (err)
                res.send(err)

            var entregas_new = {};
            for(i in entregas){
                var entrega = entregas[i];
                if(!(entrega.data_pedido in entregas_new)){
                    entregas_new[entrega.data_pedido] = [];
                }
                entregas_new[entrega.data_pedido].push(entrega);
            }

            res.json(entregas_new);
        });
    });

    app.get('/api/entrega', cors(), function(req, res) {
        console.log(req.query);
        var entrega_id = req.query.id;

        Entrega.findOne({_id: new ObjectId(entrega_id)}).exec(function(err, entrega) {
            if (err)
                res.send(err)

            var id_status = {"_id": entrega._id, 'status': entrega.status};
            pusher.trigger('status', 'updated', id_status);

            res.json(entrega);
        });
    });

    app.get('/api/entregas/ecopacote', cors(), function(req, res) {
        Entrega.find({tipo: 4, status: 1}).exec(function(err, entregas) {
            console.log(entregas);
            if (err)
                res.send(err)

            res.json(entregas);
        });
    });

    app.get('/api/entregas/todos', cors(), function(req, res) {
        Entrega.find({tipo: {$lt: 4}, status: 1}).exec(function(err, entregas) {
            console.log(entregas);
            if (err)
                res.send(err)

            res.json(entregas);
        });
    });

    app.post('/api/entregas', function(req, res) {
        console.log(req);
        var item = req.body;
        Entrega.create({
            tipo: item.tipo,
            fragil: item.fragil,
            titulo: item.titulo,
            destinatario: item.destinatario,
            origem: {
                nome: item.origem.nome,
                lat: item.origem.lat,
                lon: item.origem.lon
            },
            destino: {
                nome: item.destino.nome,
                lat: item.destino.lat,
                lon: item.destino.lon
            },
            status: item.status,
            data_pedido: item.data_pedido,
            // hora_entrega: {type: String},
            // entregador: {type: String}
        }, function(err, entrega) {
            if (err)
                res.send(err);

            var entrega_id = {"id": entrega._id};
            res.json(entrega_id);
        });

    });

    app.post('/api/entregas/update', function(req, res) {
        console.log(req);
        var item = req.body;
        console.log(item.hora_entrega);
        var user_id = item._id;
        Entrega.update({_id: user_id},
        {
            tipo: item.tipo,
            fragil: item.fragil,
            titulo: item.titulo,
            destinatario: item.destinatario,
            origem: {
                nome: item.origem.nome,
                lat: item.origem.lat,
                lon: item.origem.lon
            },
            destino: {
                nome: item.destino.nome,
                lat: item.destino.lat,
                lon: item.destino.lon
            },
            status: item.status,
            data_pedido: item.data_pedido,
            hora_entrega: typeof item.hora_entrega == "undefined" ? "" : item.hora_entrega,
            entregador: typeof item.entregador == "undefined" ? "" : item.entregador
        }, function(err, entrega) {
            if (err)
                res.send(err);

            Entrega.find(function(err, entregas) {
                if (err)
                    res.send(err)
                res.json(entregas);
            });
        });

    });

app.listen(8080);
console.log("EntregaRapida Server ouvindo na porta 8080");