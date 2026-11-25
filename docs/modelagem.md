# Decisões de modelagem

O escopo é o **acompanhamento contínuo de atitudes por estudante**. Um professor registra uma nota de 1 a 5 em uma categoria e em um instante específico. A interface consulta o histórico e calcula resumos; este marco não inclui escrita ou autenticação.

## Do conceito ao contrato

| Conceito | Tipo de domínio | Tabela | Papel |
| --- | --- | --- | --- |
| Estudante | `Student` | `students` | Identificação, matrícula, vínculo de turma e situação. |
| Turma | `Classroom` | `classrooms` | Agrupamento dos estudantes por nome e ano letivo. |
| Professor | `Teacher` | `teachers` | Autoria de cada avaliação. |
| Categoria | `AttitudeCategory` | `attitude_categories` | Dimensão da atitude e sua descrição pedagógica. |
| Avaliação | `AttitudeAssessment` | `attitude_assessments` | Encontro de estudante, professor e categoria em uma data, com nota e observação. |

Todos os atributos de cada classe aparecem em `src/types/domain.ts`. O banco utiliza `snake_case`, enquanto o domínio utiliza `camelCase`: por exemplo, `classroom_id` corresponde a `classroomId`, e `assessed_at` corresponde a `assessedAt`. Essa conversão fica na futura camada de acesso ao banco, não nos componentes.

## Associações e cardinalidades

| Associação | Cardinalidade | Justificativa |
| --- | --- | --- |
| Turma - estudante | `1` para `0..*` | Uma turma pode existir sem alunos; cada aluno tem uma turma obrigatória. |
| Estudante - avaliação | `1` para `0..*` | Um aluno pode não ter sido avaliado; toda avaliação pertence a exatamente um aluno. É composição. |
| Professor - avaliação | `1` para `0..*` | Um professor pode não ter avaliações; toda avaliação tem exatamente um autor. |
| Categoria - avaliação | `1` para `0..*` | Uma categoria pode ainda não ter sido usada; cada avaliação mede uma única dimensão. |

A turma de um estudante inativo ou transferido preserva o último vínculo conhecido. Não há histórico de matrículas ou transferências neste recorte. Professores não são vinculados diretamente a turmas: a autoria das avaliações é suficiente para o marco; a futura autorização por turma exigirá uma associação própria.

A composição faz com que a exclusão física de um estudante remova suas avaliações (`ON DELETE CASCADE`). Nas demais associações, `ON DELETE RESTRICT` impede remover referências ainda utilizadas. Isso descreve a integridade do modelo, não uma operação de exclusão oferecida pela interface.

## Atributos e invariantes

- `Student` contém somente identificação, nome, matrícula, turma, situação e timestamps. Nome e matrícula não são opcionais. Matrículas são únicas na escola; o nome não é único.
- `status` aceita somente `active`, `inactive` ou `transferred`. O tipo usa uma união de literais e o banco usa `CHECK`.
- `score` é uma nota inteira de 1 a 5. O tipo `AttitudeScore` impede valores fora da escala no código; `CHECK` protege o banco. Médias são calculadas a partir das notas e não são persistidas, evitando divergência entre valores derivados e registros de origem.
- `observation` é o único atributo anulável: o professor pode registrar uma avaliação sem comentário. No domínio ele está sempre presente, com `string | null`; ausência de observação é `null`, e não uma propriedade omitida.
- `assessedAt` representa o momento pedagógico da avaliação; `createdAt` representa o momento em que o registro foi criado. Eles podem ser diferentes.
- Todos os registros possuem `createdAt` e `updatedAt`. O transporte usa strings ISO 8601 em UTC, terminadas em `Z`; o banco usa `TIMESTAMPTZ` e atualiza `updated_at` por trigger.
- A identificação conceitual é um `Identificador` no UML; a implementação escolhe `UUID` no banco. A turma tem ano letivo inteiro entre 2000 e 2100.
- `email` identifica unicamente um professor neste recorte. A categoria tem nome único, e uma turma é identificada naturalmente pelo par `(name, school_year)`.

## Consultas e índices

O índice `students(classroom_id, status)` atende à combinação de filtros de turma e situação. O índice `attitude_assessments(student_id, assessed_at DESC)` atende ao histórico cronológico de um estudante. Os índices em `teacher_id` e `category_id` permitem consultar autoria e dimensões avaliadas e ajudam a verificar as referências.

As consultas mock devolvem cópias, mantendo os dados de origem imutáveis. A latência simulada permite observar carregamento, erro, vazio e sucesso. Os cenários de demonstração são um recurso de verificação da interface e não uma característica das entidades do domínio.

## Artefatos reproduzíveis

- UML: fonte `docs/diagrams/uml.dot`, imagem exigida `public/uml.png` e alternativa vetorial `public/uml.svg`.
- DER: fonte `docs/diagrams/der.dot`, imagem exigida `public/der.png` e alternativa vetorial `public/der.svg`.
- SQL correspondente: `database/schema.sql`.
- Regeneração: instale o Graphviz e execute `python3 scripts/generate-diagrams.py`. O script não requer dependências Python adicionais e rejeita PNGs com largura inferior a 1920 pixels.

O UML usa tipos conceituais e multiplicidades nos dois lados das associações. O DER acrescenta tipos PostgreSQL, PKs, FKs, nulabilidade, unicidade, verificações, índices e regras de exclusão. Os dois diagramas têm fundo branco e exportações em alta resolução.

## Limites para as próximas etapas

Períodos avaliativos, matrícula histórica, recuperação, permissões por turma, responsáveis, anexos, relatórios oficiais, autenticação, políticas RLS e Server Actions ficam para os próximos marcos. A escala de 1 a 5 é uma convenção demonstrativa, não um regulamento de uma instituição real. O professor é uma entidade do domínio; sua futura conta de autenticação deverá ser associada sem misturar credenciais ao modelo apresentado.
