/**
 * Módulo de Segurança do Portal Além da Pele
 * Prevenção contra XSS, Injeções de Código, Spam e Bots
 */

/**
 * Sanitiza textos inseridos por usuários ou administradores.
 * Remove tags HTML, scripts inline, URLs de protocolo perigoso (javascript:) e limita tamanho.
 */
export function sanitizeText(input: string | null | undefined, maxLength: number = 500): string {
    if (!input) return "";

    return input
        .toString()
        .replace(/<[^>]*>?/gm, "") // Remove todas as tags HTML/XML
        .replace(/javascript:/gi, "") // Previne protocolo javascript:
        .replace(/on\w+=/gi, "") // Remove handlers de eventos como onload=, onerror=
        .trim()
        .slice(0, maxLength);
}

/**
 * Valida se um número de telefone brasileiro possui quantidade mínima aceitável de dígitos (10 a 11 dígitos).
 */
export function isValidPhone(phone: string): boolean {
    if (!phone) return false;
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length >= 10 && digitsOnly.length <= 13;
}

/**
 * Verifica se o campo de armadilha anti-bot (Honeypot) foi preenchido.
 * Bots automatizados tendem a preencher todos os campos visíveis ou invisíveis no DOM.
 */
export function isBotSubmission(honeypotValue: string): boolean {
    return Boolean(honeypotValue && honeypotValue.trim().length > 0);
}
