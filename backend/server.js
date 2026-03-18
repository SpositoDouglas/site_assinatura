const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(express.json());
app.use(cors());

const supabase = createClient(
  process.env.SUPABASE_URL || 'DUMMY_URL',
  process.env.SUPABASE_KEY || 'DUMMY_KEY'
);

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

// Cadastro
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const { data, error } = await supabase
    .from('users')
    .insert([{ 
        username, 
        password_hash: hashPassword(password),
        public_key: publicKey, 
        private_key: privateKey 
    }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') return res.status(400).json({ error: 'Este usuário já existe. Faça login.' });
    return res.status(400).json({ error: error.message });
  }
  
  res.json({ id: data.id, privateKey: privateKey, username: data.username }); 
});

// Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
  

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
  
    if (error || !data) return res.status(404).json({ error: 'Usuário não encontrado.' });
    

    if (data.password_hash !== hashPassword(password)) {
        return res.status(401).json({ error: 'Senha incorreta.' });
    }
    

    res.json({ id: data.id, privateKey: data.private_key, username: data.username }); 
});

// Salvar Assinatura
app.post('/api/sign', async (req, res) => {
  const { userId, textContent, signatureBase64 } = req.body;

  const { data, error } = await supabase
    .from('signatures')
    .insert([{ user_id: userId, text_content: textContent, signature_base64: signatureBase64 }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json({ signatureId: data.id });
});

// Verificação
app.get('/api/verify/:id', async (req, res) => {
  const { id } = req.params;

  const { data: sigData, error: sigError } = await supabase
    .from('signatures')
    .select('*, users(public_key, username)')
    .eq('id', id)
    .single();

  if (sigError || !sigData) return res.status(404).json({ error: 'Assinatura não encontrada' });

  const verify = crypto.createVerify('SHA256');
  verify.update(sigData.text_content);
  verify.end();
  
  const isValid = verify.verify(sigData.users.public_key, sigData.signature_base64, 'base64');
  await supabase.from('verification_logs').insert([{ signature_id: id, is_valid: isValid }]);

  res.json({
    status: isValid ? 'VÁLIDA' : 'INVÁLIDA',
    signatario: sigData.users.username,
    algoritmo: 'RSA-SHA256',
    data: sigData.created_at,
    textoOriginal: sigData.text_content
  });
});

// Listar Todos os Usuários e Chaves Públicas
app.get('/api/users', async (req, res) => {
  const { data, error } = await supabase
    .from('users')
    .select('id, username, public_key')
    .order('username', { ascending: true });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.listen(3000, () => console.log('Backend rodando na porta 3000'));