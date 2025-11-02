// Inicializar EmailJS con tu clave pública
emailjs.init("pLIcCdm9hfPyi0UXP"); // 👈 Reemplaza con tu Public Key

document.getElementById("contactForm").addEventListener("submit", function (e) {
  e.preventDefault();

  emailjs.sendForm("service_r2jxf8j", "template_ihcflus", this).then(
    () => {
      alert("✅ Mensaje enviado correctamente. ¡Gracias por contactarnos!");
      this.reset();
    },
    (error) => {
      alert("❌ Error al enviar el mensaje: " + JSON.stringify(error));
    }
  );
});
