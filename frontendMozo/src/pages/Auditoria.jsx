//Datatable
import DataTable from 'datatables.net-react';
import DT from 'datatables.net-dt';
import 'datatables.net-select-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-buttons/js/buttons.html5';
import jszip from 'jszip';

// Importar pdfmake y sus fuentes antes de inicializarlo con DataTables
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";


const Auditoria = (props) => {
    pdfMake.vfs = pdfFonts.vfs; // Asigna las fuentes aquí
    DataTable.use(DT);
    DT.Buttons.jszip(jszip);
    DT.Buttons.pdfMake(pdfMake);

    useEffect(() => {
        const now = new Date();
        let startDate = new Date();

        switch (timeUnit) {
            case "days":
                startDate.setDate(now.getDate() - timeValue);
                break;
            case "months":
                startDate.setMonth(now.getMonth() - timeValue);
                break;
            case "years":
                startDate.setFullYear(now.getFullYear() - timeValue);
                break;
            default:
                startDate = new Date("2000-01-01");
        }

        // Filtrar los registros cuya fecha es mayor o igual a la fecha límite
        const filtered = data.filter((item) => new Date(item.fecha) >= startDate).slice(0, 800);
        setFilteredData(filtered);
    }, [timeValue, timeUnit]);

    return <DataTable
        data={formattedData}
        columns={cols}
        className="display"
        options={{
            layout: {
                topStart: 'buttons',
            },
            select: true,
            language: {
                decimal: ",",
                thousands: ".",
                processing: "Procesando...",
                search: "Buscar:",
                lengthMenu: "Mostrar _MENU_ registros",
                info: "Mostrando _START_ al _END_ de _TOTAL_",
                infoEmpty: "Mostrando 0 al 0 de 0 registros en total",
                infoFiltered: "(filtrado de un total de _MAX_ registros)",
                loadingRecords: "Cargando...",
                zeroRecords: "No se encontraron resultados",
                emptyTable: "Ningun dato disponible en esta busqueda",
            }


        }}
    >
        <thead>
            <tr>
                <th>Producto</th>
                <th>Indicaciones</th>
                <th>Precio</th>
                <th>Fecha</th>
                <th>Mesa</th>
            </tr>
        </thead>
    </DataTable>
}

export default Auditoria;