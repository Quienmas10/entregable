// Simulación de base de datos en memoria usando localStorage
let productos = JSON.parse(localStorage.getItem('productos')) || [
    { id_producto: 1, nombre: 'Paracetamol 500mg', precio: 1.50, stock: 100, stock_minimo: 20 },
    { id_producto: 2, nombre: 'Ibuprofeno 400mg', precio: 2.00, stock: 50, stock_minimo: 15 },
    { id_producto: 3, nombre: 'Amoxicilina 500mg', precio: 3.50, stock: 30, stock_minimo: 10 }
];
let ventas = JSON.parse(localStorage.getItem('ventas')) || [];
let ventaId = ventas.length > 0 ? Math.max(...ventas.map(v => v.id_venta)) + 1 : 1;

function guardarDatos() {
    localStorage.setItem('productos', JSON.stringify(productos));
    localStorage.setItem('ventas', JSON.stringify(ventas));
}

// Login simulado
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value;
    const password = document.getElementById('password').value;
    if (usuario === 'admin' && password === '12345') {
        window.location.href = 'dashboard.html';
    } else {
        alert('Usuario o contraseña incorrectos');
    }
});

// Cargar alertas de stock bajo
function cargarAlertas() {
    const tbody = document.querySelector('#alertasTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    productos.forEach(producto => {
        if (producto.stock <= producto.stock_minimo) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${producto.nombre}</td>
                <td>${producto.stock}</td>
                <td>${producto.stock_minimo}</td>
            `;
            tbody.appendChild(tr);
        }
    });
    if (tbody.innerHTML === '') {
        tbody.innerHTML = '<tr><td colspan="3">No hay productos con stock bajo.</td></tr>';
    }
}

// Cargar tabla de productos
function cargarProductos() {
    const tbody = document.querySelector('#productosTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    productos.forEach(producto => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${producto.id_producto}</td>
            <td>${producto.nombre}</td>
            <td>S/ ${producto.precio.toFixed(2)}</td>
            <td>${producto.stock}</td>
            <td>${producto.stock_minimo}</td>
            <td>
                <button class="btn btn-warning btn-sm" onclick="editarProducto(${producto.id_producto})">Editar</button>
                <button class="btn btn-danger btn-sm" onclick="eliminarProducto(${producto.id_producto})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Agregar producto
document.getElementById('agregarProductoForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value;
    const precio = parseFloat(document.getElementById('precio').value);
    const stock = parseInt(document.getElementById('stock').value);
    const stock_minimo = parseInt(document.getElementById('stock_minimo').value);
    const nuevoProducto = {
        id_producto: productos.length > 0 ? Math.max(...productos.map(p => p.id_producto)) + 1 : 1,
        nombre,
        precio,
        stock,
        stock_minimo
    };
    productos.push(nuevoProducto);
    guardarDatos();
    alert('Producto agregado correctamente');
    bootstrap.Modal.getInstance(document.getElementById('agregarProductoModal')).hide();
    cargarProductos();
});

// Editar producto
function editarProducto(id) {
    const producto = productos.find(p => p.id_producto === id);
    const modal = document.createElement('div');
    modal.classList.add('modal', 'fade');
    modal.id = `editarProductoModal${id}`;
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Editar Producto</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="editarProductoForm${id}">
                        <input type="hidden" id="id_producto" value="${id}">
                        <div class="mb-3">
                            <label for="nombreEdit" class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="nombreEdit" value="${producto.nombre}" required>
                        </div>
                        <div class="mb-3">
                            <label for="precioEdit" class="form-label">Precio</label>
                            <input type="number" step="0.01" class="form-control" id="precioEdit" value="${producto.precio}" required>
                        </div>
                        <div class="mb-3">
                            <label for="stockEdit" class="form-label">Stock</label>
                            <input type="number" class="form-control" id="stockEdit" value="${producto.stock}" required>
                        </div>
                        <div class="mb-3">
                            <label for="stock_minimoEdit" class="form-label">Stock Mínimo</label>
                            <input type="number" class="form-control" id="stock_minimoEdit" value="${producto.stock_minimo}" required>
                        </div>
                        <button type="submit" class="btn btn-primary">Guardar Cambios</button>
                    </form>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    document.getElementById(`editarProductoForm${id}`).addEventListener('submit', (e) => {
        e.preventDefault();
        producto.nombre = document.getElementById('nombreEdit').value;
        producto.precio = parseFloat(document.getElementById('precioEdit').value);
        producto.stock = parseInt(document.getElementById('stockEdit').value);
        producto.stock_minimo = parseInt(document.getElementById('stock_minimoEdit').value);
        guardarDatos();
        alert('Producto actualizado correctamente');
        bsModal.hide();
        cargarProductos();
    });
}

// Eliminar producto
function eliminarProducto(id) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        productos = productos.filter(p => p.id_producto !== id);
        guardarDatos();
        alert('Producto eliminado correctamente');
        cargarProductos();
    }
}

// Cargar productos en el formulario de ventas
function cargarProductosVenta() {
    const select = document.getElementById('producto');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccione un producto</option>';
    productos.forEach(producto => {
        if (producto.stock > 0) {
            const option = document.createElement('option');
            option.value = producto.id_producto;
            option.dataset.precio = producto.precio;
            option.dataset.stock = producto.stock;
            option.textContent = `${producto.nombre} (Stock: ${producto.stock}, Precio: S/ ${producto.precio.toFixed(2)})`;
            select.appendChild(option);
        }
    });
}

// Calcular total en ventas
function calcularTotal() {
    const select = document.getElementById('producto');
    const cantidadInput = document.getElementById('cantidad');
    const totalInput = document.getElementById('total');
    if (!select || !cantidadInput || !totalInput) return;
    const selectedOption = select.options[select.selectedIndex];
    const precio = parseFloat(selectedOption.dataset.precio) || 0;
    const cantidad = parseInt(cantidadInput.value) || 0;
    const stock = parseInt(selectedOption.dataset.stock) || 0;
    if (cantidad > stock) {
        alert('La cantidad solicitada excede el stock disponible.');
        cantidadInput.value = stock;
        totalInput.value = (stock * precio).toFixed(2);
    } else {
        totalInput.value = (cantidad * precio).toFixed(2);
    }
}

// Registrar venta
document.getElementById('ventaForm')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const id_producto = parseInt(document.getElementById('producto').value);
    const cantidad = parseInt(document.getElementById('cantidad').value);
    const total = parseFloat(document.getElementById('total').value);
    const producto = productos.find(p => p.id_producto === id_producto);
    if (producto.stock < cantidad) {
        alert('Stock insuficiente');
        return;
    }
    producto.stock -= cantidad;
    const fecha = new Date().toLocaleString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    ventas.push({
        id_venta: ventaId++,
        fecha,
        producto: producto.nombre,
        cantidad,
        precio_unitario: producto.precio,
        total
    });
    guardarDatos();
    alert('Venta registrada correctamente');
    document.getElementById('ventaForm').reset();
    cargarProductosVenta();
});

// Cargar historial de ventas
function cargarVentas() {
    const tbody = document.querySelector('#ventasTable tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    ventas.forEach(venta => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${venta.id_venta}</td>
            <td>${venta.fecha}</td>
            <td>${venta.producto}</td>
            <td>${venta.cantidad}</td>
            <td>S/ ${venta.precio_unitario.toFixed(2)}</td>
            <td>S/ ${venta.total.toFixed(2)}</td>
        `;
        tbody.appendChild(tr);
    });
    if (ventas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No se han registrado ventas.</td></tr>';
    }
}

// Inicializar páginas
document.addEventListener('DOMContentLoaded', () => {
    cargarAlertas();
    cargarProductos();
    cargarProductosVenta();
    cargarVentas();
    document.getElementById('producto')?.addEventListener('change', calcularTotal);
    document.getElementById('cantidad')?.addEventListener('input', calcularTotal);
});
