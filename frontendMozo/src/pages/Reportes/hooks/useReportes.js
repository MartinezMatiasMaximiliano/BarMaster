import React, { useState, useEffect, useMemo } from 'react';
import {
    BuscarTodasLasVisitas,
    BuscarTodasLasMesas,
    BuscarTodosLosProductos,
    BuscarTodasLasCategorias,
    BuscarTodosLosTipoPagos
} from '../../../API/APIVisitas';

export const useReportes = (filtros) => {
    const [visitas, setVisitas] = useState([]);
    const [mesas, setMesas] = useState([]);
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [tipoPagos, setTipoPagos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Memoizar los filtros para la API para evitar re-renders innecesarios
    const filtrosAPI = useMemo(() => {
        return filtros.obtenerFiltrosParaAPI();
    }, [
        filtros.filtros.fechaInicio,
        filtros.filtros.fechaFin,
        filtros.filtros.idMesas?.join(','),
        filtros.filtros.estados?.join(',')
    ]);

    // Cargar datos iniciales - solo cargar una vez al montar, los filtros se aplican después
    useEffect(() => {
        const cargarDatos = async () => {
            setLoading(true);
            setError(null);
            try {
                // Cargar datos base (sin filtros de fecha para evitar recargas)
                const [visitasData, mesasData, productosData, categoriasData, tipoPagosData] = await Promise.all([
                    BuscarTodasLasVisitas({}), // Cargar todas las visitas inicialmente
                    BuscarTodasLasMesas(),
                    BuscarTodosLosProductos(),
                    BuscarTodasLasCategorias(),
                    BuscarTodosLosTipoPagos()
                ]);

                setVisitas(visitasData);
                setMesas(mesasData);
                setProductos(productosData);
                setCategorias(categoriasData);
                setTipoPagos(tipoPagosData);
            } catch (err) {
                console.error('Error al cargar datos:', err);
                setError('Error al cargar los datos. Por favor, intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, []); // Solo ejecutar una vez al montar

    // Aplicar filtros a las visitas
    const visitasFiltradas = useMemo(() => {
        let filtradas = [...visitas];

        // Filtro por fechas
        if (filtros.filtros.fechaInicio) {
            const fechaInicio = new Date(filtros.filtros.fechaInicio);
            filtradas = filtradas.filter(v => new Date(v.fechaHora) >= fechaInicio);
        }
        if (filtros.filtros.fechaFin) {
            const fechaFin = new Date(filtros.filtros.fechaFin);
            fechaFin.setHours(23, 59, 59, 999); // Incluir todo el día
            filtradas = filtradas.filter(v => new Date(v.fechaHora) <= fechaFin);
        }

        // Filtro por mozos (a través de mesas)
        if (filtros.filtros.idMozos && filtros.filtros.idMozos.length > 0) {
            const mesasMozos = mesas.filter(m => filtros.filtros.idMozos.includes(m.idMozo));
            const idsMesas = mesasMozos.map(m => m.id);
            filtradas = filtradas.filter(v => idsMesas.includes(v.idMesa));
        }

        // Filtro por mesas
        if (filtros.filtros.idMesas && filtros.filtros.idMesas.length > 0) {
            filtradas = filtradas.filter(v => filtros.filtros.idMesas.includes(v.idMesa));
        }

        // Filtro por categorías (a través de productos)
        if (filtros.filtros.idCategorias && filtros.filtros.idCategorias.length > 0) {
            // Los productos tienen idCategoria como número (1, 2, 3...)
            // Las categorías tienen id como UUID
            // Necesitamos mapear los UUIDs de categorías a sus números correspondientes
            // El índice de la categoría en el array + 1 = idCategoria del producto
            const categoriasFiltradas = categorias.filter(c => 
                filtros.filtros.idCategorias.includes(c.id.toString())
            );
            
            // Obtener los números de categoría (índice + 1) para cada categoría filtrada
            const numerosCategorias = categoriasFiltradas.map(c => {
                const indice = categorias.findIndex(cat => cat.id === c.id);
                return indice >= 0 ? indice + 1 : null;
            }).filter(i => i !== null);
            
            // Filtrar productos que pertenezcan a las categorías seleccionadas
            const productosCategorias = productos.filter(p => 
                numerosCategorias.includes(p.idCategoria)
            );
            
            const nombresProductos = productosCategorias.map(p => p.nombre);
            filtradas = filtradas.filter(v => 
                v.productos.some(p => nombresProductos.includes(p.nombreProducto))
            );
        }

        // Filtro por tipo de pago
        if (filtros.filtros.idTipoPagos && filtros.filtros.idTipoPagos.length > 0) {
            filtradas = filtradas.filter(v => 
                v.pagos.some(p => filtros.filtros.idTipoPagos.includes(p.idTipoPago.toString()))
            );
        }

        // Filtro por estados
        if (filtros.filtros.estados && filtros.filtros.estados.length > 0) {
            filtradas = filtradas.filter(v => filtros.filtros.estados.includes(v.estado));
        }

        return filtradas;
    }, [
        visitas, 
        mesas, 
        productos, 
        filtros.filtros.fechaInicio,
        filtros.filtros.fechaFin,
        filtros.filtros.idMozos?.join(','),
        filtros.filtros.idMesas?.join(','),
        filtros.filtros.idCategorias?.join(','),
        filtros.filtros.idTipoPagos?.join(','),
        filtros.filtros.estados?.join(',')
    ]);

    // Métricas principales
    const metricas = useMemo(() => {
        const totalVentas = visitasFiltradas.reduce((sum, v) => sum + (v.total || 0), 0);
        const cantidadVisitas = visitasFiltradas.length;
        const promedioPorVisita = cantidadVisitas > 0 ? totalVentas / cantidadVisitas : 0;
        
        // Calcular productos vendidos (sumar cantidades)
        const productosVendidos = visitasFiltradas.reduce((sum, v) => {
            return sum + v.productos.reduce((prodSum, p) => prodSum + (p.cantidad || 0), 0);
        }, 0);

        // Calcular margen de ganancia (necesita productos con costo)
        const margenGanancia = visitasFiltradas.reduce((sum, v) => {
            const margenVisita = v.productos.reduce((prodSum, p) => {
                const producto = productos.find(prod => prod.nombre === p.nombreProducto);
                if (producto && producto.costo) {
                    const costoTotal = producto.costo * p.cantidad;
                    return prodSum + (p.precioTotal - costoTotal);
                }
                return prodSum;
            }, 0);
            return sum + margenVisita;
        }, 0);

        return {
            totalVentas,
            cantidadVisitas,
            promedioPorVisita,
            productosVendidos,
            margenGanancia
        };
    }, [visitasFiltradas, productos]);

    // Datos para gráficos de ventas
    const datosVentas = useMemo(() => {
        // Por fecha
        const porFecha = {};
        visitasFiltradas.forEach(v => {
            const fecha = new Date(v.fechaHora).toISOString().split('T')[0];
            porFecha[fecha] = (porFecha[fecha] || 0) + (v.total || 0);
        });
        const ventasPorFecha = Object.entries(porFecha)
            .sort(([a], [b]) => new Date(a) - new Date(b))
            .map(([fecha, total]) => ({ fecha, total }));

        // Por hora
        const porHora = {};
        visitasFiltradas.forEach(v => {
            const hora = new Date(v.fechaHora).getHours();
            porHora[hora] = (porHora[hora] || 0) + (v.total || 0);
        });
        const ventasPorHora = Array.from({ length: 24 }, (_, i) => ({
            hora: `${i.toString().padStart(2, '0')}:00`,
            total: porHora[i] || 0
        }));

        // Por día de la semana
        const porDiaSemana = [0, 0, 0, 0, 0, 0, 0];
        visitasFiltradas.forEach(v => {
            const dia = new Date(v.fechaHora).getDay();
            porDiaSemana[dia] += (v.total || 0);
        });
        const ventasPorDiaSemana = [
            'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
        ].map((dia, index) => ({ dia, total: porDiaSemana[index] }));

        // Acumulado
        let acumulado = 0;
        const ventasAcumuladas = ventasPorFecha.map(({ fecha, total }) => {
            acumulado += total;
            return { fecha, total: acumulado };
        });

        // Por tipo de pago
        const porTipoPago = {};
        visitasFiltradas.forEach(v => {
            v.pagos.forEach(p => {
                const tipoPago = tipoPagos.find(tp => tp.id === p.idTipoPago);
                const nombre = tipoPago ? tipoPago.nombre : `Tipo ${p.idTipoPago}`;
                porTipoPago[nombre] = (porTipoPago[nombre] || 0) + (p.monto || 0);
            });
        });
        const ventasPorTipoPago = Object.entries(porTipoPago).map(([nombre, total]) => ({
            nombre,
            total
        }));

        return {
            porFecha: ventasPorFecha,
            porHora: ventasPorHora,
            porDiaSemana: ventasPorDiaSemana,
            acumuladas: ventasAcumuladas,
            porTipoPago: ventasPorTipoPago
        };
    }, [visitasFiltradas, tipoPagos]);

    // Datos para gráficos de productos
    const datosProductos = useMemo(() => {
        const productosVendidos = {};
        
        visitasFiltradas.forEach(v => {
            v.productos.forEach(p => {
                if (!productosVendidos[p.nombreProducto]) {
                    productosVendidos[p.nombreProducto] = {
                        nombre: p.nombreProducto,
                        cantidad: 0,
                        ingresos: 0,
                        costo: 0
                    };
                }
                productosVendidos[p.nombreProducto].cantidad += (p.cantidad || 0);
                productosVendidos[p.nombreProducto].ingresos += (p.precioTotal || 0);
                
                // Buscar costo del producto
                const producto = productos.find(prod => prod.nombre === p.nombreProducto);
                if (producto && producto.costo) {
                    productosVendidos[p.nombreProducto].costo += producto.costo * (p.cantidad || 0);
                }
            });
        });

        const productosArray = Object.values(productosVendidos).map(p => ({
            ...p,
            margen: p.ingresos - p.costo,
            rentabilidad: p.costo > 0 ? ((p.ingresos - p.costo) / p.costo) * 100 : 0
        }));

        // Por categoría
        const porCategoria = {};
        productosArray.forEach(p => {
            const producto = productos.find(prod => prod.nombre === p.nombre);
            if (producto) {
                const categoria = categorias.find(c => c.id === producto.idCategoria.toString() || c.id === producto.idCategoria);
                const nombreCategoria = categoria ? categoria.nombre : 'Sin categoría';
                if (!porCategoria[nombreCategoria]) {
                    porCategoria[nombreCategoria] = {
                        nombre: nombreCategoria,
                        cantidad: 0,
                        ingresos: 0,
                        costo: 0
                    };
                }
                porCategoria[nombreCategoria].cantidad += p.cantidad;
                porCategoria[nombreCategoria].ingresos += p.ingresos;
                porCategoria[nombreCategoria].costo += p.costo;
            }
        });
        const productosPorCategoria = Object.values(porCategoria).map(c => ({
            ...c,
            margen: c.ingresos - c.costo
        }));

        return {
            todos: productosArray.sort((a, b) => b.cantidad - a.cantidad),
            masVendidos: productosArray.sort((a, b) => b.cantidad - a.cantidad).slice(0, 10),
            menosVendidos: productosArray.sort((a, b) => a.cantidad - b.cantidad).slice(0, 10),
            masRentables: productosArray.sort((a, b) => b.margen - a.margen).slice(0, 10),
            porCategoria: productosPorCategoria
        };
    }, [visitasFiltradas, productos, categorias]);

    // Datos para gráficos de mozos
    const datosMozos = useMemo(() => {
        const mozosData = {};
        
        visitasFiltradas.forEach(v => {
            if (v.mesa && v.mesa.idMozo && v.mesa.mozo) {
                const idMozo = v.mesa.idMozo;
                const mozo = v.mesa.mozo;
                if (!mozosData[idMozo]) {
                    mozosData[idMozo] = {
                        idMozo,
                        nombre: mozo.nombres || '',
                        apellido: mozo.apellido || '',
                        nombreCompleto: `${mozo.nombres || ''} ${mozo.apellido || ''}`.trim(),
                        ventas: 0,
                        cantidadVisitas: 0
                    };
                }
                mozosData[idMozo].ventas += (v.total || 0);
                mozosData[idMozo].cantidadVisitas += 1;
            }
        });

        const mozosArray = Object.values(mozosData).map(m => ({
            ...m,
            promedio: m.cantidadVisitas > 0 ? m.ventas / m.cantidadVisitas : 0
        }));

        return {
            todos: mozosArray.sort((a, b) => b.ventas - a.ventas),
            porVentas: mozosArray.sort((a, b) => b.ventas - a.ventas),
            porVisitas: mozosArray.sort((a, b) => b.cantidadVisitas - a.cantidadVisitas)
        };
    }, [visitasFiltradas]);

    // Datos para gráficos de mesas
    const datosMesas = useMemo(() => {
        const mesasData = {};
        
        visitasFiltradas.forEach(v => {
            if (v.mesa) {
                const idMesa = v.mesa.id;
                if (!mesasData[idMesa]) {
                    mesasData[idMesa] = {
                        idMesa,
                        nombre: v.mesa.nombre,
                        ingresos: 0,
                        cantidadVisitas: 0
                    };
                }
                mesasData[idMesa].ingresos += (v.total || 0);
                mesasData[idMesa].cantidadVisitas += 1;
            }
        });

        const mesasArray = Object.values(mesasData);

        return {
            todas: mesasArray.sort((a, b) => b.ingresos - a.ingresos),
            porIngresos: mesasArray.sort((a, b) => b.ingresos - a.ingresos),
            porOcupacion: mesasArray.sort((a, b) => b.cantidadVisitas - a.cantidadVisitas)
        };
    }, [visitasFiltradas]);

    // Datos para reporte de rentabilidad
    const datosRentabilidad = useMemo(() => {
        const totalIngresos = visitasFiltradas.reduce((sum, v) => sum + (v.total || 0), 0);
        
        const totalCostos = visitasFiltradas.reduce((sum, v) => {
            const costoVisita = v.productos.reduce((prodSum, p) => {
                const producto = productos.find(prod => prod.nombre === p.nombreProducto);
                if (producto && producto.costo) {
                    return prodSum + (producto.costo * (p.cantidad || 0));
                }
                return prodSum;
            }, 0);
            return sum + costoVisita;
        }, 0);

        const margenTotal = totalIngresos - totalCostos;
        const margenPorcentaje = totalIngresos > 0 ? (margenTotal / totalIngresos) * 100 : 0;

        return {
            totalIngresos,
            totalCostos,
            margenTotal,
            margenPorcentaje,
            productos: datosProductos.todos.map(p => ({
                nombre: p.nombre,
                ingresos: p.ingresos,
                costo: p.costo,
                margen: p.margen,
                margenPorcentaje: p.ingresos > 0 ? (p.margen / p.ingresos) * 100 : 0
            })),
            categorias: datosProductos.porCategoria.map(c => ({
                nombre: c.nombre,
                ingresos: c.ingresos,
                costo: c.costo,
                margen: c.margen,
                margenPorcentaje: c.ingresos > 0 ? (c.margen / c.ingresos) * 100 : 0
            }))
        };
    }, [visitasFiltradas, productos, datosProductos]);

    return {
        visitas: visitasFiltradas,
        mesas,
        productos,
        categorias,
        tipoPagos,
        metricas,
        datosVentas,
        datosProductos,
        datosMozos,
        datosMesas,
        datosRentabilidad,
        loading,
        error
    };
};

