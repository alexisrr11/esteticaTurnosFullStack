function darkMode () {
    const html = document.documentElement;
    const btnModoOscuro = document.getElementById('modoOscuroBtn');

    btnModoOscuro.addEventListener('click', () => {
        html.classList.toggle('dark');
        setTimeout(() => {
          btnModoOscuro.style.background = (btnModoOscuro.style.background === "bisque" ? "white" : "bisque");
          btnModoOscuro.style.color = (btnModoOscuro.style.color === "black" ? "white" : "black");
          btnModoOscuro.textContent = (btnModoOscuro.textContent === "☀️" ? "🌙" : "☀️");
        }, 200);
    });
}
console.log(darkMode());

function mostrarAlerta(msg) {
    const alerta = document.getElementById('alerta');
    alerta.textContent = msg;
    alerta.classList.remove('hidden');

    setTimeout(() => {
        alerta.classList.add('hidden');
    }, 3000);
}

const form = document.getElementById('form-turno');
const lista = document.getElementById('lista-turnos');

form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const fecha = document.getElementById('fecha').value;
    const hora = document.getElementById('hora').value;

    if (!nombre || !fecha || !hora) return;

    const turno = { nombre, fecha, hora };

    try {
  const res = await fetch("http://localhost:4000/turnos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(turno)
  });

  const data = await res.json(); // capturar contenido de respuesta

  if (!res.ok) {
    throw new Error(data.mensaje || "Error al guardar turno");
  }

  // Mostrar en el DOM
  const li = document.createElement('li');
  li.className = 'p-3 border border-gray-300 dark:border-gray-600 rounded-lg';
  li.textContent = `${nombre} - ${fecha} a las ${hora}`;
  form.reset();
  mostrarAlerta("✅ Su turno se ha reservado correctamente");

} catch (error) {
  console.error("Error:", error.message);
  mostrarAlerta("❌ " + error.message); // Mostramos error en pantalla
}

});
