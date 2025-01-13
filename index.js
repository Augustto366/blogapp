// Carregando módulos
import Express from 'express';
import { engine } from 'express-handlebars';
import admin from './routes/admin.js'
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const app = Express();
import mongoose from 'mongoose';
import Categoria from './models/Categoria.js'
const Categorias = mongoose.model('categorias')
import session from 'express-session';
import flash from 'connect-flash';
import moment from 'moment';
import Postagem from './models/Postagem.js';
const Postagens = mongoose.model('postagens')
import users from './routes/user.js'
const Users = mongoose.model('users')
import auth from './config/auth.js';
import passport from 'passport';
import Comment from './models/Comentario.js';
const Comments = mongoose.model('comments')
auth(passport)

// Configurações
// Sessão

app.use(session({
    secret: 'cursodenode',
    resave: true,
    saveUninitialized: true,
    maxAge: 1000 * 60 * 15
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(flash());
// Middleware

app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error')
    res.locals.user = req.user || null
    next();
})

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Body Parser

app.use(Express.urlencoded({ extended: true }));
app.use(Express.json());

//HandleBars

app.engine('handlebars', engine({
    defaultLayout: 'main',
    helpers: {
        formatDate: (date) => {
            return moment(date).format('DD/MM/YYYY')
        }
    }
}))

app.set('view engine', 'handlebars');
app.set("views", "./views")

// Mongoose
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/blogapp').then(() => {
    console.log('Conectado ao mango')
}).catch((err) => {
    console.log('Erro ao se conectar: ' + err);
});

// Public
app.use(Express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    console.log('Hey! Im a middleware!')
    next();
})

// Rotas
app.get('/', (req, res) => {
    Postagens.find().lean().populate('categoria').sort({ data: 'desc' }).then((postagem) => {
        res.render('index', { postagem: postagem })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno.' + err)
        res.redirect('/404')
    })
})

app.get('/postagem/:slug', (req, res) => {
    Postagens.findOne({ slug: req.params.slug }).lean().then((postagem) => {
        Comments.find().lean().then((comment) => {
            if (postagem) {
                if(comment) {}
                res.render('postagem/index', { postagem: postagem, comment: comment })
            } else {
                req.flash('error_msg', 'Esta postagem não existe')
                res.redirect('/')
            }
        })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/')
    })
})



app.post('/comment', (req, res) => {
    Users.findOne({ email: req.user.email }).then((comment) => {
            if (comment) {
                const newComment = new Comments({
                    nome: comment.nome,
                    text: req.body.comentario
                }).save().then(() => {
                    req.flash('success_msg', 'Comentário postado!')
                    res.redirect('/')
                })
            } else {
                req.flash('error_msg', 'Não foi possível postar o comentário, tente novamente!')
                res.redirect('/')
            }
        })
    })
app.get('/404', (req, res) => {
    res.send('Erro 404!')
})

app.get('/categorias', (req, res) => {
    Categorias.find().lean().then((categorias) => {
        res.render('categorias/index', { categorias: categorias })
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno ao listar as categorias')
        res.redirect('/')
    })
})

app.get('/categorias/:slug', (req, res) => {
    Categorias.findOne({ slug: req.params.slug }).lean().then((categoria) => {
        if (categoria) {
            Postagens.find({ categoria: categoria._id }).lean().then((postagens) => {
                res.render('categorias/postagens', { postagens: postagens, categoria: categoria })
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao listar os posts!')
                res.redirect('/')
            })
        } else {
            req.flash('error_msg', 'Esta categoria não existe')
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno ao carregar a página desta categoria')
        res.redirect('/')
    })
})

app.use('/admin', admin);
app.use('/users', users);
// Outros
const PORT = 8081;
app.listen(PORT, () => {
    console.log('Servidor rodando!');
})