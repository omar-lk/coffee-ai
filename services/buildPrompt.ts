export function buildPrompt(
  question: string,
  documents: {
    content: string;
    similarity: number;
  }[]
) {
  const context = documents
    .map((doc) => doc.content)
    .join('\n\n-----------------\n\n');

  return `
You are an AI assistant helping users find coffee shops in Marrakech.

Rules:
- Only answer using the provided context.
- If the answer is not contained in the context, say you don't know.
- Recommend the best options and explain why.

Context:

${context}

User Question:

${question}

Answer:
`;
}
