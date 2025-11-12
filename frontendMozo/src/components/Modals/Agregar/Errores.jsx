export default function Errores({errors}) {
    if (!errors || Object.keys(errors).length === 0) return null;
    return (
        Object.keys(errors).length > 0 && (
            <div style={{
                backgroundColor: '#ffe6e6',
                padding: '10px',
                marginBottom: '10px',
                border: '1px solid red'
            }}>
                <p><strong>Errores en el formulario:</strong></p>
                <ul>
                    {Object.entries(errors).map(([key, value]) => (
                        <li key={key} style={{ color: 'red' }}>
                            Campo <b>{key}</b>: {value}
                        </li>
                    ))}
                </ul>
            </div>
        )
    )
}