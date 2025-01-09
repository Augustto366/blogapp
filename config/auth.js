import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import mongoose from "mongoose";
import bcrypt from 'bcrypt';
import User from '../routes/user.js'
const Users = mongoose.model('users');




const Passport = function (passport) {
    passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'senha'}, (email, senha, done) => {
        Users.findOne({email: email}).then((user) => {
            if (!user) {
                return done(null, false, {message: 'Esta conta não existe'})
            } else {
                bcrypt.compare(senha, user.senha, (erro, batem) => {
                    if (batem) {
                        return done(null, user)
                    } else {
                        return done(null, false, {message: 'Senha incorreta'})
                    }
                })
            }
        })
    }))

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        Users.findById(id).then((user) => {
            done(null, user)
        }).catch((err) => {
            done(null, false, {message: 'Houve um erro' + err})
        })
    })
}


export default Passport