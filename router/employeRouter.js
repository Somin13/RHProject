const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');
const employeRouter = require('express').Router();
const authguard = require('../services/authguard');
const hashPasswordExtension = require('../services/extensions/hashPasswordExtension');
const prisma = new PrismaClient({ log: ['error'] }).$extends(hashPasswordExtension);

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({ storage });

// Route pour ajouté une photo à l'employé
employeRouter.post('/addemploye', authguard, upload.single('photo'), async (req, res) => {
    try {
        // Vérifie si l'utilisateur est connecté
        if (!req.session.user || !req.session.user.id) {
            return res.status(401).send('Erreur : utilisateur non connecté.');
        }

        const { name, lastName, email, password, dateNaissance, genre } = req.body;


        // Vérifie si tous les champs requis sont remplis
        if (!name || !lastName || !email || !password) {
            return res.status(400).send('Veuillez remplir tous les champs.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let photo = req.file ? `/uploads/${req.file.filename}` : "/uploads/default-profile.png"; // Met une image par défaut si aucune image

        const employe = await prisma.employe.create({
            data: {
                name,
                lastName,
                email,
                password: hashedPassword,
                dateNaissance: dateNaissance ? new Date(dateNaissance) : null,
                genre,
                userId: req.session.user.id, // Vérifie que la session utilisateur est bien définie
                role: Role.EMPLOYE,
                photo, // Stocker l'image
            },
        });

        res.redirect('/employes');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur interne.');
    }
});


// // Route pour ajouter un employé
// employeRouter.post('/addemploye' ,authguard,async (req, res) => {
//     try {
//         const { name, lastName, email, password, age, genre } = req.body;

//         const hashedPassword = await bcrypt.hash(password, 10);

//         const employe = await prisma.employe.create({
//             data: {
//                 name,
//                 lastName,
//                 email,
//                 password: hashedPassword,
//                 age: parseInt(age),
//                 genre,
//                 userId: req.session.user.id,
//                 role: Role.EMPLOYE,
//             },
//         });

//         res.redirect('/employes');
//     } catch (error) {
//         if (error.code === 'P2002') {
//             return res.status(400).send('Cet email est déjà utilisé.');
//         }
//         console.error(error);
//         res.status(500).send('Erreur interne');
//     }
// });

// Route pour afficher la liste des employés
employeRouter.get('/employes', authguard, async (req, res) => {
    try {
        const employes = await prisma.employe.findMany({
            where: {
                userId: req.session.user.id,
            },
        });

        // Fonction pour calculer l'âge
        const calculateAge = (dateNaissance) => {
            if (!dateNaissance) return "Non renseigné";
            const birthDate = new Date(dateNaissance);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age;
        };

        // Ajouter l'âge à chaque employé
        const employesWithAge = employes.map(emp => ({
            ...emp,
            age: calculateAge(emp.dateNaissance)
        }));

        res.render('pages/employes.html.twig', {
            title: 'Liste des employés',
            user: await prisma.user.findUnique({ where: { id: req.session.user.id } }),
            employe: employesWithAge, // Envoyer la version modifiée avec l'âge
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erreur lors du chargement des employés.');
    }
});


// Route pour supprimer un employé
employeRouter.get('/deletemploye/:id', async (req, res) => {
    try {
        await prisma.employe.delete({
            where: {
                id: parseInt(req.params.id),
            },
        });
        res.redirect('/employes');
    } catch (error) {
        console.error(error);
        res.redirect('/');
    }
});

// Route pour afficher la page de modification d'un employé
employeRouter.get('/editemploye/:id', async (req, res) => {
    try {
        const employe = await prisma.employe.findUnique({
            where: {
                id: parseInt(req.params.id),
            },
        });

        if (!employe) {
            return res.status(404).send('Employé non trouvé');
        }

        res.render('pages/employes.html.twig', {
            title: "Modifier l'employé",
            employe: employe,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors du chargement des informations de l'employé.");
    }
});

// Route pour mettre à jour un employé
employeRouter.post('/editemploye/:id', upload.single('photo'), async (req, res) => {
    try {
        const { name, lastName, email, dateNaissance, genre } = req.body;

        let photo = req.file ? `/uploads/${req.file.filename}` : req.body.oldPhoto;

        await prisma.employe.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name,
                lastName,
                email,
                dateNaissance: dateNaissance ? new Date(dateNaissance) : undefined,
                genre,
                photo
            },
        });

        res.redirect('/employes');
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la mise à jour de l'employé.");
    }
});


employeRouter.get('/api/employees/:id', async (req,res)=>{
    try {
        const employe = await prisma.employe.findUnique({
            where: {
                id: parseInt(req.params.id),
            },
        });
        res.json(employe)
    } catch (error) {
        res.json(error.message)
    }
})



module.exports = employeRouter;

 