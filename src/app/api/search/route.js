import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Client } from "pg";

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pinecone.Index("buildingworld");

const embeddings = new OpenAIEmbeddings({
  modelName: "text-embedding-3-small",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

function extractNumericId(prefixedId) {
  return parseInt(prefixedId.split("-")[1]);
}

export async function POST(req) {
  const { query, topK = 3, productType, category } = await req.json();

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  const selectedType = productType?.toLowerCase();

  try {
    await client.connect();

    const queryEmbedding = await embeddings.embedQuery(query);
    const vectorResults = await index.query({
      topK,
      vector: queryEmbedding,
      includeMetadata: true,
      filter: {
        category: { $eq: category },
      },
    });

    const filteredMatches = vectorResults.matches.filter(
      (match) => match.score > 0.1
    );

    const ids = filteredMatches
      .map((match) => extractNumericId(match.id))
      .filter((id) => !isNaN(id));

    if (ids.length === 0) {
      return Response.json([]);
    }

    const sqlQuery =
      selectedType === "products"
        ? `SELECT * FROM bw_product WHERE id = ANY($1::int[]) ORDER BY array_position($1::int[], id)`
        : `SELECT * FROM bw_idea WHERE id = ANY($1::int[]) ORDER BY array_position($1::int[], id)`;

    const result = await client.query(sqlQuery, [ids]);

    const enrichedResults = result.rows.map((row) => {
      const match = filteredMatches.find(
        (m) => m.id === `i-${row.id}` || m.id === `p-${row.id}`
      );
      return { ...row, similarityScore: match?.score || 0 };
    });

    return Response.json(enrichedResults);
  } catch (error) {
    console.error("Idea search error:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await client.end();
  }
}
