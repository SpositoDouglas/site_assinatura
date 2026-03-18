# Sistema de Assinador Digital Web

Este projeto é uma aplicação web completa (Frontend em HTML/JS + Backend em Node.js) para geração de chaves criptográficas, assinatura digital de textos utilizando RSA-SHA256 na Web Crypto API, e verificação pública de autenticidade.


## Como Rodar o Projeto

1. Clone este repositório para a sua máquina local.
2. Crie um banco de dados no **Supabase** (PostgreSQL) e execute o script SQL contido no arquivo `dump.sql` na raiz do projeto.
3. Na raiz do repositório, crie um arquivo `.env` com as suas credenciais do Supabase:
   ```
   SUPABASE_URL=sua_url_do_projeto
   SUPABASE_KEY=sua_chave_anon_ou_publishable
   ```
4. Suba a aplicação utilizando o Docker Compose:
   ```
   docker-compose up --build -d
   ```
5. Acesse o Frontend no navegador através do endereço: `http://localhost:8080`

---

## Fluxos da Aplicação

1. **Cadastro e Login:** O usuário insere um nome e senha. O backend gera um hash da senha e um par de chaves RSA (2048 bits). As chaves são armazenadas no banco e o usuário é logado via `localStorage`.
2. **Assinatura (Área Autenticada):** O usuário logado digita um texto. O Frontend utiliza a chave privada para calcular o Hash SHA-256 e assinar o texto localmente. A assinatura (em Base64) é enviada e salva no backend.
3. **Verificação (Área Pública):** Qualquer pessoa pode colar o ID (UUID) da assinatura. O backend busca a assinatura e a chave pública correspondente no banco, verifica a autenticidade criptográfica e retorna o status, os dados do signatário e o texto assinado.

---

## Endpoints da API e Exemplos

### 1. Criar Usuário (Cadastro)
* **Rota:** `POST /api/register`
* **Request:** ```
  { 
    "username": "Usuário",
    "password": "minhasenha123"
  }```
  
* **Response (200 OK):**
  ```
  { 
    "id": "uuid-do-usuario", 
    "privateKey": "-----BEGIN PRIVATE KEY-----...",
    "username": "Usuário"
  }
  ```

### 2. Login de Usuário
* **Rota:** `POST /api/login`
* **Request:** ```
  { 
    "username": "Usuário",
    "password": "minhasenha123"
  }```
* **Response (200 OK):** *(Retorna a chave privada para a sessão local)*
  ```
  { 
    "id": "uuid-do-usuario", 
    "privateKey": "-----BEGIN PRIVATE KEY-----...",
    "username": "Usuário"
  }
  ```

### 3. Salvar Assinatura
* **Rota:** `POST /api/sign`
* **Request:** ```
  { 
    "userId": "uuid-do-usuario", 
    "textContent": "Contrato de prestação de serviço", 
    "signatureBase64": "SGVsbG8gV29ybGQ..." 
  }```
  
* **Response (200 OK):**
  ```
  { "signatureId": "uuid-da-assinatura" }
  ```

### 4. Verificar Assinatura
* **Rota:** `GET /api/verify/:id`
* **Response (200 OK):**
  ```
  {
    "status": "VÁLIDA",
    "signatario": "Usuário",
    "algoritmo": "RSA-SHA256",
    "data": "2026-03-18T15:00:00.000Z",
    "textoOriginal": "Contrato de prestação de serviço"
  }
  ```

---

## Casos de Teste (Validação Positiva e Negativa)

Os testes criptográficos unitários garantem a segurança do algoritmo. Eles validam dois cenários exigidos:
1. **Validação Positiva:** Verifica se uma assinatura gerada com a chave privada correta e o texto inalterado retorna `true`.
2. **Validação Negativa:** Verifica se o sistema rejeita (`false`) uma assinatura caso o texto original sofra qualquer adulteração (Fraude).

Para rodar os testes localmente no terminal:
```bash
cd backend
npm install
npx jest
```
  
