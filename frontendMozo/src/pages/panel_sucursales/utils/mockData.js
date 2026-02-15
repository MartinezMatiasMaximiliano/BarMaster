// Datos de prueba con información de planes y módulos
export const datosPrueba = [
    {
        "Id": 1,
        "Nombre": "La Cafetería",
        "Emails": ["contacto@lacafeteria.com", "reservas@lacafeteria.com"],
        "Sucursales": [
            {
                "Id": 1,
                "Direccion": "Santiago y 25 de Mayo",
                "Telefono": "381-445-1200",
                "IdEmpresa": 1,
                "Plan": {
                    "nombre": "Plan Pro",
                    "precio": 25000,
                    "idSubscripcion": 101
                },
                "Modulos": [
                    "Monitor de Cocina (KDS)",
                    "Gestión de Mesas",
                    "Facturación Electrónica",
                    "Delivery/Take Away"
                ]
            },
            {
                "Id": 2,
                "Direccion": "Chacabuco 136",
                "Telefono": "381-422-8899",
                "IdEmpresa": 1,
                "Plan": {
                    "nombre": "Plan Avanzado",
                    "precio": 15000,
                    "idSubscripcion": 102
                },
                "Modulos": [
                    "Gestión de Mesas",
                    "Facturación Electrónica"
                ]
            },
            {
                "Id": 3,
                "Direccion": "Lavalle y 9 de Julio",
                "Telefono": "381-431-7722",
                "IdEmpresa": 1,
                "Plan": {
                    "nombre": "Plan Inicial",
                    "precio": 8000,
                    "idSubscripcion": 103
                },
                "Modulos": [
                    "Gestión de Mesas"
                ]
            }
        ]
    }
];

// Datos de facturación (datos de prueba)
export const datosFacturacion = {
    totalPagar: 48000,
    fechaVencimiento: '2025-11-15',
    periodo: 'Noviembre 2025'
};