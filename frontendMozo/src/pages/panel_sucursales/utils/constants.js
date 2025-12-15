import RestaurantIcon from '@mui/icons-material/Restaurant';
import TableRestaurantIcon from '@mui/icons-material/TableRestaurant';
import ReceiptIcon from '@mui/icons-material/Receipt';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Mapeo de módulos a componentes de iconos y colores
export const modulosConfig = {
    'Monitor de Cocina (KDS)': {
        IconComponent: RestaurantIcon,
        color: 'primary'
    },
    'Gestión de Mesas': {
        IconComponent: TableRestaurantIcon,
        color: 'success'
    },
    'Facturación Electrónica': {
        IconComponent: ReceiptIcon,
        color: 'warning'
    },
    'Delivery/Take Away': {
        IconComponent: DeliveryDiningIcon,
        color: 'info'
    }
};

// Mapeo de planes a colores
export const planColors = {
    'Plan Inicial': 'primary',
    'Plan Avanzado': 'success',
    'Plan Pro': 'warning'
};

// Precios de planes y módulos
export const preciosPlanes = {
    'Plan Inicial': 8000,
    'Plan Avanzado': 15000,
    'Plan Pro': 25000
};

export const preciosModulos = {
    'Monitor de Cocina (KDS)': 3000,
    'Gestión de Mesas': 2000,
    'Facturación Electrónica': 4000,
    'Delivery/Take Away': 3500
};

