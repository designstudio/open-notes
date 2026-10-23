# Autorização e sincronização do Dropbox

O Dropbox pode sincronizar o espaço completo (notas, documentos formatados,
coleções, pastas e perfil) com App Key pessoal. Vincular autoriza a conta;
**Ativar sincronização** inicia a comparação e pausa o sincronizador do Google
Drive. Os dois vínculos podem existir, mas somente um provedor sincroniza por
vez. Ativar novamente o Drive pausa o Dropbox sem revogar seu vínculo.

Decisão arquitetural: o processo Node **local**, já usado para guardar os tokens,
transporta o conteúdo do snapshot entre o navegador e o Dropbox. Não persiste as
notas no disco do servidor, não recebe URLs/caminhos arbitrários nem envia dados
a servidores do projeto. O IndexedDB continua sendo o armazenamento principal;
nenhuma migração de dados ou alteração do esquema foi introduzida.

## Requisitos e inicialização

- Windows com Windows PowerShell 5.1 e Gerenciador de Credenciais disponíveis.
- Node.js compatível com o projeto e dependências já instaladas.
- Iniciar com `npm run dev` ou `iniciar-open-notes.bat`.
- Para usar o build: `npm run build`, encerrar o servidor de desenvolvimento e
  executar `npm run preview -- --port 5173` se a origem usada era a porta 5173.

O componente local executa no processo Node do Vite, por um plugin próprio em
`local/`, tanto em desenvolvimento quanto em preview. Não há servidor remoto,
conta administrada pelo projeto, daemon de sistema ou instalador adicional.
Abrir somente `dist/` em outra hospedagem não fornece a API local: a integração
fica indisponível. O runtime local acompanha o código e as dependências do
projeto. O servidor não deve ser exposto na rede.

Mantenha o mesmo host, porta e perfil do navegador para acessar o IndexedDB
existente. A porta não muda automaticamente quando está ocupada. A credencial
Windows é separada por porta: mudar a porta requer novo vínculo. Não há migração
de dados locais. O próximo início restaura a autorização e, se o Dropbox foi
ativado e com horário vencido, compara as cópias automaticamente. Fechar o navegador
não revoga o acesso, mas não executa sincronização de notas em segundo plano.
**Sincronização automática** permite escolher **1 hora, 3 horas, 6 horas, 12 horas
ou 24 horas** (padrão de 1 hora). O intervalo controla envio e recebimento; editar não inicia transferência.
O salvamento local continua imediato. Web Locks é necessário
para o Dropbox; o recurso bloqueia operações simultâneas de abas da mesma origem.

A primeira ativação compara as cópias imediatamente. Depois disso, a próxima
execução parte da última sincronização concluída; uma tentativa que falhar
aguarda o intervalo antes de tentar automaticamente de novo. **Sincronizar agora**
antecipa envio e recebimento, e o sucesso reinicia a contagem. A interface mostra
o último horário concluído e a próxima execução prevista. A periodicidade e os
horários persistem no navegador, sem incluir credenciais ou conteúdo de notas.
O horário da tentativa, a revisão, o hash e a data da última sincronização ficam
no store `workspace` existente do IndexedDB. A leitura mantém compatibilidade com
metadados antigos do localStorage, sem apagar ou regravar os dados anteriores.
Isso evita que a cota específica do localStorage interrompa a sincronização.
O provedor escolhido e a preferência de intervalo continuam no localStorage.

Reabrir, voltar à janela ou recuperar a internet só inicia uma execução se o
horário já venceu. Se o aplicativo ficou fechado por vários intervalos, faz uma
única comparação ao reabrir. Abas da mesma origem compartilham a preferência e
o controle do horário para evitar execuções duplicadas. Conflitos pausam o
agendamento até a escolha da pessoa usuária. Edições feitas durante um envio
ficam locais até o próximo horário ou a próxima sincronização manual.
BroadcastChannel notifica as outras abas sobre metadados atualizados; Web Locks
continua serializando as operações e relendo o horário persistido antes da rede.
Se uma tentativa falhar, o próximo horário é identificado como **Próxima tentativa
prevista**. Falhas ao ler o controle ou registrar a tentativa no IndexedDB
interrompem a operação antes do download, sem descartar notas ou credenciais.

## Configurar uma App Key pessoal

