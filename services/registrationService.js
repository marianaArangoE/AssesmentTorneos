const RegistrationRepository = require('../repository/registrationRepository');
const stripe = require("stripe")(process.env.STRIPE);
const QRCode = require('qrcode');

const RegistrationService = {
    async registerForTournament(idTorneo, tipo_inscripcion, equipos_id_equipo, user_id) {
        const id_registration = Math.floor(Math.random() * 1000000);
    
        
        const existingRegistration = await RegistrationRepository.searchRegistration(idTorneo, user_id, tipo_inscripcion);
        if (existingRegistration) {
            throw new Error('Ya te encuentras registrado en este torneo');
        }
    
      
        const tournament = await RegistrationRepository.getTournamentById(idTorneo);
        if (!tournament.rows.length) throw new Error('Torneo no encontrado');
    
        const { its_free, limite_equipos, limite_views, categorias_id_categoria } = tournament.rows[0];
    
        if (tipo_inscripcion != 1 && tipo_inscripcion != 2) {
            throw new Error('Tipo de inscripción no válido' );
        }
        const countRegistration = await RegistrationRepository.getCountInscription(idTorneo, tipo_inscripcion);
        if ((tipo_inscripcion == 1 && countRegistration >= limite_views) ||
            (tipo_inscripcion == 2 && countRegistration >= limite_equipos)) {
            throw new Error('No hay cupo para la inscripción');
        }
    
      
        if (!equipos_id_equipo || isNaN(equipos_id_equipo)) {
            throw new Error('Debes seleccionar un equipo válido para inscribirte.');
        }
    
      
        let costo = 0;
        const labelCategory = await RegistrationRepository.searchLabelCategoryById(categorias_id_categoria);
    
        if (its_free.toLowerCase() === 'f') {
            if (tipo_inscripcion == 1) {
                const tempCosto = await RegistrationRepository.searchIdCosto('VIEW');
                costo = tempCosto.rows[0].monto + tempCosto.rows[0].monto * await RegistrationRepository.getComisionValue('VIEW');
            } else if (tipo_inscripcion == 2) {
                const tempCosto = await RegistrationRepository.searchIdCosto(labelCategory);
                costo = tempCosto.rows[0].monto + tempCosto.rows[0].monto * await RegistrationRepository.getComisionValue('jugador');
            }
        }
    
      
        var tasaCambio = await RegistrationRepository.conversionDollars(costo);
        if (tasaCambio > 0) {
            tasaCambio = Math.max(50, tasaCambio); // Stripe requiere mínimo 50 centavos
    
            
            const paymentIntent = await stripe.paymentIntents.create({
                amount: tasaCambio == 0 ? '050' : tasaCambio,
                currency: "USD",
                automatic_payment_methods: { enabled: true },
                description: 'Payment for registration',
                receipt_email: user_id.email
            });
    
            if (Math.random() < 0.8 || tasaCambio == 0) {
                await stripe.paymentIntents.confirm(paymentIntent.id, {
                    payment_method: 'pm_card_visa',
                    return_url: 'https://www.example.com',
                    receipt_email: user_id.email
                });
            } else {
                await stripe.paymentIntents.cancel(paymentIntent.id);
                throw new Error('Error al realizar el pago');
            }
        }
    
       
        const qrData = JSON.stringify({ id_registration, idTorneo, user_id, tipo_inscripcion, costo });
        const qrBase64 = await QRCode.toDataURL(qrData);
    
       
        await RegistrationRepository.insertRegistration(id_registration, tipo_inscripcion, idTorneo, costo, qrBase64, equipos_id_equipo, user_id);
    
        return qrBase64;
    },

    async getRegistrationQRCode(idRegistro) {
        const result = await RegistrationRepository.getRegistrationById(idRegistro);
        if (!result.rows.length) throw new Error('Registro no encontrado');

        return Buffer.from(result.rows[0].codigo.split(',')[1], 'base64');
    }
};

module.exports = RegistrationService;
