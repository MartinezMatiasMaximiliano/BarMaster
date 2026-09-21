import Toast from 'react-bootstrap/Toast';
import WarningIcon from '@mui/icons-material/Warning';
import { formatearFecha } from '../Helpers/HelperFunctions';

function StockAlertCard({ producto, onDismiss }) {
    const fechaInicio = producto.fechaInicioStockBajo
        ? formatearFecha(producto.fechaInicioStockBajo)
        : 'fecha desconocida';

    return (
        <Toast className="mb-2 w-100" show onClose={onDismiss}>
            <Toast.Header>
                <WarningIcon className="me-2 text-warning" fontSize="small" />
                <strong className="me-auto">Stock bajo</strong>
            </Toast.Header>
            <Toast.Body>
                <strong>{producto.nombreProducto}</strong>
                <div>Stock actual: {producto.cantidadActual}</div>
                <small className="d-block text-muted mt-2">Desde {fechaInicio}</small>
            </Toast.Body>
        </Toast>
    );
}

export default StockAlertCard;
