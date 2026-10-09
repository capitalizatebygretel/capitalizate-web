const WA_NUM = "529981804486";
// URL de la implementación de Apps Script de Gretel (ver "Configurar solicitudes del sitio.md").
// Mientras esté vacía, la solicitud se envía por WhatsApp.
const SOLICITUDES_URL = "";
const waLink = txt => `https://wa.me/${WA_NUM}?text=${encodeURIComponent(txt)}`;
const track = (ev, params) => window.gtag && gtag("event", ev, params); // se activa al instalar GA4
const where = el => el.closest("section,header,footer")?.id || el.closest("section")?.className || "flotante";

document.querySelectorAll("[data-wa]").forEach(a => {
  a.href = waLink("Hola, me interesa una Consulta Empresarial con Capitalízate. Tengo una decisión importante que quisiera analizar.");
  a.target = "_blank"; a.rel = "noopener";
  a.addEventListener("click", () => track("clic_whatsapp", {ubicacion: where(a)}));
});
document.querySelectorAll("[data-agenda]").forEach(a =>
  a.addEventListener("click", () => track("clic_solicitar", {ubicacion: where(a)})));

const form = document.getElementById("contactForm");
if (form) form.addEventListener("submit", async e => {
  e.preventDefault();
  const val = id => form.querySelector(id).value.trim();
  const d = {
    nombre: val("#cf-nombre"), empresa: val("#cf-empresa"), whatsapp: val("#cf-tel"), correo: val("#cf-email"),
    giro: val("#cf-giro"), decision: val("#cf-decision"), claridad: val("#cf-claridad")
  };
  const note = document.getElementById("cf-note");
  if (form.querySelector('[name="_hp"]').value) return; // bots
  if (!d.nombre || !d.correo || !d.whatsapp || !d.decision || !form.querySelector("#cf-ok").checked){
    note.textContent = "Por favor complete nombre, teléfono, correo y lo que le gustaría analizar, y acepte el aviso de privacidad."; return;
  }
  if (!/^\S+@\S+\.\S+$/.test(d.correo)){ note.textContent = "Revise que el correo esté bien escrito."; return; }
  note.textContent = "";
  track("solicitud_enviada");

  const showDone = () => {
    document.getElementById("cf-done-name").textContent = d.nombre.split(" ")[0];
    form.hidden = true; document.getElementById("cf-done").hidden = false;
  };
  const btn = document.getElementById("cf-btn");
  const btnText = btn.textContent;
  if (SOLICITUDES_URL){
    btn.disabled = true; btn.textContent = "Enviando…";
    try {
      // Apps Script no devuelve CORS legible: se envía como texto en modo no-cors.
      await fetch(SOLICITUDES_URL, {method: "POST", mode: "no-cors", headers: {"Content-Type": "text/plain;charset=utf-8"},
        body: JSON.stringify({...d, fecha: new Date().toISOString(), pagina: location.href})});
      showDone();
    } catch (err) {
      note.textContent = "No pudimos enviar sus datos. Por favor intente de nuevo o escríbanos por WhatsApp.";
    } finally { btn.disabled = false; btn.textContent = btnText; }
    return;
  }
  // Sin conexión configurada: la solicitud se envía por WhatsApp
  const msg = [
    `Hola, soy ${d.nombre}${d.empresa ? " de " + d.empresa : ""}. Me interesa una Consulta Empresarial.`,
    d.giro && `A qué se dedica la empresa: ${d.giro}`,
    `Lo que me gustaría analizar: ${d.decision}`,
    d.claridad && `Lo que me gustaría tener más claro: ${d.claridad}`,
    `Teléfono: ${d.whatsapp} · Correo: ${d.correo}`
  ].filter(Boolean).join("\n\n");
  window.open(waLink(msg), "_blank", "noopener");
  showDone();
});

const burger = document.querySelector(".burger"), menu = document.getElementById("menu");
burger.addEventListener("click", () => { const o = menu.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
menu.addEventListener("click", e => { if (e.target.closest("a")) { menu.classList.remove("open"); burger.setAttribute("aria-expanded", false); } });
const header = document.querySelector("header");
addEventListener("scroll", () => header.classList.toggle("scrolled", scrollY > 8), {passive:true});
document.getElementById("y").textContent = new Date().getFullYear();
