import { Pool } from "pg";

export class DbService {
  private pool: Pool;

  constructor(connectionString: string) {
    // Initialize the PostgreSQL connection pool
    this.pool = new Pool({
      connectionString, // Use the provided connection string
    });

    // Optional: Log errors if the pool encounters them
    this.pool.on("error", (err: Error) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1); // Exit the app in case of fatal errors
    });
  }

  async query(queryText: string, params?: any[]): Promise<any> {
    try {
      // Acquire a client from the pool
      const client = await this.pool.connect();

      try {
        // Execute the query and return the result
        const result = await client.query(queryText, params);
        return result.rows; // Return rows directly
      } finally {
        // Release the client back to the pool
        client.release();
      }
    } catch (error) {
      console.error("Error executing query:", error);
      throw error;
    }
  }

  async close(): Promise<void> {
    // Gracefully close the pool when shutting down the app
    await this.pool.end();
  }
}
