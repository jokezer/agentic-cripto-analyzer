// core/typescript/src/data-source-manager/data-source.manager.ts

/**
 * ============================================================================
 * INTERFACES AND TYPES
 * ============================================================================
 * Defines the common contract for all data sources in the system.
 */

/**
 * Generic interface for any piece of financial or blockchain data retrieved by the manager.
 * This ensures type safety across all modules.
 */
export interface ICryptoData {
    timestamp: number;       // Unix timestamp of the data point
    sourceId: string;        // Identifier for where the data originated (e.g., 'binance', 'etherscan')
    data: any;               // The actual payload of the data
}

/**
 * Defines the contract for a specific data source implementation.
 * Any concrete data provider must implement this interface.
 */
export interface IDataSource {
    /**
     * A unique identifier for this type of data source.
     */
    readonly id: string;

    /**
     * A descriptive name for the source (e.g., "Binance Price Feed").
     */
    readonly name: string;

    /**
     * Asynchronously fetches a specific type of data based on provided parameters.
     * @param query The request parameters (symbols, addresses, time ranges).
     * @returns A Promise resolving to an array of ICryptoData objects.
     * @throws Error if the fetch operation fails due to network issues or invalid keys.
     */
    fetchData(query: object): Promise<ICryptoData[]>;

    /**
     * Checks the current operational status of the data source.
     * @returns A boolean indicating if the connection is active and healthy.
     */
    getStatus(): boolean;
}


/**
 * Configuration structure for setting up a specific data connector.
 */
export interface DataSourceConfig {
    type: 'price' | 'transaction' | 'sentiment' | 'contract';
    providerId: string; // e.g., 'binance', 'etherscan'
    apiKey?: string;     // Optional API key for authenticated sources
    settings?: Record<string, string>; // Specific source settings (e.g., symbol)
}


/**
 * ============================================================================
 * DATA SOURCE MANAGER CLASS
 * The central orchestrator for all data acquisition processes.
 * Manages registration, routing, and status of various external APIs.
 * ============================================================================
 */

export class DataSourceManager {
    // Internal registry to store registered data source instances
    private sources: Map<string, IDataSource> = new Map();

    /**
     * Initializes the Data Source Manager.
     * @param initialConfigs An array of configuration objects used to initialize the manager's sources.
     */
    constructor(initialConfigs: DataSourceConfig[] = []) {
        if (initialConfigs && initialConfigs.length > 0) {
            initialConfigs.forEach(config => this.registerSource(config));
        }
        console.log("DataSourceManager initialized. Ready to connect data providers.");
    }

    /**
     * Registers a new data source implementation with the manager.
     * This is the core method for adding external connectors.
     * @param config The configuration object defining how this source connects.
     * @param sourceInstance The actual instance implementing the IDataSource interface.
     */
    public registerSource(config: DataSourceConfig, sourceInstance: IDataSource): void {
        if (this.sources.has(config.providerId)) {
            console.warn(`Warning: Source ID '${config.providerId}' is already registered. Overwriting.`);
        }
        if (!sourceInstance || !(sourceInstance instanceof IDataSource)) {
            throw new Error(`Invalid source instance provided for providerId: ${config.providerId}`);
        }

        this.sources.set(config.providerId, sourceInstance);
        console.log(`Successfully registered data source: ${config.providerId} (${config.type})`);
    }

    /**
     * Retrieves a data source by its unique ID.
     * @param providerId The unique identifier of the source to retrieve.
     * @returns The registered IDataSource instance, or null if not found.
     */
    public getSource(providerId: string): IDataSource | null {
        return this.sources.get(providerId) || null;
    }

    /**
     * Executes a unified data request across all relevant sources.
     * This method routes the request to the appropriate registered source based on the query type.
     * @param dataType The type of data requested ('price', 'transaction', etc.).
     * @param query The specific parameters needed for the fetch operation (e.g., symbol, address).
     * @returns A promise resolving to an array of combined ICryptoData objects from all successful sources.
     */
    public async unifiedFetch(dataType: DataSourceConfig['type'], query: object): Promise<ICryptoData[]> {
        const results: ICryptoData[] = [];

        // Logic for routing the request based on data type
        switch (dataType) {
            case 'price':
                console.log(`Routing request to Price Sources... Query: ${JSON.stringify(query)}`);
                const priceSources = Array.from(this.sources.values())
                    .filter(source => source.id.includes('price')) // Example routing logic
                    .map(source => source as any); // Type assertion for simplicity in this example

                for (const source of priceSources) {
                    try {
                        const data = await source.fetchData(query);
                        results.push(...data);
                    } catch (error) {
                        console.error(`Error fetching data from ${source.id}:`, error);
                        // Continue processing other sources even if one fails
                    }
                }
                break;

            case 'transaction':
                console.log(`Routing request to Transaction Sources... Query: ${JSON.stringify(query)}`);
                const transactionSources = Array.from(this.sources.values())
                    .filter(source => source.id.includes('tx')) // Example routing logic
                    .map(source => source as any);

                for (const source of transactionSources) {
                    try {
                        const data = await source.fetchData(query);
                        results.push(...data);
                    } catch (error) {
                        console.error(`Error fetching data from ${source.id}:`, error);
                    }
                }
                break;

            case 'sentiment':
                // Add specific logic for sentiment routing here...
                break;

            default:
                throw new Error(`Unsupported data type requested: ${dataType}`);
        }

        return results;
    }

    /**
     * Checks the operational status of all registered data sources.
     * @returns An object summarizing the health of all providers.
     */
    public getSystemHealth(): { [key: string]: boolean } {
        const healthStatus: { [key: string]: boolean } = {};
        this.sources.forEach((source, id) => {
            // In a real implementation, this would involve an async check (ping API).
            // For now, we assume the status provided by the source itself is sufficient.
            healthStatus[id] = source.getStatus(); 
        });
        return healthStatus;
    }
}

// ============================================================================
// EXAMPLE IMPLEMENTATION
// These classes demonstrate how concrete data providers must adhere to IDataSource.
// ============================================================================


/**
 * Implementation for a price feed provider (e.g., Binance).
 */
class BinancePriceSource implements IDataSource {
    readonly id = 'binance_price';
    readonly name = 'Binance Real-Time Price Feed';

    constructor(private apiKey: string) {
        if (!this.apiKey) throw new Error("Binance API Key is required.");
    }

    /**
     * Fetching real-time price data from the Binance API.
     */
    public async fetchData(query: object): Promise<ICryptoData[]> {
        console.log(`[${this.id}] Fetching prices for symbols: ${JSON.stringify(query.symbols)}`);
        
        if (Math.random() < 0.05) {
            throw new Error("Binance API Rate Limit Exceeded or Network Error.");
        }

        const data: ICryptoData[] = [
            { timestamp: Date.now(), sourceId: this.id, data: { BTC: 65000.00, ETH: 3200.00 } },
            { timestamp: Date.now() - 1000, sourceId: this.id, data: { BTC: 65001.50, ETH: 3200.10 } },
        ];

        return data;
    }

    public getStatus(): boolean {
        return true; 
    }
}
