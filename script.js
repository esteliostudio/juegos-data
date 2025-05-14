const URL_JSON = "https://raw.githubusercontent.com/esteliostudio/juegos-data/main/data.json";

fetch(URL_JSON)
  .then((response) => {
    if (!response.ok) {
      throw new Error("No se pudo cargar el archivo JSON desde GitHub.");
    }
    return response.json();
  })
  .then((data) => {
    const juegos = data.videojuegos;

    // Agrupar primero por estado
    const estados = {
      jugado: [],
      pendiente: [],
      comprar: [],
    };

    juegos.forEach((juego) => {
      if (estados[juego.estado]) {
        estados[juego.estado].push(juego);
      }
    });

    // Renderizar por estado > género > plataforma
    Object.keys(estados).forEach((estado) => {
      const contenedor = document.getElementById(`lista-${estado}`);
      const juegosEstado = estados[estado];

      // Agrupar por género
      const generos = [...new Set(juegosEstado.map(j => j.genero))];

      generos.forEach((genero) => {
        const seccionGenero = document.createElement("section");

        const tituloGenero = document.createElement("h3");
        tituloGenero.textContent = genero;
        seccionGenero.appendChild(tituloGenero);

        const juegosGenero = juegosEstado.filter(j => j.genero === genero);

        // Subcategorías: PC y Consola
        const juegosPC = juegosGenero.filter(j => j.plataforma.toLowerCase() === "pc");
        const juegosConsola = juegosGenero.filter(j => j.plataforma.toLowerCase() !== "pc");

        if (juegosPC.length > 0) {
          const subTituloPC = document.createElement("h4");
          subTituloPC.textContent = "PC";
          seccionGenero.appendChild(subTituloPC);

          const grupoPC = crearGrupoJuegos(juegosPC);
          seccionGenero.appendChild(grupoPC);
        }

        if (juegosConsola.length > 0) {
          const subTituloConsola = document.createElement("h4");
          subTituloConsola.textContent = "Consola";
          seccionGenero.appendChild(subTituloConsola);

          const grupoConsola = crearGrupoJuegos(juegosConsola);
          seccionGenero.appendChild(grupoConsola);
        }

        contenedor.appendChild(seccionGenero);
      });
    });

    // Actualizar las estadísticas del resumen
    document.getElementById("jugados").textContent = estados.jugado.length;
    document.getElementById("pendientes").textContent = estados.pendiente.length;
    document.getElementById("comprar").textContent = estados.comprar.length;
  })
  .catch(error => {
    console.error("Error al cargar los datos:", error);
  });

// Función para crear el grupo de cards
function crearGrupoJuegos(juegos) {
  const grupo = document.createElement("div");
  grupo.className = "grupo-genero";

  juegos.forEach((juego) => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="card-imagen">
        <img src="${juego.imagen}" alt="${juego.titulo}">
      </div>
      <div class="card-contenido">
        <div class="card-titulo">${juego.titulo}</div>
        <div class="card-plataforma">${juego.plataforma}</div>
      </div>
    `;
    grupo.appendChild(card);
  });

  return grupo;
}

// Exportar JSON (versión actual del repositorio)
document.getElementById("exportar").addEventListener("click", () => {
  fetch(URL_JSON)
    .then((res) => res.json())
    .then((data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "videojuegos_exportados.json";
      link.click();
    });
});


if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("✅ Service Worker registrado"))
      .catch((err) => console.error("❌ Error al registrar Service Worker:", err));
  });
}
