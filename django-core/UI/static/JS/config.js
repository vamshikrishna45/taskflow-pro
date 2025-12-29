const CONFIG = {
    API_BASE: window.location.origin + "/api",

    WS_BASE:
        (location.protocol === "https:" ? "wss://" : "ws://") +
        location.hostname +
        (location.port ? ":" + location.port : "")
};

// DEV OVERRIDE → FastAPI
if (
    location.hostname === "localhost" ||
    location.hostname === "127.0.0.1"
) {
    CONFIG.WS_BASE = "ws://127.0.0.1:8001";
}

const API_BASE = CONFIG.API_BASE;
const WS_BASE = CONFIG.WS_BASE;
