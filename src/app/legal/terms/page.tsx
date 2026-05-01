import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos de Servicio — ALLINCHILE",
  description:
    "Términos y condiciones del servicio ALLINCHILE. Define el uso, los planes, las responsabilidades y la ley aplicable.",
};

const LAST_UPDATED = "30 de abril de 2026";

export default function TermsPage() {
  return (
    <>
      <h1>Términos de Servicio</h1>
      <p>
        <strong>Última actualización:</strong> {LAST_UPDATED}
      </p>
      <p>
        Bienvenida y bienvenido a ALLINCHILE. Al crear una cuenta o utilizar la
        plataforma, aceptas los términos descritos a continuación. Si no estás
        de acuerdo, por favor no uses el servicio.
      </p>

      <h2>1. Definiciones</h2>
      <ul>
        <li><strong>Plataforma / Servicio</strong>: la aplicación web ALLINCHILE y todas sus funcionalidades.</li>
        <li><strong>Cliente</strong>: la persona natural o jurídica que contrata un plan.</li>
        <li><strong>Usuario</strong>: cada persona que accede al servicio bajo la cuenta del Cliente.</li>
        <li><strong>Contacto final</strong>: cualquier persona cuyos datos el Cliente gestiona en la plataforma.</li>
      </ul>

      <h2>2. Aceptación y modificación</h2>
      <p>
        El uso del servicio implica la aceptación de estos términos. Podemos
        modificarlos en cualquier momento; los cambios materiales se notifican
        por correo electrónico con al menos 15 días de anticipación.
      </p>

      <h2>3. Cuenta y registro</h2>
      <p>
        El Cliente es responsable de mantener la confidencialidad de sus
        credenciales y de toda actividad realizada bajo su cuenta. Debe
        proporcionar información verídica y actualizada al registrarse.
      </p>

      <h2>4. Planes, precios y facturación</h2>
      <ul>
        <li>Los planes vigentes se publican en{" "}
          <a href="/pricing">/pricing</a>. Los precios están expresados en pesos
          chilenos (CLP) y no incluyen el IVA salvo indicación expresa.</li>
        <li>La facturación es mensual o anual según el plan elegido. Los pagos
          anuales tienen descuento equivalente a dos meses gratuitos.</li>
        <li>El Cliente puede cancelar en cualquier momento. La cancelación se
          hace efectiva al final del período facturado.</li>
        <li>El no pago de una factura habilita a ALLINCHILE a suspender el
          acceso al servicio tras un aviso previo de 7 días.</li>
        <li>Periodo de prueba: el plan Starter ofrece 14 días de prueba sin
          tarjeta. Al finalizar, la cuenta queda en pausa hasta que el Cliente
          elija un plan o solicite la baja.</li>
      </ul>

      <h2>5. Uso aceptable</h2>
      <p>El Cliente y sus Usuarios se comprometen a no utilizar el servicio para:</p>
      <ul>
        <li>Enviar mensajes no solicitados (spam) o vulnerar las políticas de los canales conectados (WhatsApp, Instagram, etc.).</li>
        <li>Almacenar contenido ilegal, difamatorio, discriminatorio o que infrinja derechos de terceros.</li>
        <li>Realizar ingeniería inversa, descompilación o intentos de eludir los controles de seguridad.</li>
        <li>Sobrecargar la infraestructura mediante actividades automatizadas no autorizadas.</li>
        <li>Suplantar la identidad de otra persona u organización.</li>
      </ul>

      <h2>6. Responsabilidades sobre los datos</h2>
      <p>
        El Cliente declara que cuenta con base legal y consentimiento válido
        para cargar y procesar los datos de sus Contactos finales en la
        plataforma. ALLINCHILE actúa como encargado del tratamiento y aplica
        las medidas descritas en la{" "}
        <a href="/legal/privacy">Política de Privacidad</a>.
      </p>

      <h2>7. Propiedad intelectual</h2>
      <p>
        El software, marca, logos y contenido de ALLINCHILE son propiedad de la
        empresa o sus licenciantes. El Cliente recibe una licencia limitada,
        revocable y no exclusiva para usar el servicio durante la vigencia del
        contrato.
      </p>
      <p>
        Los datos cargados por el Cliente siguen siendo de su propiedad. Al
        terminar la relación, el Cliente puede exportarlos en formato CSV o
        similar dentro de los 30 días posteriores a la terminación.
      </p>

      <h2>8. Disponibilidad y garantías</h2>
      <p>
        Hacemos esfuerzos razonables para mantener el servicio disponible 24/7
        con un objetivo de uptime del 99.5% mensual fuera de mantenimientos
        programados. El servicio se entrega &quot;tal cual&quot;, sin garantías
        implícitas de comerciabilidad o adecuación a un propósito específico
        más allá de lo establecido en el plan contratado.
      </p>

      <h2>9. Limitación de responsabilidad</h2>
      <p>
        En ningún caso la responsabilidad acumulada de ALLINCHILE excederá el
        monto efectivamente pagado por el Cliente en los 12 meses anteriores al
        evento que origine la responsabilidad. ALLINCHILE no responde por daños
        indirectos, lucro cesante, pérdida de oportunidad ni daños a terceros
        derivados del uso del servicio.
      </p>

      <h2>10. Servicios de IA</h2>
      <p>
        El Copiloto IA y otras funciones basadas en modelos de lenguaje son
        herramientas de asistencia. El Cliente entiende que las respuestas
        generadas pueden contener imprecisiones y debe revisarlas antes de
        enviarlas a sus Contactos. ALLINCHILE no se responsabiliza por
        decisiones tomadas exclusivamente sobre la base de salidas automáticas.
      </p>

      <h2>11. Suspensión y terminación</h2>
      <p>
        Podemos suspender o cerrar una cuenta en caso de:
      </p>
      <ul>
        <li>Incumplimiento grave de estos términos.</li>
        <li>Falta de pago no resuelto.</li>
        <li>Uso fraudulento o que ponga en riesgo a terceros.</li>
        <li>Requerimiento de autoridad competente.</li>
      </ul>

      <h2>12. Confidencialidad</h2>
      <p>
        Cada parte se obliga a mantener la confidencialidad de la información
        técnica, comercial y operacional de la otra a la que tenga acceso, por
        un plazo de 3 años posteriores al término de la relación.
      </p>

      <h2>13. Ley aplicable y jurisdicción</h2>
      <p>
        Estos términos se rigen por las leyes de la República de Chile.
        Cualquier controversia se someterá primero a un mecanismo de mediación.
        Si no se logra acuerdo, será resuelta por los Tribunales Ordinarios de
        Justicia de la ciudad de Santiago.
      </p>

      <h2>14. Contacto</h2>
      <p>
        Consultas sobre estos términos:{" "}
        <a href="mailto:legal@allinchile.cl">legal@allinchile.cl</a>.
      </p>
    </>
  );
}
