# Lógicas do Sistema - FinanceConnect

Este documento detalha as regras de negócio, algoritmos e comportamentos esperados de cada funcionalidade do aplicativo, servindo como guia para manutenção e evolução do software.

---

## 1. Lógicas da Página de Lançamentos (Transactions)

A tela de lançamentos é o motor de entrada de dados do sistema. Sua principal complexidade reside em transformar dados brutos (CSV ou entrada manual) em informações categorizadas e prontas para análise.

### 1.1. Detalhamento da Natureza (Nature) e Critérios de Identificação

A **Natureza** dita o comportamento contábil. A identificação ocorre em duas camadas: **Palavras-chave (Estático)** e **Algoritmo de Contexto (Dinâmico)**.

#### 1.1.1. ESTORNO (Refund)
O sistema busca neutralizar lançamentos que representam devoluções de dinheiro, evitando que o "Total de Gastos" seja inflado artificialmente.

**Critérios de Identificação:**
1.  **Identificação Direta (Linguística)**: Busca por termos explícitos na descrição: `ESTORNO`, `REEMBOLSO`, `DEVOLUCAO`, `CANCELAMENTO`, `REVERSAO`, `AJUSTE REF`.
2.  **Identificação por Sinal (Sinal Positivo)**: No processamento de CSVs, valores que entram como positivos em colunas de débito são marcados inicialmente como candidatos a estorno.
3.  **Algoritmo de Detecção de Pares (Média Confiança)**: Durante a importação, o sistema executa uma varredura em busca de "Gêmeos Opostos":
    *   **Igualdade Absoluta**: Procura dois lançamentos onde `|Valor A| === |Valor B|`.
    *   **Sinais Opostos**: Um deve ser negativo (saída) e o outro positivo (entrada).
    *   **Janela Temporal**: Devem ter ocorrido em um intervalo de até **15 dias**.
    *   **Fuzzy Match de Descrição**: As descrições devem ser similares (ex: "UBER TRIP" e "UBER TRIP ESTORNO" ou possuírem os primeiros 10 caracteres idênticos). Se o par for encontrado, o lançamento positivo é automaticamente classificado como Estorno.

#### 1.1.2. PARCELADO (Installment Expense)
Identifica comprometimentos de médio/longo prazo.

**Critérios de Identificação:**
1.  **Padrão Numérico (Regex)**: O sistema utiliza a expressão regular `/\d{1,2}\/\d{1,2}/` para encontrar indicadores de parcelas no texto (ex: `01/10`, `5/12`, `1/2`).
2.  **Identificação por Termos**: Busca por prefixos como `PARC`, `PARCELA`, `PARCELAMENTO`.
3.  **Impacto Contábil**: Diferente de outros sistemas que tentam projetar o valor total da compra, o FinanceConnect foca no **fluxo de caixa real**. A despesa parcelada é somada ao total de gastos **do mês em que a parcela aparece no extrato**, permitindo uma visão fiel do que saiu da conta naquele período.

#### 1.1.3. PAGAMENTO DE FATURA (Payment)
Essencial para evitar a "Duplicidade Bancária".

**Critérios de Identificação:**
*   Busca por termos de liquidação de cartão: `PAGAMENTO FATURA`, `PAGTO CARTAO`, `LIQUIDACAO`, `PAGAMENTO RECEBIDO`.
*   **Regra de Ouro**: Estes lançamentos são marcados como **Excluídos do Resumo** por padrão. Como os itens individuais da fatura já foram (ou serão) importados, somar o pagamento da fatura causaria um erro de contagem dupla no Dashboard.

#### 1.1.4. OUTRAS NATUREZAS
*   **DESPESA (Expense)**: Fallback padrão para qualquer saída de valor que não se encaixe nos critérios acima.
*   **CRÉDITO (Credit)**: Identificado por termos como `TRANSFERENCIA RECEBIDA`, `PIX RECEBIDO`, `SALARIO`, `PROVENTOS`. Tratado como dado informativo (não abate gastos).

### 1.2. Motor de Classificação Inteligente (Classification Engine)
O sistema utiliza uma lógica de aprendizado incremental baseada no histórico do usuário.

1.  **Normalização**: Antes de comparar, o sistema remove acentos, espaços extras e caracteres especiais das descrições para gerar uma `normalizedKey`.
2.  **Estados de Classificação (UI: "Classificação")**:
    *   **PENDING (Pendente)**: Transações importadas sem correspondência no histórico. Não são somadas no dashboard até que o usuário defina uma categoria.
    *   **AUTO (Automático)**: Sugestão baseada em aprendizado anterior ou regras de recorrência. Indica que o sistema "tomou a decisão" por você.
    *   **MANUAL (Manual)**: Atribuído quando o usuário cria o gasto manualmente ou altera uma sugestão do sistema. Indica validação humana definitiva.

### 1.3. Gestão de Escopos (Shared vs. Individual)
O FinanceConnect permite que uma transação "navegue" entre diferentes contextos financeiros.

*   **Escopo Compartilhado**: Ativa a lógica de **Split (Divisão)**. O sistema utiliza aritmética de centavos (`toCents/fromCents`) para garantir que a soma das partes seja rigorosamente igual ao total, evitando erros de arredondamento de ponto flutuante.
*   **Mover para Individual**: A transação recebe a flag `migratedFromShared`. Ela deixa de somar no total conjunto mas permanece na lista (com opacidade reduzida) para fins de conferência, indicando que um dos parceiros assumiu o gasto integralmente.

### 1.4. Validação de Entrada Manual (Manual Batch)
*   **Draft State**: Itens em rascunho.
*   **Validação Atômica**: O botão "Salvar" só é habilitado se todas as linhas ativas possuírem: Data, Descrição (min. 2 chars), Valor > 0, Categoria e Subcategoria.
*   **Atalhos**: `Enter` na última célula válida dispara a criação de uma nova linha limpa, herdando a data da linha anterior para agilizar preenchimentos de um mesmo dia.

---

## 2. Lógicas do Dashboard (Insights)

### 2.1. Baseline e Médias
*   O sistema calcula a média dos últimos 3 meses (excluindo o atual) para definir o "Custo de Vida Base".
*   Variações acima de 10% em relação à média disparam alertas visuais no painel de Insights.

### 2.2. Separação Fixo vs. Variável
*   **Custos Fixos**: Identificados por categorias específicas (`Moradia`, `Educação`).
*   **Custos Variáveis**: Todo o restante. A análise de responsabilidade do casal foca prioritariamente nos custos variáveis para identificar quem está gerando flutuações no orçamento.

---

## 3. Próximos Tópicos (Roadmap de Documentação)
*   [ ] Regras de Segurança e Acesso (RBAC).
*   [ ] Algoritmos de Sugestão de IA via Gemini API.