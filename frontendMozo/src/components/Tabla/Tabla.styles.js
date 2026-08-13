import { TableCell, TableRow } from "@mui/material";
import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
        backgroundColor: theme.palette.grey[100],
        color: theme.palette.text.primary,
        fontWeight: 200,
        fontSize: '0.875rem',
    },
    [`&.${tableCellClasses.body}`]: {
        fontSize: '0.875rem',
        fontWeight: 200,
    },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
    "&:nth-of-type(even)": {
        backgroundColor: theme.palette.action.hover,
    },
    "&:hover": {
        backgroundColor: theme.palette.action.selected,
    },
    "&:last-child td, &:last-child th": {
        border: 0,
    },
}));

