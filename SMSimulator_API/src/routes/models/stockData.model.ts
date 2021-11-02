export interface StockDataModel {
    symbol?: string;
    name: string;
    price: Number;
    sector: string;
    favorability?: number;
}