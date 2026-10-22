// Gestión segura de la API Key en el navegador
function obtenerApiKey() {
  let key = localStorage.getItem("GEMINI_API_KEY");
  if (!key) {
    key = prompt("Por favor, ingresa tu API Key de Gemini:");
    if (key) {
      localStorage.setItem("GEMINI_API_KEY", key.trim());
    }
  }
  return key;
}

function configurarApiKey() {
  const nuevaKey = prompt("Ingresa tu nueva API Key de Gemini:");
  if (nuevaKey) {
    localStorage.setItem("GEMINI_API_KEY", nuevaKey.trim());
    alert("API Key actualizada correctamente.");
  }
}

async function enviarConsulta() {
  const apiKey = obtenerApiKey();
  if (!apiKey) {
    alert("Necesitas ingresar una API Key válida para continuar.");
    return;
  }

  const inputElement = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const mensajeUsuario = inputElement.value.trim();

  if (!mensajeUsuario) return;

  // Agregar mensaje del usuario en pantalla
  chatBox.innerHTML += `<div class="msg user"><strong>Nicolas:</strong> ${mensajeUsuario}</div>`;
  inputElement.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [{
          parts: [{ text: mensajeUsuario }]
        }]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message || "Error en la consulta");
    }

    const respuestaIA = data.candidates[0].content.parts[0].text;
    const respuestaFormateada = typeof marked !== "undefined" ? marked.parse(respuestaIA) : respuestaIA;

    // Agregar respuesta del Agente
    chatBox.innerHTML += `<div class="msg agent"><strong>Agente:</strong><br>${respuestaFormateada}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (error) {
    chatBox.innerHTML += `<div class="msg error"><strong>Error:</strong> ${error.message}. Revisa tu API Key.</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;
  }
}

function exportarHTML() {
  const contenidoChat = document.getElementById("chat-box").innerHTML;
  const contenidoCompleto = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Informe Estratégico - Nicolas</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 30px; line-height: 1.6; background: #fff; color: #333; }
        .msg { margin-bottom: 20px; padding: 15px; border-radius: 5px; }
        .user { background: #e0f2fe; border-left: 4px solid #0284c7; }
        .agent { background: #f8fafc; border-left: 4px solid #334155; }
      </style>
    </head>
    <body>
      <h1>Informe Estratégico Semanal - Nicolas</h1>
      <hr><br>
      ${contenidoChat}
    </body>
    </html>
  `;

  const blob = new Blob([contenidoCompleto], { type: "text/html" });
  const enlace = document.createElement("a");
  enlace.href = URL.createObjectURL(blob);
  enlace.download = `informe_estrategico_${new Date().toISOString().slice(0,10)}.html`;
  enlace.click();
}