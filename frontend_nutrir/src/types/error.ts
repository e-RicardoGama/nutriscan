// arquivo: src/types/error.ts

// Esta interface descreve um único erro de validação do FastAPI
export interface ValidationError {
  loc: (string | number)[]; // Onde o erro ocorreu (ex: ["body", "file"])
  msg: string;             // A mensagem de erro
  type: string;            // O tipo do erro (ex: "value_error")
}

// A resposta completa de um erro 422 geralmente contém um campo "detail" com um array desses erros
export interface HttpValidationError {
  detail: ValidationError[];
}