import Express from 'express';
const router = Express.Router()
import mongoose from 'mongoose';
import User from '../models/User.js'
const Users = mongoose.model('users')
import bcrypt, { hash, hashSync } from 'bcrypt';
import Passport from '../config/auth.js';
import passport from 'passport';

router.get('/registro', (req, res) => {
    res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {
    let erros = []

    if (!req.body.nome || !req.body.email || !req.body.senha) {
        erros.push({text: 'Dados incorretos ou insuficientes'})
    }

    if (req.body.senha.length < 8) {
        erros.push({text: 'Senha muito curta'})
    }

    if (req.body.senha != req.body.senha2) {
        erros.push({text: 'As senhas são diferentes, tente novamente!'})
    }

    if (erros.length > 0) {
        res.render('usuarios/registro', {erros: erros})
    } else {
        Users.findOne({email: req.body.email}).lean().then((user) => {
            if (user) {
                req.flash('error_msg', 'Usuário já cadastrado')
                res.redirect('/users/registro')
            } else {
                const newUser = new Users ({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(newUser.senha, salt, (erro, hash) => {
                        if (erro) {
                            req.flash('error_msg', 'Houve um erro durante o salvamento do usuário')
                            res.redirect('/')
                        } else {
                            newUser.senha = hash

                        newUser.save().then(() => {
                            req.flash('success_msg', 'Usuário cadastrado com sucesso!')
                            res.redirect('/')
                        }).catch((err) => {
                            req.flash('error_msg', 'Houve um erro ao criar o usuário, tente novamente!')
                            res.redirect('/usuarios/registro')
                        })
                        }    
                    })
                })

            }
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro interno')
            res.redirect('/')
        })
    }
})

router.get('/login', (req, res) => {
    res.render('usuarios/login')
})

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }) (req, res, next)
})

router.get('/logout', (req, res, next) => {
    req.logOut(function(err) {
        if (err) {
            return next(err) 
        }
        req.flash('success_msg', 'Deslogado com sucesso!')
        res.redirect('/')
    })
})
   


export default router
