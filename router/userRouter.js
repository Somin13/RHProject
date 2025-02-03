const { PrismaClient, Role } = require('@prisma/client')
const authguard = require('../services/authguard')
const userRouter = require('express').Router()

const bcrypt = require('bcrypt')
const hashPasswordExtension = require('../services/extensions/hashPasswordExtension')
const prisma = new PrismaClient().$extends(hashPasswordExtension)

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profiles'); // Assure-toi que ce dossier existe
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Route pour gérer l'upload
userRouter.post('/uploadProfilPicture/:id', upload.single('profilePicture'), async (req, res) => {
    try {
        const userId = req.params.id;
        const profilePicturePath = `/uploads/profiles/${req.file.filename}`;

        // Sauvegarde dans la base de données (exemple avec Prisma)
        await prisma.user.update({
            where: { id: parseInt(userId) },
            data: {
                profilPicture: profilePicturePath,
            }

        });

        res.redirect('/pageprofil'); // Redirection vers la page du profil après upload
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de l'upload de l'image");
    }
});


userRouter.get('/pageemployes',authguard, async (req, res) => {

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.session.user.id
            },
            include: {
                computeur: true
            }
        })
        const employe = await prisma.employe.findMany({
            where: {
                userId: req.session.user.id,
            },
            include: {
                computeur: true
            }
        })


        res.render('pages/employes.html.twig', { title: 'Accueil', user: req.session.user, employe, computer: user.computeur });

    } catch (error) {
        console.log('impossible de recuperer tes employes', error);
    }
})

userRouter.get('/pagecomputer', authguard, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.session.user.id
            },
            include: {
                computeur: true,
                employe: true // Assurez-vous que cet attribut est défini dans le modèle Prisma
            }
        })  

     console.log(user.computeur);
     
        res.render('pages/computer.html.twig', { 
            title: 'Accueil', 
            user: req.session.user, 
            employe: user.employe, // Vérifiez que user.employe existe
            computeurs: user.computeur // Utiliser la variable computeurs récupérée
        });
    } catch (error) {
        console.log("Erreur lors de la récupération des ordinateurs", error);
        res.status(500).send("Erreur interne du serveur");
    }
});

userRouter.get('/pageprofil', authguard, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.session.user.id,
            },
        });
        res.render('pages/profil.html.twig', { title: 'Profil', user });
    } catch (error) {
        console.log("erreur lors de l'affichage du profil", error);
    }
})

userRouter.get('/assigncomputer', authguard, async (req, res) => {

    try {

        const user = await prisma.user.findUnique({
            where: {
                id: req.session.user.id
            }
        })

        const computer = await prisma.computeur.findMany({
            where: {
                userId: req.session.user.id,
            },
            include: {
                employe: true
            }
        })

        const employe = await prisma.employe.findMany({
            where: {
                userId: req.session.user.id,
            },
            include: {
                computeur: true
            }
        })
        res.render('pages/assignement.html.twig', { title: 'Accueil', user: req.session.user, employe , computer});

    } catch (error) {
        console.log("erreur lors de l'affichage", error);
    }
})

userRouter.get('/register', async (req, res) => {
    const user = await prisma.user.findMany()
    res.render('pages/register.html.twig')
})

userRouter.post('/register', async (req, res) => {

    try {
        if (req.body.password !== req.body.confirmPassword) {
            throw ({ confirmPassword: 'Les mots de passe ne correspondent pas' })
        } else {
            const user = await prisma.user.create({
                data: {
                    raisonSocial: req.body.raisonSocial,
                    siret: req.body.siret,
                    password: req.body.password,
                    name: req.body.firstname,
                    lastName: req.body.lastName,
                    role: Role.USER
                }
            })
            res.redirect('/login')
        }
    } catch (error) {
        if (error.code === 'P2002') {
            error = { siret: 'ce numero de siret est déjà utilisé' }
        }
        res.render('pages/register.html.twig', { title: 'Inscription', error })
    }
})

userRouter.get('/login', (req, res) => {
    res.render('pages/login.html.twig', { title: 'Connexion' })
})

userRouter.get('/message', authguard, async (req, res) => {


    const user = await prisma.user.findUnique({
        where: {
            id: req.session.user.id
        },
        include: {
            employe: true,
            computeur: true
        }
    })
    res.render('pages/message.html.twig', { title: 'Accueil', user: req.session.user, employe: user.employe, computeur: user.computeur });
})

userRouter.post('/login',  async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                siret: req.body.siret
            }
        })
        if (user) {
            if (await bcrypt.compare(req.body.password, user.password)) {
                req.session.user = {
                    id: user.id,
                    name: user.name,
                    lastName: user.lastName,
                    email: user.email,
                    raisonSocial: user.raisonSocial,
                    siret: user.siret,
                    role: user.role
                };
                res.redirect('/');
            } else {
                throw { password: "Mot de passe incorrect" }
            }
        } else {
            throw { siret: "Numéro de Siret non enregistré" }
        }
    } catch (error) {
        res.render('pages/login.html.twig', { title: 'Connexion', error })
    }
})

userRouter.get('/', authguard, async (req, res) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.session.user.id
        },
        include: {
            employe: true,
            computeur: true
        }
    });

    // Obtenir la date actuelle
    const today = new Date();
    const todayMonth = today.getMonth() + 1; // Janvier = 0
    const todayDay = today.getDate();

    // Filtrer les employés qui ont leur anniversaire aujourd'hui
    const birthdayEmployees = user.employe.filter(emp => {
        if (!emp.dateNaissance) return false;
        const birthDate = new Date(emp.dateNaissance);
        return birthDate.getMonth() + 1 === todayMonth && birthDate.getDate() === todayDay;
    });

    res.render('pages/index.html.twig', {
        title: 'Accueil',
        user: req.session.user,
        employe: user.employe,
        computeur: user.computeur,
        birthdayEmployees: birthdayEmployees, // Passer les employés ayant leur anniversaire
    });
});


userRouter.post('/edituser/:id', authguard, async (req, res) => {
    try {
        const { name, lastName, email } = req.body;

        await prisma.user.update({
            where: { id: parseInt(req.params.id) },
            data: { name, lastName, email },
        });


        res.redirect('/pageprofil');
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la mise à jour de votre profil.");
    }
});

userRouter.get('/pageprofil',authguard,async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const user = await prisma.user.findUnique({
            where: {
                id: req.session.user.id,
            },
        });

        if (!user) {
            return res.status(404).send("Utilisateur non trouvé.");
        }

        res.render('pages/profil.html.twig', { title: 'Profil', user });
    } catch (error) {
        console.log("Erreur lors de l'affichage du profil", error);
        res.status(500).send("Erreur interne.");
    }
});

userRouter.get('/logout', (req, res) => {
    req.session.destroy((error) => {
        try {
            res.redirect('/login')

        } catch (error) {
            error = ("Une erreur c'est produite")
        }
    })
})



module.exports = userRouter

