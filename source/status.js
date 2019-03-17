const CONTINUE = 100;
const SWITCHING_PROTOCOLS = 101;
const OK = 200;
const CREATED = 201;
const ACCEPTED = 202;
const NON_AUTHORITATIVE_INFORMATION = 203;
const NO_CONTENT = 204;
const RESET_CONTENT = 205;
const PARTIAL_CONTENT = 206;
const MULTI_STATUS = 207;
const ALREADY_REPORTED = 208;
const IM_USED = 226;
const MULTIPLE_CHOICES = 300;
const MOVED_PERMANENTLY = 301;
const FOUND = 302;
const SEE_OTHER = 303;
const NOT_MODIFIED = 304;
const USE_PROXY = 305;
const SWITCH_PROXY = 306;
const TEMPORARY_REDIRECT = 307;
const PERMANENT_REDIRECT = 308;
const BAD_REQUEST = 400;
const UNAUTHORIZED = 401;
const PAYMENT_REQUIRED = 402;
const FORBIDDEN = 403;
const NOT_FOUND = 404;
const METHOD_NOT_ALLOWED = 405;
const NOT_ACCEPTABLE = 406;
const PROXY_AUTHENTICATION_REQUIRED = 407;
const REQUEST_TIMEOUT = 408;
const CONFLICT = 409;
const GONE = 410;
const LENGTH_REQUIRED = 411;
const PRECONDITION_FAILED = 412;
const REQUEST_ENTITY_TOO_LARGE = 413;
const REQUEST_URI_TOO_LONG = 414;
const UNSUPPORTED_MEDIA_TYPE = 415;
const REQUESTED_RANGE_NOT_SATISFIABLE = 416;
const EXPECTATION_FAILED = 417;
const IM_A_TEAPOT = 418;
const MISDIRECTED_REQUEST = 421;
const UNPROCESSABLE_ENTITY = 422;
const UPGRADE_REQUIRED = 426;
const PRECONDITION_REQUIRED = 428;
const LOCKED = 423;
const FAILED_DEPENDENCY = 424;
const TOO_MANY_REQUESTS = 429;
const REQUEST_HEADER_FIELDS_TOO_LARGE = 431;
const UNAVAILABLE_FOR_LEGAL_REASONS = 451;
const INTERNAL_SERVER_ERROR = 500;
const NOT_IMPLEMENTED = 501;
const BAD_GATEWAY = 502;
const SERVICE_UNAVAILABLE = 503;
const GATEWAY_TIMEOUT = 504;
const HTTP_VERSION_NOT_SUPPORTED = 505;
const VARIANT_ALSO_NEGOTIATES = 506;
const INSUFFICIENT_STORAGE = 507;
const LOOP_DETECTED = 508;
const NOT_EXTENDED = 510;
const NETWORK_AUTHENTICATION_REQUIRED = 511;

const STATUSES = {
    [CONTINUE]: "Continue",
    [SWITCHING_PROTOCOLS]: "Switching Protocols",
    [OK]: "OK",
    [CREATED]: "Created",
    [ACCEPTED]: "Accepted",
    [NON_AUTHORITATIVE_INFORMATION]: "Non-Authoritative Information",
    [NO_CONTENT]: "No Content",
    [RESET_CONTENT]: "Reset Content",
    [PARTIAL_CONTENT]: "Partial Content",
    [MULTI_STATUS]: "Multi Status",
    [ALREADY_REPORTED]: "Already Reported",
    [IM_USED]: "IM Used",
    [MULTIPLE_CHOICES]: "Multiple Choices",
    [MOVED_PERMANENTLY]: "Moved Permanently",
    [FOUND]: "Found",
    [SEE_OTHER]: "See Other",
    [NOT_MODIFIED]: "Not Modified",
    [USE_PROXY]: "Use Proxy",
    [SWITCH_PROXY]: "Switch Proxy",
    [TEMPORARY_REDIRECT]: "Temporary Redirect",
    [PERMANENT_REDIRECT]: "Permanent Redirect",
    [BAD_REQUEST]: "Bad Request",
    [UNAUTHORIZED]: "Unauthorized",
    [PAYMENT_REQUIRED]: "Payment Required",
    [FORBIDDEN]: "Forbidden",
    [NOT_FOUND]: "Not Found",
    [METHOD_NOT_ALLOWED]: "Method Not Allowed",
    [NOT_ACCEPTABLE]: "Not Acceptable",
    [PROXY_AUTHENTICATION_REQUIRED]: "Proxy Authentication Required",
    [REQUEST_TIMEOUT]: "Request Time-out",
    [CONFLICT]: "Conflict",
    [GONE]: "Gone",
    [LENGTH_REQUIRED]: "Length Required",
    [PRECONDITION_FAILED]: "Precondition Failed",
    [REQUEST_ENTITY_TOO_LARGE]: "Request Entity Too Large",
    [REQUEST_URI_TOO_LONG]: "Request-URI Too Large",
    [UNSUPPORTED_MEDIA_TYPE]: "Unsupported Media Type",
    [REQUESTED_RANGE_NOT_SATISFIABLE]: "Requested Range not Satisfiable",
    [EXPECTATION_FAILED]: "Expectation Failed",
    [IM_A_TEAPOT]: 'I"m a teapot',
    [MISDIRECTED_REQUEST]: "Misdirected Request",
    [UNPROCESSABLE_ENTITY]: "Unprocessable Entity",
    [UPGRADE_REQUIRED]: "Locked",
    [PRECONDITION_REQUIRED]: "Failed Dependency",
    [LOCKED]: "Upgrade Required",
    [FAILED_DEPENDENCY]: "Precondition Required",
    [TOO_MANY_REQUESTS]: "Too Many Requests",
    [REQUEST_HEADER_FIELDS_TOO_LARGE]: "Request Header Fields Too Large",
    [UNAVAILABLE_FOR_LEGAL_REASONS]: "Unavailable For Legal Reasons",
    [INTERNAL_SERVER_ERROR]: "Internal Server Error",
    [NOT_IMPLEMENTED]: "Not Implemented",
    [BAD_GATEWAY]: "Bad Gateway",
    [SERVICE_UNAVAILABLE]: "Service Unavailable",
    [GATEWAY_TIMEOUT]: "Gateway Time-out",
    [HTTP_VERSION_NOT_SUPPORTED]: "HTTP Version not Supported",
    [VARIANT_ALSO_NEGOTIATES]: "Variant Also Negotiates",
    [INSUFFICIENT_STORAGE]: "Insufficient Storage",
    [LOOP_DETECTED]: "Loop Detected",
    [NOT_EXTENDED]: "Not Extended",
    [NETWORK_AUTHENTICATION_REQUIRED]: "Network Authentication Required"
};

module.exports = {
    STATUSES
};
