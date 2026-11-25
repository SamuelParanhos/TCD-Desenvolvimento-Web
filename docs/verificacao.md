# Verificação do marco

Esta matriz relaciona os critérios do enunciado aos arquivos e às verificações correspondentes. A existência de um arquivo não substitui a execução dos comandos ou a conferência da interface. Resultados registrados abaixo devem se referir a execuções efetivamente observadas.

## Critérios por artefato

| Artefato | Critério | Evidência ou forma de conferência |
| --- | --- | --- |
| UML | `Student` central e entidades da avaliação presentes | `public/uml.png`: cinco entidades; comparar atributos com `src/types/domain.ts`. |
| UML | Multiplicidades nas duas extremidades | Quatro relações com `1` e `0..*`; composição estudante-avaliação com losango preenchido. |
| UML | Independência de tecnologia | Tipos conceituais: Identificador, Texto, Ano, Data e hora; sem tipos SQL ou frameworks. |
| UML | PNG legível no caminho exigido | `public/uml.png`; inspecionar visualmente e executar `npm run diagrams`. |
| DER | UUID PK e `created_at TIMESTAMPTZ` em toda tabela | `public/der.png` e `database/schema.sql`. |
| DER | Unicidade e índices de consultas | Matrícula, e-mail, nome de categoria e par turma/ano; índices de turma/status e histórico por estudante. |
| DER | FKs, composição e restrições de escala/status | FK estudante com `CASCADE`, demais com `RESTRICT`; `CHECK` nota 1 a 5 e três status. |
| DER | PNG legível no caminho exigido | `public/der.png`; fundo branco e largura mínima de 1920 px. |
| Tipos | Um tipo por entidade e campos correspondentes | `src/types/domain.ts`: `Student`, `Classroom`, `Teacher`, `AttitudeCategory`, `AttitudeAssessment`. |
| Tipos | Uniões de literais, `ActionResult<T>` e ausência de `any` | Inspecionar `domain.ts`; `StudentStatus`, `AttitudeScore` e resultado discriminado por `ok`. |
| Tipos | Compilação sem erros | Executar `npx tsc --noEmit`. |
| Mock | Dados fictícios, readonly e coerentes com tipos | `src/lib/data/students.ts`; `satisfies Student`, array e objetos congelados. |
| Mock | Quantidade e diversidade de status | 18 estudantes: 14 ativos, dois inativos e dois transferidos. |
| Mock | IDs UUID e datas ISO 8601 com `Z` | Conferir testes de invariantes em `tests/domain.test.ts`. |
| Consultas | `listStudents` e `getStudent` async/Promise | `src/lib/data/index.ts`. |
| Consultas | Latência entre 500 e 1000 ms | `MOCK_DELAY_MS = 650`; testar antes e depois do prazo simulado. |
| Consultas | Cópias isoladas e `null` para ID ausente | Testar alteração de retorno sem afetar origem e consulta de UUID desconhecido. |
| StudentCard | Props tipadas e nome/matrícula/status legível | `StudentCardProps` e renderização de `StudentCard`. |
| StudentCard | HTML semântico, rótulos acessíveis e sem busca/estado | `article`, `header`, `dl`; sem `useEffect`, `useState` e consultas; link de perfil com rótulo. |
| StudentsPage | Quatro estados distintos | Roteiro manual abaixo: carregamento, sucesso, vazio e erro. |
| StudentsPage | Cleanup, chave estável e sem estado derivado | `cancelled` no cleanup, `key={student.id}`; filtros e resumos calculados. |
| StudentsPage | Regiões de mensagem acessíveis | Carregamento/vazio com `role="status"`; erro com `role="alert"`. |
| Entrega | README com escopo, integrantes, execução, árvore, decisões e PNGs | `README.md`; os quatro integrantes estão identificados. Publicação pública ainda pendente. |
| Entrega | Repositório público com código e diagramas | Pendente até existir URL pública e acesso externo confirmado. |

## Comandos reproduzíveis

Com as dependências instaladas:

```bash
npx tsc --noEmit
npm run build
```

Para regenerar os diagramas, com Python 3 e Graphviz:

```bash
npm run diagrams
```

O gerador valida o cabeçalho PNG e rejeita qualquer exportação com largura inferior a 1920 pixels. Abra ambos os PNGs após a regeneração para conferir visualmente textos, conexões e cardinalidades.

## Roteiro manual da interface

Inicie `npm run dev` e abra `http://localhost:3000/lab/students`.

