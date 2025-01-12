import Express, { response } from 'express';
const router = Express.Router();
import mongoose from 'mongoose';
import Categoria from '../models/Categoria.js';
const Categorias = mongoose.model('categorias');
import Postagem from '../models/Postagem.js';
const Postagens = mongoose.model('postagens');
import isAdmin from '../helpers/isAdmin.js';

router.get('/', isAdmin, (req, res) => {
    res.render('admin/index')
});

router.get('/post', isAdmin, (req, res) => {
    res.render('admin/index')
});

router.get('/categorias', isAdmin, (req, res) => {
    Categorias.find().lean().sort({ nome: 'asc' }).then((categorias) => {
        res.render('admin/categorias', { categorias: categorias })
    }).catch((err) => {
        req.send('error_msg', 'Houve um erro no processo.' + err);
        res.redirect('admin/');
    })
});

router.get('/categorias/add', isAdmin, (req, res) => {
    res.render('admin/addcategorias');
})

router.post('/categorias/nova', isAdmin, (req, res) => {

    let errors = []

    if (!req.body.nome) {
        errors.push({ texto: 'Nome inválido' });
    }

    if (!req.body.slug) {
        errors.push({ texto: 'slug inválido' })
    }

    if (req.body.nome.length < 2) {
        errors.push({ texto: 'Nome muito pequeno' })
    }

    if (errors.length > 0) {
        res.render('admin/addcategorias', { errors: errors });
    } else {
    
        const novaCategoria = new Categorias({
            nome: req.body.nome,
            slug: req.body.slug
        })

        novaCategoria.save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso!')
            res.redirect('./')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao criar a categoria, tente novamente.')
            res.redirect('./')
        })
    }
});

router.get('/categorias/edit/:id', isAdmin, (req, res) => {
    Categorias.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render('admin/editcategorias', { categoria: categoria })
    }).catch((err) => {
        req.flash('error_msg', 'Esta categoria não existe.' + err)
        res.redirect('admin/categorias')
    })
})

router.post('/categorias/edit', isAdmin, (req, res) => {

    let errosInvali = []

    if (!req.body.nome || !req.body.slug) {
        errosInvali.push({ text: 'Dados incorretos' })
    }

    if (req.body.nome.length < 2 || req.body.slug.length < 2) {
        errosInvali.push({text: 'Dados insuficientes'})
    }

    if (errosInvali.length > 0) {
        Categorias.findOne({ _id: req.body.id }).lean().then((categoria) => {
            res.render('admin/editcategorias', { categoria: categoria, errosInvali: errosInvali })
            categoria.nome = ''
            categoria.slug = ''
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao editar a categoria.' + err)
            res.redirect('admin/categorias')
        })
    } else {

        Categorias.findOne({ _id: req.body.id }).sort({ nome: 'asc' }).then((categoria) => {
 
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash('success_msg', 'Categoria editada com sucesso')
                res.redirect('/admin/categorias')
            }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao editar a categoria.' + err)
                res.redirect('/admin/categorias')
            })

        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao editar a categoria' + err)
            res.redirect('/admin/categorias')
        })
    }
})

router.post('/categorias/deletar', isAdmin, (req, res) => {
    Categorias.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Categoria removida com sucesso!');
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um problema ao deletar a categoria');
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', isAdmin, (req, res) => {
    Postagens.find().populate('categoria').lean().sort({ titulo: 'asc' }).then((postagens) => {
        res.render('admin/postagens', {postagens: postagens})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao listar as postagens' + err)
        res.redirect('/admin')
    })
})

router.get('/postagens/add', isAdmin, (req, res) => {
    Categorias.find().lean().then((categoria) => {
        res.render('admin/addpostagem', {categoria: categoria})
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário')
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', isAdmin, (req, res) => {

    let erros = []

    if (req.body.categoria == '0') {
        erros.push({text: 'Categoria inválida, tente novamente.'})
    }

    if (!req.body.titulo || !req.body.slug | !req.body.descricao | !req.body.conteudo) {
        erros.push({ text: 'Dados não preenchidos' })
    }

    if (req.body.titulo.length < 2 || req.body.slug.length < 2 || req.body.descricao.length < 2 || req.body.conteudo.length < 2) {
        erros.push({text: 'Dados insuficientes'})
    }

    if (erros.length > 0) {
        Categorias.find().select('id nome').lean().then((categoria) => {
            res.render('admin/addpostagem', {categoria: categoria, erros: erros})
        })
                    
    } else {
        const newPost = new Postagens ({
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }).save().then(() => {
            req.flash('success_msg', 'Postagem criada com sucesso!')
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro durante o salvamento da postagem.' + err)
            res.redirect('/admin/postagens')
        })
    }
})

router.get('/postagens/edit/:id', isAdmin, (req, res) => {
    
    Postagens.findOne({_id: req.params.id}).lean().then((postagens) => {
        Categorias.find().lean().then((categoria) => {
            res.render('admin/editpostagens', {categoria: categoria, postagens: postagens})
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao listar as categorias.' + err)
            res.redirect('/admin/postagens')
        })

    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao carregar o formulário da edição.')
        res.redirect('/admin/postagens')
    })
    
    
})

router.post('/postagem/edit', isAdmin, (req, res) => {

    let error = []

    if (!req.body.titulo || !req.body.slug || !req.body.descricao || !req.body.conteudo) {
        error.push({ text: 'Título, slug, descricao e/ou conteúdo não preenchido corretamente.' })
    }

    if (req.body.titulo.length < 2 || req.body.slug.length < 2 || req.body.descricao < 10 || req.body.conteudo < 20) {
        error.push({text: 'Dados insuficientes. Por favor, preencha ao menos o mínimo de caracteres.'})
    }

    if (error.length > 0) {
        Postagens.findOne({ _id: req.body.id }).lean().then((postagens) => {
            Categorias.find().lean().then((categoria) => {
                res.render('admin/editpostagens', { postagens: postagens, error: error, categoria: categoria})
                postagens.titulo = req.body.titulo
                postagens.slug = req.body.slug
                postagens.descricao = req.body.descricao
                postagens.conteudo = req.body.conteudo
            })
            
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao editar a categoria.' + err)
            res.redirect('admin/postagens')
        })
    } else {
        Postagens.findOne({_id: req.body.id}).then((postagens) => {

                postagens.titulo = req.body.titulo
                postagens.slug = req.body.slug
                postagens.descricao = req.body.descricao
                postagens.conteudo = req.body.conteudo
                postagens.categoria = req.body.categoria     
                
                postagens.save().then(() => {
                    req.flash('success_msg', 'Postagem editada com sucesso!')
                    res.redirect('/admin/postagens')
                }).catch((err) => {
                    req.flash('error_msg', 'Erro interno' + err)
                    res.redirect('/admin/postagens')
                })
        
            }).catch((err) => {
                console.log(err)
                req.flash('error_msg', 'Houve um erro ao salvar a edição.')
                res.redirect('/admin/postagens')
            
            })       
    }
})

router.post('/postagens/deletar/', isAdmin, (req, res) => {
    Postagens.deleteOne({_id: req.body.id}).then(() => {
        req.flash('success_msg', 'Postagem deletada com sucesso!')
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash('error_msg', 'Houve um erro ao deletar a postagem.' + err)
        res.redirect('/admin/postagens')
    })
});

export default router;