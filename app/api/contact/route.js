import { NextResponse } from "next/server";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export async function POST(request) {
  try {
    const formData = await request.formData();

    const name = String(formData.get("name") || "").trim();
    const company = String(formData.get("company") || "").trim();
    const phone = String(formData.get("phone") || "").trim();
    const email = String(formData.get("email") || "").trim();
    const message = String(formData.get("message") || "").trim();
    const consent = Boolean(formData.get("consent"));
    const file = formData.get("file");

    if (!name || !company || !phone || !email) {
      return NextResponse.json({ ok: false, error: "Заполните обязательные поля формы." }, { status: 400 });
    }

    if (!consent) {
      return NextResponse.json({ ok: false, error: "Нужно согласие на обработку персональных данных." }, { status: 400 });
    }

    const fileInfo =
      file && typeof file === "object" && "name" in file
        ? `${file.name || "без названия"} (${file.size || 0} bytes)`
        : "не приложен";

    const payload = {
      name,
      company,
      phone,
      email,
      message,
      file: fileInfo,
      createdAt: new Date().toISOString()
    };

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const CONTACT_FORM_TO_EMAIL = process.env.CONTACT_FORM_TO_EMAIL;
    const CONTACT_FORM_FROM_EMAIL = process.env.CONTACT_FORM_FROM_EMAIL;

    if (RESEND_API_KEY && CONTACT_FORM_TO_EMAIL && CONTACT_FORM_FROM_EMAIL) {
      const html = `
        <h2>Новая заявка с loadloud</h2>
        <p><b>Имя:</b> ${escapeHtml(name)}</p>
        <p><b>Компания:</b> ${escapeHtml(company)}</p>
        <p><b>Телефон:</b> ${escapeHtml(phone)}</p>
        <p><b>E-mail:</b> ${escapeHtml(email)}</p>
        <p><b>Описание задачи:</b><br/>${escapeHtml(message || "—")}</p>
        <p><b>Файл:</b> ${escapeHtml(fileInfo)}</p>
        <p><b>Отправлено:</b> ${escapeHtml(payload.createdAt)}</p>
      `;

      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: CONTACT_FORM_FROM_EMAIL,
          to: CONTACT_FORM_TO_EMAIL,
          subject: `Новая заявка от ${name}`,
          html
        })
      });

      if (!resendResponse.ok) {
        const details = await resendResponse.text();
        console.error("Contact form email send failed:", details);
        return NextResponse.json({ ok: false, error: "Не удалось отправить письмо. Попробуйте позже." }, { status: 502 });
      }

      return NextResponse.json({ ok: true, mode: "email" });
    }

    // Boilerplate stub: пока почта не настроена, сохраняем заявку в лог.
    console.info("CONTACT_FORM_STUB", payload);
    return NextResponse.json({ ok: true, mode: "stub" });
  } catch (error) {
    console.error("Contact form endpoint error:", error);
    return NextResponse.json({ ok: false, error: "Серверная ошибка. Попробуйте позже." }, { status: 500 });
  }
}