| Passo | Ação | Resultado esperado |
| --- | --- | --- |
| 1 | Abrir ou atualizar a página | Mensagem de carregamento e placeholders antes dos cartões; espera simulada de 650 ms. |
| 2 | Aguardar o carregamento | 18 cartões, nomes, matrículas, três status e resumos coerentes. |
| 3 | Buscar `joao` | João Pedro Nascimento encontrado, mesmo sem digitar o acento. |
| 4 | Buscar uma matrícula completa | Apenas o estudante correspondente. |
| 5 | Combinar turma e status | Apenas estudantes que atendem aos dois critérios; contagem acompanha o resultado. |
| 6 | Buscar `nome-inexistente` | Mensagem de nenhum resultado e botão para limpar filtros. |
| 7 | Limpar filtros e inverter a ordenação | Lista completa e ordem alfabética inversa; sem alteração do mock original. |
| 8 | Abrir Laboratório da interface e clicar Simular lista vazia | Após carregamento, mensagem de nenhum estudante cadastrado com ação para restaurar. |
| 9 | Clicar Simular erro | Após carregamento, mensagem de falha em região `role="alert"`. |
| 10 | Clicar Tentar novamente | Novo carregamento e retorno à listagem de sucesso. |
| 11 | Alternar rapidamente os cenários | Somente a consulta atual deve determinar o estado final; respostas antigas são ignoradas. |
| 12 | Clicar Carregar dados e navegar antes da resposta | A saída da página não aplica respostas antigas em componentes desmontados. |
| 13 | Abrir Ver perfil de Ana Clara Ribeiro | Nome, turma e cinco avaliações vinculadas à estudante, com média correspondente. |
| 14 | Abrir perfil de Sofia Azevedo | Ausência de avaliações apresentada explicitamente; nenhuma média zero inventada. |
| 15 | Abrir `/lab/student?id=40000000-0000-4000-8000-999999999999` | Mensagem de estudante não encontrado; consulta retorna `null`. |
| 16 | Exportar uma lista filtrada | Arquivo CSV contém cabeçalhos e apenas os estudantes visíveis. |
| 17 | Navegar por Avaliações e Modelo de domínio | Páginas funcionais; PNGs carregam e podem ser consultados. |
| 18 | Usar Tab, Enter e o link Pular para o conteúdo | Foco visível e acesso aos controles sem depender do mouse. |
| 19 | Redimensionar para celular e ampliar o texto | Navegação, filtros e cartões permanecem legíveis; sem sobreposição de conteúdo. |

Para testar um dado inválido sem editar os mocks compartilhados, os testes automatizados passam objetos incompletos ao validador. Remover um campo obrigatório diretamente do mock também deve ser detectado pelo TypeScript; por isso o laboratório usa uma rejeição controlada para verificar o estado de erro sem deixar o projeto inválido.

## Evidências registradas

- Diagramas inspecionados visualmente: fundo branco, cinco entidades, atributos e multiplicidades legíveis.
- Verificação automatizada realizada: **28 testes aprovados**, sendo 22 de domínio/consultas e seis de apresentação sem navegador. Os testes verificam status, semântica, rótulos acessíveis, carregamento, vazio e erro, além dos contratos dos mocks. A latência foi verificada com relógio simulado.
- `npm run typecheck` e `npm run build`: aprovados no projeto integrado. As rotas `/`, `/lab/students`, `/lab/student`, `/lab/assessments` e `/lab/model` foram compiladas e pré-renderizadas pelo Next.js.
- SQL: script aplicado em PostgreSQL 18.7 descartável, em modo de usuário único. O teste complementar `tests/schema-smoke.sql` verifica 13 condições, incluindo defaults, unicidade, CHECKs, FKs, RESTRICT, CASCADE e atualização do timestamp. A interface continua usando somente mocks.
- Navegador e teste visual da interface: **pendentes de verificação manual**. O ambiente bloqueou o servidor local com `listen EPERM` e a inicialização do Chromium com `setsockopt: Operation not permitted`. Não houve sessão funcional da interface no navegador; os testes de componentes renderizam HTML e não comprovam cliques, efeitos, responsividade ou foco real. Use o roteiro acima em um terminal local sem essas restrições.
- Node.js utilizado na verificação: 26.13.1; npm 12.2.2. A versão recomendada para executar o projeto é Node.js 24, conforme `.nvmrc`.
- Integrantes: Allan Pinto Martins, Felipe Pereira Madureira, Gabriel Lima Castro Forte e Samuel de Paula Paranhos, conforme informado pela equipe.
- Publicação: aguardando repositório público de destino e confirmação de acesso.

### Verificação opcional do SQL

Com PostgreSQL disponível, use exclusivamente um banco de desenvolvimento vazio e descartável:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f database/schema.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f tests/schema-smoke.sql
```

O primeiro comando cria o schema. O segundo executa verificações e reverte os registros de teste. O aplicativo não exige esses comandos para funcionar.
