const { PrismaClient } = require('@prisma/client');
const authguard = require('../services/authguard');

const assigneRouter = require('express').Router();
const prisma = new PrismaClient();

assigneRouter.post('/assigncomputer', authguard, async (req, res) => {
    const { employeId, computerId } = req.body;

    try {
        // Désassigner l'ordinateur s'il est déjà attribué
        const oldEmploye = await prisma.employe.findFirst({
            where: { computeurId: parseInt(computerId) },
        });

        if (oldEmploye) {
            await prisma.employe.update({
                where: { id: oldEmploye.id },
                data: { computeurId: null },
            });
        }

        // Assigner le nouvel ordinateur
        const updatedEmploye = await prisma.employe.update({
            where: { id: parseInt(employeId) },
            data: { computeurId: parseInt(computerId) },
        });

        res.redirect('/assigncomputer');
    } catch (error) {
        console.error('Erreur lors de l’assignation :', error);
        res.status(500).send({ error: 'Erreur lors de l’assignation' });
    }
});


// assigneRouter.post('/', async (req, res) => {
//     const { employeId } = req.body;

//     try {
//         const employe = await prisma.employe.update({
//             where: { id: parseInt(employeId) },
//             data: { computerId: null },
//         });

//         res.status(200).send({ message: 'Ordinateur désassigné avec succès', employe });
//     } catch (error) {
//         console.error('Erreur lors de la désassignation :', error.message);
//         res.status(500).send({ error: 'Erreur lors de la désassignation' });
//     }
// });

assigneRouter.post('/unassigncomputer', authguard, async (req, res) => {
    const { employeId } = req.body;

    try {
        // Mettre à jour l'employé en retirant son ordinateur assigné
        await prisma.employe.update({
            where: { id: parseInt(employeId) },
            data: { computeurId: null },
        });

        res.redirect('/assigncomputer'); // Rediriger vers la vue principale
    } catch (error) {
        console.error('Erreur lors de la désassignation :', error);
        res.status(500).send({ error: 'Erreur lors de la désassignation' });
    }
});

module.exports = assigneRouter
