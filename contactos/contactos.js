// Inicializar EmailJS con tu clave pública
emailjs.init("IRuxq3V5XOuVW4Z0j"); // 👈 Reemplaza con tu Public Key

document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  emailjs.sendForm("service_j1czmcd", "template_mm9qgv4", this).then(
    () => {
      alert("Mensaje enviado correctamente. ¡Gracias por contactarnos!");
      this.reset();
    },
    (error) => {
      alert("❌ Error al enviar el mensaje: " + JSON.stringify(error));
    }
  );
});