1. Na [Dropbox App Console](https://www.dropbox.com/developers/apps), criar seu
   próprio aplicativo com **Scoped access** e **App folder**.
2. Em Permissions, habilitar `files.metadata.read`, `files.content.read` e
   `files.content.write` e salvar. Não é necessário App Secret.
3. Abrir Preferências → Integrações no Open Notes e selecionar “Vincular” na
   linha do Dropbox para abrir suas opções.
4. Copiar o endereço de redirecionamento mostrado no formulário Dropbox e
   registrá-lo exatamente em OAuth 2 → Redirect URIs na App Console. Host, porta
   e caminho devem corresponder. O caminho é `/api/dropbox/callback`.
5. Copiar **App key**, informar em **APP Key** e selecionar
   **Conectar**. Não informar App secret ou tokens. Permitir o popup e
   autorizar a conta no navegador. Voltar ao Open Notes após a confirmação.
6. Selecionar **Ativar sincronização**. Se houver espaços diferentes, escolher
   explicitamente qual cópia usar. O app preserva as duas versões antes de
   substituir. Conferir **Última sincronização**, **Sincronizar agora** e a cópia
   `open-notes-snapshot.json` na pasta do aplicativo em Apps/Aplicativos do Dropbox.

Vínculos da etapa anterior, com apenas metadados, **não ganham novas permissões
automaticamente**. Primeiro habilitar os novos scopes na App Console; depois
desvincular e conectar novamente no Open Notes. A interface mantém a sincronização
desabilitada até existir uma autorização que confirme esses scopes.

O aviso aparece em **Sincronização do seu espaço**, com badges das permissões
e link para a App Console. Habilitar um scope na console não comprova que o
vínculo existente já o recebeu. Registros antigos sem scopes ficam bloqueados;
se uma renovação retornar os scopes já concedidos, eles são atualizados no cofre
e o aviso desaparece. **Verificar permissões** força essa renovação imediatamente,
mesmo com um access token válido, sem revogar o vínculo nem acessar arquivos.
A ausência de scopes na resposta não concede permissões; se o aviso persistir,
desvincular e conectar novamente solicita um novo consentimento.

O projeto não inclui chave padrão ou compartilhada. A chave informada fica no
mesmo registro protegido da credencial; não é escrita no repositório ou no
armazenamento web. O aplicativo pessoal pode permanecer em modo de
desenvolvimento para o próprio titular; compartilhar sua App Key com outras
pessoas está sujeito às regras e limites de produção do Dropbox.

## Credenciais e segurança local

`local/windows-credential-vault.ps1` usa CredReadW/CredWriteW/CredDeleteW, APIs
nativas do Gerenciador de Credenciais do Windows. A credencial genérica pertence
ao usuário do sistema e persiste entre logons; não é um arquivo com token ou
chave criptográfica ao lado. Não há biblioteca npm nativa ou instalador novo.
O PowerShell recebe valores por stdin e devolve resultados por pipe privado:
segredos não aparecem em argumentos de processo, logs ou mensagens de erro.

O limite nativo de blob é 2560 bytes. Se a credencial exceder esse limite, o
PowerShell estiver bloqueado ou o cofre falhar, a conexão não é apresentada como
concluída. Não existe fallback para localStorage, sessionStorage, IndexedDB,
arquivos de texto ou variáveis de ambiente. macOS/Linux ficam indisponíveis até
existir um adaptador para seus cofres. Um cofre não protege contra malware com
os privilégios do mesmo usuário, nem contra uma versão adulterada do aplicativo.

O refresh token e o access token nunca são enviados ao React. O access token
fica em memória no processo local; o refresh token fica no cofre. O OAuth usa
PKCE S256, state aleatório vinculado à sessão, expiração de cinco minutos e
callback de uso único. Não usa App Secret. A renovação usa App Key e refresh
token, antes da expiração. Falhas transitórias têm espera para nova tentativa;
`invalid_grant` exige novo vínculo.

O registro do cofre também guarda os scopes concedidos e um identificador
aleatório da conexão. No navegador, persistem somente o provedor escolhido,
revisão, hash SHA-256 da última cópia e data da sincronização; nunca os tokens.
O identificador separa o histórico de contas/autorizações diferentes.

As rotas locais validam endereço remoto loopback, Host/porta, Origin, Fetch
Metadata, Content-Type e cabeçalho próprio. Operações de controle exigem cookie
HttpOnly/SameSite=Strict e token CSRF em memória. O bootstrap também exige origem
exata e cabeçalho próprio, sem habilitar CORS. O callback usa state, pois recebe
uma navegação do Dropbox. Respostas não são armazenadas em cache; o resultado
OAuth é redirecionado para uma página sem códigos ou tokens e com CSP restrita.
O cookie usa HTTP de loopback, sem Secure; não deve ser usado fora da máquina.
Clientes locais capazes de forjar todos os cabeçalhos estão fora dessa barreira
de origem; o cofre continua sujeito às permissões do usuário do sistema.

As rotas POST `download` e `upload` usam as mesmas proteções de origem, cookie e
CSRF. O adaptador só acessa `/open-notes-snapshot.json`, relativo à App Folder
configurada no aplicativo pessoal. O projeto não pode alterar a configuração
App Folder/Full Dropbox da App Console do usuário; configure **App folder**.
Nenhum cliente fornece tokens, caminho Dropbox ou destino de rede a essas rotas.

## Snapshots, conflitos e backups

O snapshot usa o mesmo envelope do Drive (`schemaVersion: 1`, `updatedAt`, `data`)
sem converter os dados. Novos arquivos usam `mode: add`; atualizações usam
`mode: update` com a revisão lida, `strict_conflict: true` e `autorename: false`.
Uma gravação concorrente não vira overwrite nem cria um segundo arquivo.

Na primeira ativação, espaços pessoais diferentes exigem escolha. Exemplos
intactos não são enviados. Depois de uma sincronização confirmada, revisão e
hash permitem distinguir edições locais, remotas e simultâneas. Cada aba conserva
sua própria base em memória para não tratar a gravação de outra aba como sua.
Após um conflito de gravação, relê a cópia e espera uma escolha explícita.
Confirmar uma escolha também relê a revisão antes de substituir qualquer lado.

Backups continuam no object store `workspace` existente do IndexedDB. Importações,
primeira ativação e escolhas de conflito preservam cópias independentes. Envios
de rotina atualizam `open-notes-dropbox-last-upload-recovery`, sem crescimento
ilimitado a cada tecla. O botão **Exportar**, no card **Cópias de segurança**,
inclui os backups dos dois provedores e os backups antigos em um arquivo JSON.
Se preservar a cópia falhar, nada é substituído.

Limite inicial: 20 MiB por snapshot, incluindo imagens embutidas. Arquivos maiores
ou inválidos interrompem a sincronização, mantendo os dados locais. A exclusão
externa do snapshot após sincronizar exige restaurá-lo no Dropbox; o app não
recria silenciosamente uma cópia que pode ter sido excluída intencionalmente.
O horário exibido só muda após leitura/comparação ou gravação bem-sucedida.

## Desvinculação e falhas

“Desvincular” interrompe a autorização pendente e a renovação. Antes de
revogar, grava no cofre uma intenção de revogação. Chama `auth/token/revoke` com
access token válido, renovando-o se necessário. Após confirmação, remove os
tokens do registro e mantém somente a App Key pessoal.

Se a rede falhar, a revogação permanece pendente no cofre e é retomada; mesmo
após reiniciar o processo, a autorização não volta a ser usada normalmente. Uma
credencial que já não pode ser renovada por `invalid_grant` é considerada
inutilizável. Falha ao persistir o vínculo após consentimento provoca tentativa
de revogação imediata; se também falhar, a interface orienta remover o acesso
diretamente nas integrações da conta Dropbox. Não se promete revogação remota
sem confirmação. Nenhuma operação apaga notas, backups ou arquivos do Dropbox.

Se o cofre não permitir nem registrar a intenção de revogação, não é possível
garantir sua retomada após encerrar o processo. A interface informa essa falha e
orienta remover o acesso diretamente no Dropbox; não apresenta a desvinculação
como concluída. Não é criado um armazenamento alternativo de credenciais.

## Validação

`npm test` inclui OAuth, renovação, relógio e rede simulados, restauração após
reinício, recusa/expiração de callback, revogação pendente e bloqueios HTTP de
origem/sessão/CSRF. No Windows, um teste usa uma credencial sintética isolada no
cofre e a remove ao concluir, sem acessar contas Dropbox. `npm run build` valida
tipos e o bundle. Os testes não exigem App Key ou conta reais.

Para validar o fluxo completo no navegador com OAuth simulado, executar
`npm run test:dropbox:browser` após o build. Esse teste usa perfil descartável,
cofre em memória e intercepta a autorização, sem acessar o Dropbox real.

Os testes de sincronização usam arquivos, revisões e OAuth simulados: envio,
importação, edição offline, restauração, conflitos, quota, falta de permissões,
falha de backup, revogação, limites de tamanho e alternância entre provedores.
O teste de navegador valida ativação explícita, envio automático de uma nota,
última/próxima sincronização, periodicidade persistente e restauração de
perfil/IndexedDB após reiniciar o navegador. Relógios simulados verificam os cinco
intervalos, retorno após atraso, falhas e coordenação entre abas sem esperar horas.
Nenhum teste acessa uma conta Dropbox real. Não há benchmarks nesta etapa.

Referências: [OAuth e PKCE](https://docs.dropboxapi.com/dropbox-api/docs/get-started/authorization),
[upload e escopo de escrita](https://docs.dropboxapi.com/dropbox-api/api-reference/user-endpoints/files/upload),
[download e escopo de leitura](https://docs.dropboxapi.com/dropbox-api/api-reference/user-endpoints/files/download),
[novos scopes exigem nova autorização](https://dropbox.tech/developers/customizing-scopes-in-oauth-flow),
[revogação](https://docs.dropboxapi.com/dropbox-api/api-reference/user-endpoints/auth/token-revoke),
[Windows Credential Manager](https://learn.microsoft.com/en-us/windows/win32/api/wincred/nf-wincred-credwritew).
