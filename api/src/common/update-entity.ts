import { TableClient } from "@azure/data-tables";

export default function updateEntity(tableClient: TableClient, entity: any) {
    return tableClient.upsertEntity(entity);
}