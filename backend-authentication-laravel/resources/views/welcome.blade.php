<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>{{ config('app.name') }} – JWT Auth Demo</title>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
        <style>
            :root { color-scheme: light dark; }
            body {
                font-family: 'Figtree', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                margin: 0;
                min-height: 100vh;
                background: radial-gradient(circle at top, #eef2ff, #f8fafc 55%);
                color: #0f172a;
            }
            .container {
                max-width: 960px;
                margin: 0 auto;
                padding: 3rem 1.5rem 4rem;
            }
            h1 {
                font-size: clamp(2rem, 3vw + 1rem, 3rem);
                text-align: center;
                margin-bottom: 1rem;
            }
            p.lead {
                text-align: center;
                margin-bottom: 3rem;
                color: #475569;
            }
            .grid {
                display: grid;
                gap: 1.5rem;
            }
            @media (min-width: 768px) {
                .grid {
                    grid-template-columns: repeat(2, minmax(0, 1fr));
                }
            }
            .card {
                background: rgba(255, 255, 255, 0.85);
                border-radius: 18px;
                padding: 1.75rem;
                box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
                backdrop-filter: blur(10px);
            }
            label {
                display: block;
                font-weight: 600;
                margin-bottom: 0.375rem;
            }
            input {
                width: 100%;
                padding: 0.65rem 0.75rem;
                border-radius: 12px;
                border: 1px solid #cbd5f5;
                font-size: 1rem;
                transition: border 0.2s, box-shadow 0.2s;
            }
            input:focus {
                outline: none;
                border-color: #6366f1;
                box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
            }
            button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.35rem;
                background: linear-gradient(135deg, #4f46e5, #6366f1);
                border: none;
                border-radius: 999px;
                padding: 0.6rem 1.2rem;
                color: #fff;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.18s ease, box-shadow 0.18s ease;
            }
            button:hover {
                transform: translateY(-1px);
                box-shadow: 0 10px 18px rgba(99, 102, 241, 0.24);
            }
            button.secondary {
                background: rgba(99, 102, 241, 0.12);
                color: #312e81;
            }
            .status {
                margin-top: 0.75rem;
                font-size: 0.95rem;
                color: #2563eb;
            }
            pre {
                background: #0f172a;
                color: #e2e8f0;
                padding: 1rem;
                border-radius: 16px;
                overflow-x: auto;
                margin-top: 1rem;
            }
            .token-chip {
                background: rgba(99, 102, 241, 0.12);
                border-radius: 999px;
                padding: 0.35rem 0.75rem;
                display: inline-flex;
                align-items: center;
                gap: 0.4rem;
                font-family: monospace;
                color: #312e81;
                margin-top: 0.5rem;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>JWT Authentication Demo</h1>
            <p class="lead">Preencha os formulários para registrar, entrar, renovar o token e consultar o usuário autenticado usando a API Laravel JWT.</p>

            <div class="grid">
                <section class="card">
                    <h2>Registro</h2>
                    <form id="registerForm">
                        <label for="regName">Nome</label>
                        <input id="regName" name="name" autocomplete="name" required>

                        <label for="regEmail">E-mail</label>
                        <input id="regEmail" name="email" autocomplete="email" required type="email">

                        <label for="regPassword">Senha</label>
                        <input id="regPassword" name="password" required type="password" minlength="8">

                        <label for="regPasswordConfirm">Confirme a senha</label>
                        <input id="regPasswordConfirm" name="password_confirmation" required type="password" minlength="8">

                        <button type="submit">Criar conta</button>
                        <div class="status" id="registerStatus"></div>
                    </form>
                </section>

                <section class="card">
                    <h2>Login</h2>
                    <form id="loginForm">
                        <label for="loginEmail">E-mail</label>
                        <input id="loginEmail" name="email" autocomplete="email" required type="email">

                        <label for="loginPassword">Senha</label>
                        <input id="loginPassword" name="password" required type="password">

                        <button type="submit">Entrar</button>
                        <div class="status" id="loginStatus"></div>
                    </form>

                    <div id="tokenWrapper" style="display:none;">
                        <div class="token-chip">
                            <span>Token ativo</span>
                            <span id="shortToken"></span>
                        </div>
                        <div style="margin-top:0.75rem; display:flex; gap:0.5rem; flex-wrap:wrap;">
                            <button type="button" class="secondary" id="refreshBtn">Renovar token</button>
                            <button type="button" class="secondary" id="logoutBtn">Sair</button>
                            <button type="button" class="secondary" id="profileBtn">Meu perfil</button>
                        </div>
                    </div>
                </section>
            </div>

            <section class="card" style="margin-top:1.5rem;">
                <h2>Resposta da API</h2>
                <pre id="apiOutput">Aguardando chamadas...</pre>
            </section>
        </div>

        <script>
            const apiOutput = document.getElementById('apiOutput');
            const registerStatus = document.getElementById('registerStatus');
            const loginStatus = document.getElementById('loginStatus');
            const tokenWrapper = document.getElementById('tokenWrapper');
            const shortToken = document.getElementById('shortToken');

            const API_BASE = '{{ url('/api') }}';

            function getToken() {
                return localStorage.getItem('jwt_token');
            }

            function setToken(token) {
                if (token) {
                    localStorage.setItem('jwt_token', token);
                    tokenWrapper.style.display = 'block';
                    shortToken.textContent = token.slice(0, 18) + '...';
                } else {
                    localStorage.removeItem('jwt_token');
                    tokenWrapper.style.display = 'none';
                    shortToken.textContent = '';
                }
            }

            async function callApi(path, options = {}) {
                const headers = options.headers || {};
                if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
                    headers['Content-Type'] = 'application/json';
                }
                const token = getToken();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                const response = await fetch(`${API_BASE}${path}`, {
                    ...options,
                    headers,
                });
                const text = await response.text();
                let data;
                try {
                    data = text ? JSON.parse(text) : {};
                } catch (error) {
                    data = { raw: text };
                }
                apiOutput.textContent = JSON.stringify({ status: response.status, body: data }, null, 2);
                if (!response.ok) {
                    throw data;
                }
                return data;
            }

            document.getElementById('registerForm').addEventListener('submit', async (event) => {
                event.preventDefault();
                registerStatus.textContent = 'Registrando...';
                const form = event.currentTarget;
                const payload = Object.fromEntries(new FormData(form).entries());
                try {
                    const data = await callApi('/auth/register', {
                        method: 'POST',
                        body: JSON.stringify(payload),
                    });
                    registerStatus.textContent = 'Conta criada com sucesso!';
                    setToken(data.access_token);
                } catch (error) {
                    registerStatus.textContent = 'Erro ao registrar. Veja os detalhes na resposta da API.';
                }
            });

            document.getElementById('loginForm').addEventListener('submit', async (event) => {
                event.preventDefault();
                loginStatus.textContent = 'Autenticando...';
                const form = event.currentTarget;
                const payload = Object.fromEntries(new FormData(form).entries());
                try {
                    const data = await callApi('/auth/login', {
                        method: 'POST',
                        body: JSON.stringify(payload),
                    });
                    loginStatus.textContent = 'Login efetuado!';
                    setToken(data.access_token);
                } catch (error) {
                    loginStatus.textContent = 'Credenciais inválidas.';
                }
            });

            document.getElementById('refreshBtn').addEventListener('click', async () => {
                try {
                    const data = await callApi('/auth/refresh', { method: 'POST' });
                    setToken(data.access_token);
                } catch (error) {
                    alert('Erro ao renovar token. Faça login novamente.');
                    setToken(null);
                }
            });

            document.getElementById('logoutBtn').addEventListener('click', async () => {
                try {
                    await callApi('/auth/logout', { method: 'POST' });
                } catch (error) {
                    // ignore error
                }
                setToken(null);
                loginStatus.textContent = 'Sessão encerrada.';
            });

            document.getElementById('profileBtn').addEventListener('click', async () => {
                try {
                    await callApi('/me');
                } catch (error) {
                    alert('Não foi possível carregar o perfil. Faça login novamente.');
                    setToken(null);
                }
            });

            // restore token on load
            if (getToken()) {
                setToken(getToken());
            }
        </script>
    </body>
</html>
