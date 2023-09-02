import { TableClient } from "@azure/data-tables";

export default function getEntity(tableClient: TableClient, partitionKey: string, rowKey: string) {
    return tableClient.getEntity(partitionKey, rowKey);
}