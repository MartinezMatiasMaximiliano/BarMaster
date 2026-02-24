import { useState, useEffect, useMemo, useCallback } from 'react';
import { BuscarTodosLosProductos } from '../../../../API/APIProductos';
import { BuscarTodasLasCategorias } from '../../../../API/APICategorias';

/**
 * Hook para selector de productos con comanda (sin envío a API).
 * Reutilizable para Delivery, Takeaway, etc.
 */
export const useComandaProductos = (open) => {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [busqueda, setBusqueda] = useState('');
    const [categoriaFiltro, setCategoriaFiltro] = useState(null);
    const [comanda, setComanda] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [productosData, categoriasData] = await Promise.all([
                    BuscarTodosLosProductos(),
                    BuscarTodasLasCategorias()
                ]);
                setProductos(productosData?.filter(p => p.activo) || []);
                setCategorias(categoriasData?.filter(c => c.activo) || []);
            } catch (error) {
                console.error('Error al cargar datos:', error);
            }
        };
        if (open) {
            cargarDatos();
        }
    }, [open]);

    const productosFiltrados = useMemo(() => {
        let filtrados = productos;
        if (busqueda) {
            filtrados = filtrados.filter(p =>
                p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                p.descripcion?.toLowerCase().includes(busqueda.toLowerCase())
            );
        }
        if (categoriaFiltro) {
            filtrados = filtrados.filter(p => {
                if (!p.categorias || !Array.isArray(p.categorias)) return false;
                return p.categorias.includes(categoriaFiltro.nombre);
            });
        }
        return filtrados;
    }, [productos, busqueda, categoriaFiltro]);

    const totalComanda = useMemo(() => {
        return comanda.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
    }, [comanda]);

    const totalItems = useMemo(() => {
        return comanda.reduce((sum, item) => sum + item.cantidad, 0);
    }, [comanda]);

    const agregarAComanda = useCallback((producto) => {
        setComanda((prev) => {
            const existe = prev.find(item => item.producto.id === producto.id);
            if (existe) {
                return prev.map(item =>
                    item.producto.id === producto.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [...prev, { producto, cantidad: 1, indicaciones: '' }];
        });
    }, []);

    const actualizarCantidad = useCallback((productoId, nuevaCantidad) => {
        setComanda((prev) => {
            if (nuevaCantidad <= 0) {
                return prev.filter(item => item.producto.id !== productoId);
            }
            return prev.map(item =>
                item.producto.id === productoId
                    ? { ...item, cantidad: nuevaCantidad }
                    : item
            );
        });
    }, []);

    const actualizarIndicaciones = useCallback((productoId, indicaciones) => {
        setComanda((prev) =>
            prev.map(item =>
                item.producto.id === productoId ? { ...item, indicaciones } : item
            )
        );
    }, []);

    const limpiarComanda = useCallback(() => {
        setComanda([]);
        setBusqueda('');
        setCategoriaFiltro(null);
    }, []);

    return {
        productos,
        categorias,
        productosFiltrados,
        comanda,
        busqueda,
        categoriaFiltro,
        totalComanda,
        totalItems,
        setBusqueda,
        setCategoriaFiltro,
        agregarAComanda,
        actualizarCantidad,
        actualizarIndicaciones,
        limpiarComanda,
    };
};
