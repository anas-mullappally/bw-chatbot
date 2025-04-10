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
  const { query, topK = 3 } = await req.json();

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    const queryEmbedding = await embeddings.embedQuery(query);
    const vectorResults = await index.query({
      topK,
      vector: queryEmbedding,
      includeMetadata: true,
      filter: { type: { $eq: "product" } },
    });
console.log(vectorResults)
    const filteredMatches = vectorResults.matches.filter(
      (match) => match.score > 0.1
    );

    const productIds = filteredMatches
      .map((match) => extractNumericId(match.id))
      .filter((id) => !isNaN(id));

    if (productIds.length === 0) {
      return Response.json([]);
    }

    const result = await client.query(
      `SELECT * FROM bw_product WHERE id = ANY($1::int[]) ORDER BY array_position($1::int[], id)`,
      [productIds]
    );

    const enrichedResults = result.rows.map((row) => {
      const match = filteredMatches.find((m) => m.id === `p-${row.id}`);
      return { ...row, similarityScore: match?.score || 0 };
    });

    return Response.json(enrichedResults);
  } catch (error) {
    console.error("Product search error:", error);
    return new Response("Internal Server Error", { status: 500 });
  } finally {
    await client.end();
  }
}
