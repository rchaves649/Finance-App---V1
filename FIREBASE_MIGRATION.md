
# Roadmap de Migração: FinanceConnect -> Firebase

Este documento descreve a estratégia técnica para migrar a persistência local (LocalStorage) para uma infraestrutura escalável utilizando Google Firebase.

## Status Atual
- **Persistência**: `localStorage` via Repositórios Síncronos.
- **Identidade**: Escopos estáticos definidos em código.
- **Lógica de Inicialização**: Executada no `useEffect` dos Containers de UI.

---

## Fase 1: Autenticação e Segurança
- [ ] **Firebase Auth**: Implementar login via Google/Email.
- [ ] **User Profile**: Criar documento `/users/{uid}` para armazenar preferências e IDs de escopos vinculados.
- [ ] **Security Rules**: 
  - Garantir que um usuário só leia transações de escopos onde seu `uid` está na lista de `authorizedUsers`.

## Fase 2: Evolução da Camada de Dados (Repositories)
- [ ] **Async Refactor**: Mudar as assinaturas das interfaces para `Promise<T>`.
- [ ] **Firestore Implementation**: Criar `FirestoreCategoryRepository`, `FirestoreTransactionRepository`, etc.
- [ ] **Real-time Sync**: Implementar `onSnapshot` nos repositórios para refletir mudanças entre parceiros instantaneamente.

## Fase 3: Categorias e Taxonomia (Detalhamento)
- [ ] **Coleção de Categorias**: `/scopes/{scopeId}/categories/{categoryId}`.
- [ ] **Server-Side Seeding**: Criar Cloud Function `onCreateScope` para injetar categorias padrão via `WriteBatch`.
- [ ] **Migration Service**: Script para upload de categorias personalizadas do `localStorage` para a nuvem no primeiro login.

## Fase 4: Lançamentos e Gestão de Gastos (Crítico)
Esta fase foca na tela de "Lançamentos" para garantir que o app não fique lento com o tempo.

- [ ] **[T-01] Paginação e Filtros de Servidor**:
  - Parar de usar `getAll()`. Implementar consultas com `.where('date', '>=', start)`.
  - Criar índices compostos no Firestore: `scopeId` + `date` (desc) + `isConfirmed`.
- [ ] **[T-02] Escrita em Lote (Batch Writes)**:
  - **Importação CSV**: Adaptar `TransactionService.saveTransactions` para usar `db.batch()`. O Firestore limita 500 documentos por lote; implementar lógica de chunking para arquivos grandes.
  - **Entrada Manual**: Enviar todas as linhas do rascunho em uma única chamada atômica.
- [ ] **[T-03] Transações de Movimentação (Shared -> Individual)**:
  - Ao mover um gasto da conta conjunta para a individual, usar `runTransaction()` para garantir que a atualização no escopo A e a criação no escopo B ocorram juntas ou falhem juntas.
- [ ] **[T-04] Auditoria de Confirmação**:
  - Adicionar campos `confirmedBy (uid)` e `confirmedAt (timestamp)` para saber qual parceiro validou o gasto no escopo compartilhado.

## Fase 5: Inteligência e Aprendizado (Sync)
- [ ] **Global Memory**: Mover o `fc_classification` para uma coleção global (ou por escopo) no Firestore.
- [ ] **Shared Learning**: Garantir que, se a "Pessoa A" ensinar que "Uber" é "Transporte", o app da "Pessoa B" já sugira isso automaticamente.

---

## Notas de Arquitetura (Zero Regressão)
1. **Interfaces como Contrato**: Não alteraremos os componentes React. Alteraremos apenas os objetos injetados nos Containers.
2. **Aritmética de Centavos**: O Firestore deve armazenar `amount` como número, mas cálculos de Dashboard devem continuar usando a lógica de centavos para evitar bugs de precisão.
3. **Offline-First**: Ativar `enableIndexedDbPersistence` no SDK do Firebase para que a tela de Lançamentos funcione instantaneamente mesmo em conexões 3G oscilantes.
