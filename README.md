# Titan Leça — Painel de Coaches

App simples para gerir alunos, planos de treino e avaliações físicas.

## Publicar sem usar terminal (feito tudo pelo site do GitHub)

O teu repositório já existe: `Ricardoaalves114/Titan-Le-a-`. Falta só publicar os ficheiros certos (não o `.zip`) e ligar a publicação automática.

### 1. Apaga o ficheiro `titan-leca-site.zip` do repositório
No GitHub, abre o ficheiro `titan-leca-site.zip` → ícone do caixote do lixo → **Delete file** → **Commit changes**.

### 2. Envia os ficheiros de dentro da pasta (não o zip)
No teu telemóvel/computador, extrai (descomprime) o `titan-leca-site.zip` — deve ficar uma pasta com estes ficheiros lá dentro:

```
index.html
package.json
vite.config.js
README.md
.gitignore
src/App.jsx
src/main.jsx
src/storage.js
.github/workflows/deploy.yml
```

No repositório no GitHub: **Add file → Upload files**. Arrasta para lá o **conteúdo** da pasta (todos os ficheiros e a pasta `src`, e a pasta `.github`) — não arrastes o `.zip`. Se o teu browser não permitir arrastar pastas inteiras, envia primeiro os ficheiros da raiz, depois entra na subpasta `src` (cria-a escrevendo `src/App.jsx` no nome ao enviar um ficheiro) e envia os 3 ficheiros lá para dentro, e repete para `.github/workflows/deploy.yml`.

Confirma o commit ("Commit changes") depois de cada envio.

### 3. Ativar o GitHub Pages com publicação automática
No repositório: **Settings → Pages**. Em "Build and deployment" → **Source**, escolhe **GitHub Actions** (não "Deploy from a branch").

### 4. Aguarda a publicação
Vai ao separador **Actions** do repositório — deve aparecer uma execução chamada "Deploy to GitHub Pages" a correr (ícone amarelo) e depois a ficar verde (concluído), demora 1–2 minutos. Isto acontece sempre que envias alterações novas — não precisas de repetir mais nada manualmente.

Quando terminar, o site fica disponível em:

```
https://ricardoaalves114.github.io/Titan-Le-a-/
```

## Nota importante sobre os dados

Esta versão guarda os dados (alunos, planos, avaliações) no **armazenamento local do browser** (localStorage) de cada aparelho. Isto significa:

- Os dados **não são partilhados automaticamente** entre coaches diferentes, nem entre o teu telemóvel e o teu computador.
- Se limpares os dados do browser (ou usares modo privado/incógnito), os dados desaparecem.
- Cada coach que abrir o link tem a sua própria cópia local.

Se quiseres que todos os coaches vejam os mesmos dados em tempo real (ex: um aluno registado por um coach aparece logo para os outros), é preciso ligar a app a uma base de dados na nuvem — por exemplo o [Firebase](https://firebase.google.com) (tem um plano gratuito suficiente para isto). Isso é um passo extra que fica fora desta versão inicial, mas é possível adicionar depois.
