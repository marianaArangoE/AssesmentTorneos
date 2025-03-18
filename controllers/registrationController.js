const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET || 'secreto_super_seguro';

const utils = require('../utils/utils');
const authMiddleware = require('../Middleware/authMiddleware');
const { json, text } = require('express');
const QRCode = require('qrcode');
const stripe = require("stripe")(process.env.STRIPE);

const registrationController = {
    postRegistrationTournament: async (req, res) => {
        try {
            const id_registration = utils.generateRandomCode();
            const user_id = utils.decodeToken(req.headers.authorization);

            if (!user_id) {
                return res.status(401).json({ error: 'No autorizado' });
            }

            const { tipo_inscripcion, equipos_id_equipo } = req.body;
            const equipo_id = equipos_id_equipo || null;

            // Validación para saber si ya está registrado en el torneo para el mismo tipo de inscripción
            if (await registrationController.searchRegistration(req.params.idTorneo, user_id.id_usuario, tipo_inscripcion)) {
                return res.status(400).json({ error: 'Ya te encuentras registrado en este torneo' });
            }

            // Información del torneo por ID
            const result = await db.query('SELECT * FROM TORNEOS WHERE id_torneo = $1', [req.params.idTorneo]);
            const { its_free, limite_equipos, limite_views, organizador, categorias_id_categoria } = result.rows[0];

            // Validar cupos disponibles
            if (tipo_inscripcion == 1) {
                const countRegistration = await registrationController.getCountInscription(req.params.idTorneo, tipo_inscripcion);
                if (countRegistration == limite_views) {
                    return res.status(400).json({ error: 'No hay cupo para la inscripción' });
                }
            } else if (tipo_inscripcion == 2) {
                const countRegistration = await registrationController.getCountInscription(req.params.idTorneo, tipo_inscripcion);
                if (countRegistration >= limite_equipos) {
                    return res.status(400).json({ error: 'No hay cupo para la inscripción' });
                }
            }else{
                return res.status(400).json({ error: 'Tipo de inscripción no válido' });
            }

            let costo = 0;
            const labelCategory = await registrationController.searchLabelCategoryById(categorias_id_categoria);

            if (its_free.toLowerCase() === 'f') {
                if (tipo_inscripcion == 1) {
                    const tempCosto = await registrationController.searchIdCosto('VIEW');
                    costo = tempCosto.monto + tempCosto.monto * await registrationController.getComisionValue('VIEW');
                } else if (tipo_inscripcion == 2) {
                    const tempCosto = await registrationController.searchIdCosto(labelCategory);
                    costo = tempCosto.monto + tempCosto.monto * await registrationController.getComisionValue('jugador');
                }
            }

            // Inicio método de pago
            const paymentIntent = await stripe.paymentIntents.create({
                amount: await registrationController.conversionDollars(costo),
                currency: "USD",
                automatic_payment_methods: {
                    enabled: true,
                },
                description: 'Payment for registration',
                receipt_email: user_id.email
            });

            const id = paymentIntent.id;

            if (Math.random() < 0.8) {  // 80% de probabilidad de que el pago sea exitoso
                await stripe.paymentIntents.confirm(paymentIntent.id, {
                    payment_method: 'pm_card_visa',
                    return_url: 'https://www.example.com',
                    receipt_email: user_id.email
                });
            } else {
                await stripe.paymentIntents.cancel(id);
                return res.status(400).json({ error: 'Error al realizar el pago' });
            }

            // Final método de pago

            // Guardar registro en la base de datos
            const info = {
                codigoRegistro: id_registration,
                torneos_id_torneo: req.params.idTorneo,
                usuarios_id_usuario: user_id.id_usuario,
                tipo_inscripcion: tipo_inscripcion == 1 ? 'View' : 'Player',
                equipos_id_equipo: equipo_id,
                its_free,
                limite_equipos,
                limite_views,
                organizador,
                categorias: labelCategory,
                costo
            };

            const jsonString = JSON.stringify(info); // Genera texto JSON
            const qrBase64 = await QRCode.toDataURL(jsonString); // Genera base64 del QR

            await db.query('INSERT INTO inscripciones (id_inscripciones, tipo_inscripcion, torneos_id_torneo, monto, codigo, equipos_id_equipo, usuarios_id_usuario, precios_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8);', [id_registration, tipo_inscripcion, req.params.idTorneo, costo, qrBase64, equipo_id, user_id.id_usuario, 1]);

            // Genera una imagen QR a partir del json String
            res.setHeader('Content-Type', 'image/png');
            QRCode.toBuffer(jsonString, (err, buffer) => {
                if (err) {
                    console.error("Error al generar QR:", err);
                    return res.status(500).json({ error: 'Error al generar el código QR' });
                }
                res.send(buffer);
            });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Error al realizar registro para un torneo' });
        }
    },

    searchRegistration: async (idTorneo, id_user, tipo_inscripcion) => {
        try {
            const result = await db.query('SELECT * FROM inscripciones WHERE torneos_id_torneo = $1 AND usuarios_id_usuario = $2 AND tipo_inscripcion = $3', [idTorneo, id_user, tipo_inscripcion]);
            return result.rows.length > 0;
        } catch (error) {
            console.error("Error al obtener registro:", error);
            return false;
        }
    },

    searchIdCosto: async (label) => {
        try {
            label = label.replaceAll(' ', '');
            const result = await db.query(`SELECT * FROM precios WHERE LOWER(descripcion) ILIKE  '%${label}%'`);
            return result.rows[0];
        } catch (error) {
            console.error('Error al buscar costo:', error);
            return null;
        }
    },

    searchLabelCategoryById: async (id) => {
        try {
            const result = await db.query(`SELECT * FROM categorias WHERE id_categoria = $1`, [id]);
            return result.rows[0].nombre;
        } catch (error) {
            console.error('Error al buscar categoría:', error);
            return null;
        }
    },

    getComisionValue: async (text) => {
        try {
            text = text.replaceAll(' ', '');
            const result = await db.query(`SELECT * FROM comisiones WHERE LOWER(descripcion) ILIKE '%${text}%'`);
            return result.rows[0].valor;
        } catch (error) {
            console.error('Error al obtener comisiones:', error);
            return null;
        }
    },

    conversionDollars: async (cop, tasaCambio = null) => {

        if (!tasaCambio) {
            try {
                const respuesta = await fetch('https://v6.exchangerate-api.com/v6/8b267eec9bcdd150e7a2437b/latest/USD');
                const datos = await respuesta.json();
                tasaCambio = datos.conversion_rates.COP;
            } catch (error) {
                return null;
            }
        }
        
        const resultado = String((cop / tasaCambio).toFixed(2)).replace('.', '');
        return resultado;
    },

    getRegistrationById: async (req, res) => {
        try {
            const result = await db.query('SELECT codigo FROM inscripciones WHERE id_inscripciones = $1', [req.params.idRegistro]);
            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Registro no encontrado' });
            }

            const base64Image = result.rows[0].codigo;
            if (!base64Image.startsWith('data:image/png;base64,')) {
                return res.status(400).json({ error: 'El código almacenado no es una imagen válida' });
            }

            const imageBuffer = Buffer.from(base64Image.split(',')[1], 'base64');
            res.setHeader('Content-Type', 'image/png');
            res.send(imageBuffer);

        } catch (error) {
            console.error("Error al mostrar la información:", error);
            res.status(500).json({ error: 'Error al obtener registro' });
        }
    },

    getCountInscription: async (idTorneo, idTipoInscripcion) => {
        try {
            const result = await db.query('SELECT count(*) FROM inscripciones WHERE torneos_id_torneo = $1 AND tipo_inscripcion = $2', [idTorneo, idTipoInscripcion]);
            return parseInt(result.rows[0].count, 10);
        } catch (error) {
            console.error("Error al obtener el conteo de inscripciones: =>", error);
            return 0;
        }
    },
};

module.exports = registrationController;