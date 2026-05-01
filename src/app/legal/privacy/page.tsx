import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad — ALLINCHILE",
  description:
    "Cómo ALLINCHILE recopila, usa y protege los datos personales de clientes y usuarios finales. Cumplimiento Ley 21.719 de Chile.",
};

const LAST_UPDATED = "30 de abril de 2026";

export default function PrivacyPage() {
  return (
    <>
      <h1>Política de Privacidad</h1>
      <p>
        <strong>Última actualización:</strong> {LAST_UPDATED}
      </p>

      <p>
        Esta Política de Privacidad describe cómo ALLINCHILE (en adelante,
        &quot;nosotros&quot;, &quot;la plataforma&quot; o &quot;el servicio&quot;)
        recopila, utiliza y protege los datos personales de las personas que
        acceden a la plataforma, así como de los contactos que nuestros clientes
        gestionan a través de ella. Este documento se rige por la legislación
        chilena aplicable, incluyendo la Ley N.º 19.628 sobre Protección de la
        Vida Privada y la Ley N.º 21.719 sobre Protección de Datos Personales.
      </p>

      <h2>1. Identificación del responsable</h2>
      <p>
        El responsable del tratamiento de los datos personales es{" "}
        <strong>ALLINCHILE</strong>, con domicilio en Chile. Para cualquier
        consulta relativa a esta política puedes contactarnos al correo{" "}
        <a href="mailto:privacidad@allinchile.cl">privacidad@allinchile.cl</a>.
      </p>

      <h2>2. Datos personales que recopilamos</h2>
      <p>Distinguimos dos categorías:</p>

      <h3>2.1 Datos de usuarios de la plataforma</h3>
      <ul>
        <li>Nombre completo, correo electrónico, contraseña (cifrada).</li>
        <li>Información del perfil profesional: cargo, organización, teléfono.</li>
        <li>Datos de uso del servicio: páginas vistas, acciones realizadas, fechas y horas de acceso, dirección IP, tipo de navegador y dispositivo.</li>
        <li>Datos de facturación cuando aplique: nombre o razón social, RUT, domicilio fiscal, medio de pago (procesado por proveedores externos certificados).</li>
      </ul>

      <h3>2.2 Datos de contactos finales gestionados por nuestros clientes</h3>
      <p>
        Cuando una empresa cliente utiliza ALLINCHILE para gestionar su CRM,
        atención y ventas, dicha empresa carga datos de sus propios contactos
        (clientes finales, prospectos). En estos casos, <strong>la empresa
        cliente es el responsable del tratamiento</strong> y ALLINCHILE actúa
        como <strong>encargado del tratamiento</strong>. Estos datos pueden
        incluir nombres, correos, teléfonos, identificadores de redes sociales,
        historial de conversaciones y notas internas que la empresa registre.
      </p>

      <h2>3. Finalidades del tratamiento</h2>
      <ul>
        <li>Permitir el funcionamiento de la cuenta y los módulos contratados.</li>
        <li>Autenticación, control de acceso y prevención de fraude.</li>
        <li>Comunicaciones operativas (verificación de cuenta, notificaciones de servicio).</li>
        <li>Mejorar la plataforma a partir de datos agregados y anonimizados.</li>
        <li>Cumplir obligaciones legales, contables y tributarias.</li>
        <li>Atención al cliente y soporte.</li>
      </ul>

      <h2>4. Base legal del tratamiento</h2>
      <p>
        Tratamos los datos personales sobre alguna de las siguientes bases:
      </p>
      <ul>
        <li><strong>Consentimiento</strong> del titular cuando es requerido (por ejemplo, para envío de comunicaciones comerciales).</li>
        <li><strong>Ejecución de un contrato</strong> con el cliente que contrata el servicio.</li>
        <li><strong>Interés legítimo</strong> en mantener la seguridad, prevenir fraude y mejorar el servicio.</li>
        <li><strong>Cumplimiento de obligaciones legales</strong>.</li>
      </ul>

      <h2>5. Subprocesadores y terceros</h2>
      <p>
        Para prestar el servicio, ALLINCHILE comparte datos con proveedores que
        actúan como encargados del tratamiento bajo nuestra supervisión:
      </p>
      <ul>
        <li><strong>Supabase</strong> (Estados Unidos) — base de datos y autenticación.</li>
        <li><strong>Vercel</strong> (Estados Unidos) — hosting y entrega de la aplicación.</li>
        <li><strong>Anthropic</strong> (Estados Unidos) — modelo de IA Claude para asistir redacción y respuestas.</li>
        <li><strong>Resend</strong> (Estados Unidos) — envío de correos transaccionales.</li>
        <li><strong>Sentry</strong> (Estados Unidos) — registro de errores técnicos.</li>
        <li><strong>PostHog</strong> (Estados Unidos / Unión Europea) — analítica de uso del producto.</li>
        <li><strong>Pasarelas de pago</strong> (Transbank, Mercado Pago, Flow u otras) cuando se contraten planes pagos.</li>
        <li><strong>Proveedores de WhatsApp Business API</strong> (Meta y BSP designado) cuando el cliente activa el canal.</li>
      </ul>
      <p>
        Todos los subprocesadores están obligados contractualmente a proteger
        los datos con el mismo estándar que esta política.
      </p>

      <h2>6. Transferencias internacionales</h2>
      <p>
        Algunos de nuestros subprocesadores almacenan datos fuera de Chile,
        principalmente en Estados Unidos. Estas transferencias se realizan bajo
        cláusulas contractuales adecuadas y mecanismos de seguridad equivalentes
        a los exigidos por la legislación chilena.
      </p>

      <h2>7. Conservación de los datos</h2>
      <p>
        Conservamos los datos durante el tiempo necesario para cumplir las
        finalidades descritas y los plazos legales aplicables (por ejemplo, 6
        años para registros contables). Una vez vencidos los plazos, los datos
        se eliminan o anonimizan de forma segura.
      </p>

      <h2>8. Derechos del titular</h2>
      <p>
        Toda persona puede ejercer ante ALLINCHILE los siguientes derechos sobre
        sus datos personales:
      </p>
      <ul>
        <li><strong>Acceso</strong>: conocer qué datos tenemos sobre ti.</li>
        <li><strong>Rectificación</strong>: corregir datos inexactos o incompletos.</li>
        <li><strong>Cancelación o supresión</strong>: solicitar el borrado de tus datos.</li>
        <li><strong>Oposición</strong>: oponerte a tratamientos específicos.</li>
        <li><strong>Portabilidad</strong>: recibir tus datos en formato estructurado.</li>
        <li><strong>Limitación</strong>: pedir que dejemos de usar ciertos datos sin borrarlos.</li>
        <li><strong>Revocación del consentimiento</strong> en cualquier momento, sin afectar la licitud del tratamiento previo.</li>
      </ul>
      <p>
        Para ejercerlos, escribe a{" "}
        <a href="mailto:privacidad@allinchile.cl">privacidad@allinchile.cl</a>{" "}
        identificándote y especificando el derecho que deseas ejercer.
        Responderemos en un plazo máximo de 30 días hábiles.
      </p>

      <h2>9. Decisiones automatizadas e inteligencia artificial</h2>
      <p>
        Utilizamos modelos de IA de Anthropic (Claude) para asistir tareas de
        redacción, clasificación y respuesta. Las salidas del modelo siempre
        pueden ser revisadas, modificadas o descartadas por un usuario humano
        antes de enviarse al destinatario final. No tomamos decisiones que
        produzcan efectos jurídicos exclusivamente sobre la base de tratamientos
        automatizados.
      </p>
      <p>
        El historial de interacciones con la IA se conserva en logs internos
        para auditoría, control de calidad y cumplimiento. Estos logs no se
        utilizan para entrenar modelos de terceros.
      </p>

      <h2>10. Seguridad</h2>
      <p>
        Aplicamos medidas técnicas y organizativas razonables: cifrado en
        tránsito (HTTPS), aislamiento por organización mediante Row Level
        Security en la base de datos, control de acceso por roles, auditoría de
        cambios y respaldos periódicos.
      </p>

      <h2>11. Comunicaciones comerciales y opt-out</h2>
      <p>
        Cuando una empresa cliente utiliza la plataforma para enviar mensajes a
        sus contactos, dichos mensajes deben contar con el consentimiento previo
        del destinatario o con base legal válida. ALLINCHILE provee mecanismos
        de opt-out (darse de baja) en cada mensaje saliente y registra el
        historial de consentimiento de cada contacto.
      </p>

      <h2>12. Menores de edad</h2>
      <p>
        El servicio está dirigido a empresas y profesionales mayores de edad.
        No recopilamos intencionalmente datos de menores de 14 años.
      </p>

      <h2>13. Cambios a esta política</h2>
      <p>
        Podemos actualizar esta política. Cuando los cambios sean materiales,
        notificaremos por correo electrónico a los usuarios registrados con al
        menos 15 días de anticipación.
      </p>

      <h2>14. Contacto</h2>
      <p>
        Para cualquier consulta, ejercicio de derechos o reclamo, escríbenos a{" "}
        <a href="mailto:privacidad@allinchile.cl">privacidad@allinchile.cl</a>.
      </p>
    </>
  );
}
