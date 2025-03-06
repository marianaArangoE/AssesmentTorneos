const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro';

const utils = require('../utils/utils');
const authMiddleware = require('../Middleware/authMiddleware');
const { json, text } = require('express');
const QRCode = require('qrcode');
//const console = require('diamondstalker-logger');

const stripe = require("stripe")(process.env.STRIPE);




const registrationController = {
    postRegistrationTournament: async (req, res) => {
        try {


            const id_registration = utils.generateRandomCode()

            const user_id = utils.decodeToken(req.headers.authorization)

            if (!user_id) {
                return res.status(401).json({ error: 'No autorizado' })
            };

            const { tipo_inscripcion, equipos_id_equipo } = req.body

            // Validacion para saber que ya no esta registrado en el torneo para el mismo tipo de inscripcion
            if (await registrationController.serachRegistration(req.params.idTorneo, user_id.id, tipo_inscripcion)) res.status(400).json({ error: 'Ya te encuentras registrado en este torneo' });

            // Informacion del torneo por ID
            const result = await db.query('SELECT * FROM TORNEOS WHERE id_torneo = $1', [req.params.idTorneo]);
            const { its_free, limite_equipos, limite_views, organizador, categorias_id_categoria } = result.rows[0];

            var costo = 0;
            const labelCategory = await registrationController.searchLabelCategoryById(categorias_id_categoria)

            if (its_free.toLowerCase() == 'f') {
                // tipo_inscripcion = 1 -> VIEW
                if (tipo_inscripcion == 1) {
                    let tempCosto = await registrationController.searIdCosto('VIEW')
                    costo = tempCosto.monto + tempCosto.monto * await registrationController.getComisionValue('VIEW');
                }
                // tipo_inscripcion = 2 -> PLAYER
                else if (tipo_inscripcion == 2) {
                    let tempCosto = await registrationController.searIdCosto(labelCategory)
                    costo = tempCosto.monto + tempCosto.monto * await registrationController.getComisionValue('jugador');
                }
            }



          
            /* -------------------------------------------------------------------------- */
            /*                            INICIO METODO DE PAGO                           */
            /* -------------------------------------------------------------------------- */


            console.log('Entramos al metodo de pago')

            const paymentIntent = await stripe.paymentIntents.create({
                amount: 20000000,
                currency: "usd",
                automatic_payment_methods: {
                    enabled: true,
                },
                // confirm: true,
                // return_url: 'https://www.example.com',
                // payment_method: 'pm_card_visa',
                description: 'Payment for registration',
                receipt_email : 'arangomariana600+pagos@gmail.com'
            });


            let id = paymentIntent.id;

            console.log('paymentIntent', paymentIntent.id)


            // const paymentIntentConfirm = await stripe.paymentIntents.confirm(
            //     paymentIntent.id,
            //     {
            //         payment_method: 'pm_card_visa',
            //         return_url: 'https://www.example.com',
            //         receipt_email : 'arangomariana600@gmail.com'
            //     }
            // );


            const paymentIntentCancel = await stripe.paymentIntents.cancel(id);

            console.log('paymentIntentCancel', paymentIntentCancel)
            // res.json({ value: paymentIntentCancel });

            /* -------------------------------------------------------------------------- */
            /*                            FINAL METODO DE PAGO                            */
            /* -------------------------------------------------------------------------- */











            // Informacion que se guardara en el QR
            let info = {
                codigoRegistro: id_registration,
                torneos_id_torneo: req.params.idTorneo,
                usuarios_id_usuario: user_id.id,
                tipo_inscripcion: tipo_inscripcion == 1 ? 'View' : 'Player',
                equipos_id_equipo,
                its_free,
                limite_equipos,
                limite_views,
                organizador,
                categorias: labelCategory,
                costo: costo
            }

            const jsonString = JSON.stringify(info);
            const qrBase64 = await QRCode.toDataURL(jsonString);

            res.setHeader('Content-Type', 'image/png');

            QRCode.toBuffer(jsonString, (err, buffer) => {
                if (err) {
                    console.error("Error al generar QR:", err);
                    return res.status(500).json({ error: 'Error al generar el código QR' });
                }
                res.send(buffer);
            });



        } catch (err) {
            console.log(err)
            res.status(500).json({ error: 'Error al realizar registro para un torneo' });
        }
    },
    serachRegistration: async (idTorneo, id_user, tipo_inscripcion) => {
        try {
            const result = await db.query('SELECT * FROM inscripciones WHERE torneos_id_torneo = $1 AND usuarios_id_usuario = $2 AND tipo_inscripcion = $3', [idTorneo, id_user, tipo_inscripcion]);
            if (result.rows.length == 1) {
                return true;
            }
            return result.rows[0];
        } catch (error) {
            console.error("Error al obtener registro:", error);
        }
    },
    searIdCosto: async (label) => {
        try {
            label = label.replaceAll(' ', '');

            const result = await db.query(`SELECT * FROM precios WHERE LOWER(descripcion) ILIKE  '%${label}%'`);
            return result.rows[0];

            //Crear Validacion para cuando no lo encuentre
        } catch (error) {
            console.log('Error')
        }
    },
    searchLabelCategoryById: async (id) => {
        try {
            const result = await db.query(`select * from categorias c where c.id_categoria = '${id}'`);
            return result.rows[0].nombre;
            //Crear Validacion para cuando no lo encuentre
        } catch (error) {
            console.log('Error')
        }
    },
    getComisionValue: async (text) => {
        try {
            text = text.replaceAll(' ', '');

            const result = await db.query(`SELECT * FROM comisiones WHERE LOWER(descripcion) ILIKE '%${text}%'`);
            return result.rows[0].valor;
            //Crear Validacion para cuando no lo encuentre
        } catch (error) {
            console.log('Error al traer comisiones', error)
        }
    }

};

module.exports = registrationController;