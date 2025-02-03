
const { PrismaClient, Role } = require('@prisma/client')

const computerRouter = require('express').Router()
const authguard = require('../services/authguard')
const hashPasswordExtension = require('../services/extensions/hashPasswordExtension')
const prisma = new PrismaClient().$extends(hashPasswordExtension)



computerRouter.post('/addcomputer', authguard, async (req, res) => {
    const { namePc, nameMac } = req.body

    try {
        const computeur = await prisma.computeur.create({
            data: {
                namePc,
                nameMac,
                userId : req.session.user.id
            }
        })

        res.redirect('/pagecomputer')
    } catch (error) {
        console.log(error);
        
        res.render('pages/computer.html.twig', { error: error })
    }
})



computerRouter.get('/deletecomputer/:id', authguard, async (req, res) => {
    try {
        const deleteComputer = await prisma.computeur.delete({
            where: {
                id: parseInt(req.params.id)
            }
        })
        res.redirect('/pagecomputer')
    } catch (error) {
        res.redirect('/pagecomputer')
    }
})




module.exports = computerRouter