/**
 * Sanitization Constants
 * 
 * Defines regex patterns and replacement rules for input sanitization.
 * Used by sanitize middleware and Joi helpers.
 */

// Regex for detecting common XSS vectors
const XSS_PATTERNS = {
    // <script> tags (both complete blocks and standalone opening tags)
    SCRIPT_TAGS: /<script\b[^>]*>([\s\S]*?)<\/script>|<script\b[^>]*>/gim,

    // onEvent handlers (onclick, onload, etc.) - handles quoted and unquoted values
    // e.g. onerror="alert(1)", onerror='alert(1)', onerror=alert(1)
    EVENT_HANDLERS: / on\w+=(\"[^\"]*\"|'[^']*'|[^ >]+)/gim,

    // javascript: protocol links
    JAVASCRIPT_PROTOCOL: /javascript:[^'"]*/gim,

    // SQL Injection patterns (basic)
    SQL_INJECTION: /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|TABLE)\b)|(--)|(\/\*)/gim,

    // Dangerous HTML tags (iframe, object, embed)
    DANGEROUS_TAGS: /<(iframe|object|embed|form)\b[^>]*>([\s\S]*?)<\/\1>|<(iframe|object|embed|form)\b[^>]*>/gim,
};

module.exports = {
    XSS_PATTERNS,
};
