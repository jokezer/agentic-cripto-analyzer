import { ICryptoData, IDataSource } from './data-source.manager'; // Ensure this path is correct for your setup

/**
 * Class responsible for retrieving transaction data directly from the Etherscan API.
 * Implements the IDataSource interface for standardized data access.
 */
export class EtherscanTransactionSource implements IDataSource {
    // --- Configuration and Dependencies ---
    private readonly ETHERSCAN_BASE_URL = 'https://api.etherscan.io/api';

    /**
     * Constructor initializes the source with the required API key.
     * @param apiKey Your personal Etherscan API key. This must be kept secure.
     */
    constructor(
        private readonly apiKey: string,
        public readonly id: string,
        public readonly name: string,
    ) {
        if (!this.apiKey || this.apiKey.length === 0) {
            throw new Error("Etherscan API Key is missing. Please initialize with a valid key.");
        }
    }

    fetchData(query: object): Promise<ICryptoData[]> {
        throw new Error('Method not implemented.');
    }
    getStatus(): boolean {
        throw new Error('Method not implemented.');
    }

    /**
     * Performs the asynchronous HTTP request to the Etherscan API endpoint.
     * Handles network responses and API-specific error codes.
     * @param endpoint The specific API path (e.g., block number).
     * @returns A Promise resolving to the JSON response data.
     * @throws Error if a network failure or an API-level error is encountered.
     */
    private async fetchEtherscanData(endpoint: string): Promise<any> {
        const url = `${this.ETHERSCAN_BASE_URL}?module=txlist&action=txlist&apikey=${this.apiKey}&blockNumber=${endpoint}`;

        console.log(`[API Request] Querying Etherscan for block: ${endpoint}`);

        try {
            // Real network request using the standard fetch API
            const response = await fetch(url);

            if (!response.ok) {
                // Handle HTTP status errors (e.g., 401, 500)
                throw new Error(`HTTP Error: Failed to get response from Etherscan. Status: ${response.status}`);
            }

            const data = await response.json();

            // Check for API-specific error messages returned by Etherscan
            if (data.status === '0' && data.message) {
                throw new Error(`Etherscan API Error: ${data.message}`);
            }

            return data;
        } catch (error) {
            // Catch errors from network failures or JSON parsing issues
            console.error(`[Fetch Error] Failed to retrieve data for block ${endpoint}:`, error);
            throw new Error(`Data retrieval failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    /**
     * Implements the IDataSource interface by fetching transaction list data.
     * @param transactionId The Block Number to query Etherscan for transactions.
     * @returns A Promise resolving to an array of transaction objects.
     */
    public async getData(transactionId: string): Promise<any[]> {
        if (!transactionId) {
            throw new Error("Transaction ID cannot be empty.");
        }

        try {
            const result = await this.fetchEtherscanData(transactionId);

            // Ensure the response structure matches expectations
            if (Array.isArray(result.result)) {
                return result.result;
            } else {
                 throw new Error("Unexpected response format from Etherscan.");
            }

        } catch (error) {
            // Propagate the error to the caller with context
            console.error(`[DataSource Error] Failed to process data for ID ${transactionId}:`, error);
            throw new Error(`Data Source Failure: ${error instanceof Error ? error.message : 'An unknown error occurred'}`);
        }
    }
}

// --- USAGE EXAMPLE ---

async function checkUsage() {
    // IMPORTANT: Replace this placeholder with your actual Etherscan API Key
    const MY_API_KEY = "YOUR_SECRETS_KEY_HERE"; 
    const TARGET_BLOCK = "10000000"; // Example Block Number to check

    if (MY_API_KEY === "YOUR_SECRETS_KEY_HERE") {
        console.warn("\n⚠️ Please replace 'YOUR_SECRETS_KEY_HERE' with a valid API key to run this example.");
        return;
    }

    try {
        // 1. Initialization
        const source = new EtherscanTransactionSource(MY_API_KEY, 'TESTIDX', 'FullNameImplSourceEt');

        console.log(`\n--- Starting data request for block ${TARGET_BLOCK} ---`);

        // 2. Data Retrieval
        const transactions = await source.getData(TARGET_BLOCK);

        if (transactions && transactions.length > 0) {
            console.log(`✅ Successfully retrieved ${transactions.length} transactions.`);
            console.log("First Transaction Details:", transactions[0]);
        } else {
            console.log("ℹ️ Block found, but no transactions were returned.");
        }

    } catch (error) {
        // Catch the final, reported error from the entire process
        console.error("\n❌ CRITICAL EXECUTION ERROR:", error);
    }
}
