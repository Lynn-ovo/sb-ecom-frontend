import axios from "axios";

const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACK_END_URL}/api`,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const auth = JSON.parse(localStorage.getItem("auth"));

    let token = auth?.jwtToken;

    if (token?.startsWith("springBootEcom=")) {
        token = token.split(";")[0].replace("springBootEcom=", "");
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;